import type { CommandContext, Context } from "grammy";
import type { Config } from "../config.js";
import { Cooldown } from "../lib/cooldown.js";
import { generateFireworks } from "../lib/fireworks.js";
import { randInt, sleep } from "../lib/random.js";
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
      log.debug("/pow ignorado: chat em cooldown");
      return;
    }

    const messages = generateFireworks(randInt(config.minMessages, config.maxMessages));
    log.info({ count: messages.length }, "/pow disparado");

    for (const [i, text] of messages.entries()) {
      if (i > 0) await sleep(randInt(config.delayMinMs, config.delayMaxMs));
      await ctx.reply(text);
    }
  };
}
