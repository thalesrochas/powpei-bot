import type { CommandContext, Context } from "grammy";
import type { Config } from "../config.js";
import { Cooldown } from "../lib/cooldown.js";
import { gerarQueima } from "../lib/fireworks.js";
import { sleep } from "../lib/random.js";
import type { Logger } from "../logger.js";

export const POW_COMMAND = { command: "pow", description: "Solta os fogos! 🎆" } as const;

export function createPowHandler(config: Config["pow"], logger: Logger) {
  const cooldown = new Cooldown(config.cooldownSeconds * 1000);

  return async (ctx: CommandContext<Context>): Promise<void> => {
    const chat = ctx.chat;
    const log = logger.child({
      chatId: chat.id,
      chatTitle: "title" in chat ? chat.title : undefined,
      userId: ctx.from?.id,
    });

    if (!cooldown.tryAcquire(chat.id)) {
      log.debug("/pow ignorado: fogo em andamento ou chat em cooldown");
      return;
    }

    try {
      const { fogo, disparos } = gerarQueima(config.maxMessages);
      log.info({ fogo, count: disparos.length }, "/pow disparado");

      for (const { texto, pausaMs } of disparos) {
        if (pausaMs > 0) await sleep(pausaMs);
        await ctx.reply(texto);
      }
    } finally {
      // O cooldown começa quando o fogo termina (mesmo que o envio tenha falhado no meio).
      cooldown.release(chat.id);
    }
  };
}
