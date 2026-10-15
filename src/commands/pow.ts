import { GrammyError, type CommandContext, type Context } from "grammy";
import type { Config } from "../config.js";
import { Cooldown } from "../lib/cooldown.js";
import { gerarQueima } from "../lib/fireworks.js";
import { sleep } from "../lib/random.js";
import { RateWindow } from "../lib/rate-window.js";
import type { Logger } from "../logger.js";

export const POW_COMMAND = { command: "pow", description: "Solta os fogos! 🎆" } as const;

export function createPowHandler(config: Config["pow"], logger: Logger) {
  const cooldown = new Cooldown(config.cooldownSeconds * 1000);
  const orcamento = new RateWindow(config.maxMessagesPerMinute);

  return async (ctx: CommandContext<Context>): Promise<void> => {
    const chat = ctx.chat;
    const log = logger.child({
      chatId: chat.id,
      chatTitle: "title" in chat ? chat.title : undefined,
      userId: ctx.from?.id,
    });

    if (!cooldown.tryAcquire(chat.id)) {
      log.debug("/pow ignorado: fogo em andamento, cooldown ou chat bloqueado pelo Telegram");
      return;
    }

    let esperaMs = config.cooldownSeconds * 1000;
    try {
      const { fogo, disparos } = gerarQueima(config.maxMessages);

      // Só começa se o fogo inteiro cabe no orçamento do último minuto: nunca é cortado no meio.
      if (disparos.length > orcamento.available(chat.id)) {
        log.debug({ fogo, count: disparos.length }, "/pow ignorado: limite de mensagens por minuto do chat");
        return;
      }

      log.info({ fogo, count: disparos.length }, "/pow disparado");
      for (const { texto, pausaMs } of disparos) {
        if (pausaMs > 0) await sleep(pausaMs);
        await ctx.reply(texto);
        orcamento.record(chat.id);
      }
    } catch (err) {
      // 429 que o auto-retry não quis esperar (espera longa): para de tentar até o Telegram liberar.
      if (!(err instanceof GrammyError && err.error_code === 429)) throw err;

      const retryAfter = err.parameters.retry_after ?? 0;
      esperaMs = Math.max(esperaMs, retryAfter * 1000);
      log.warn(
        { retryAfter, liberaEm: new Date(Date.now() + retryAfter * 1000).toISOString() },
        "Telegram limitou o envio neste chat (excesso de mensagens ou modo lento); /pow pausado até a liberação",
      );
    } finally {
      // O cooldown começa quando o fogo termina (ou é interrompido).
      cooldown.release(chat.id, esperaMs);
    }
  };
}
