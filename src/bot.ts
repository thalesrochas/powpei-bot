import { autoRetry } from "@grammyjs/auto-retry";
import { Bot, GrammyError, HttpError } from "grammy";
import { createPowHandler, POW_COMMAND } from "./commands/pow.js";
import { createStartHandler } from "./commands/start.js";
import type { Config } from "./config.js";
import { createMembershipHandler } from "./events/membership.js";
import type { Logger } from "./logger.js";

export const COMMANDS = [POW_COMMAND];

export function createBot(config: Config, logger: Logger): Bot {
  const bot = new Bot(config.botToken);

  // Repete automaticamente requisições que esbarram no flood limit (429) ou em erros 5xx do Telegram.
  bot.api.config.use(autoRetry({ maxRetryAttempts: 3, maxDelaySeconds: 30 }));

  bot.command("start", createStartHandler(config.pow, logger));
  bot.command(POW_COMMAND.command, createPowHandler(config.pow, logger));
  bot.on("my_chat_member", createMembershipHandler(config.pow, logger));

  bot.catch(({ error, ctx }) => {
    const meta = { updateId: ctx.update.update_id, chatId: ctx.chat?.id };
    if (error instanceof GrammyError) {
      logger.error({ ...meta, code: error.error_code, description: error.description }, "Erro da API do Telegram");
    } else if (error instanceof HttpError) {
      logger.error({ ...meta, err: error.error }, "Falha de rede ao falar com o Telegram");
    } else {
      logger.error({ ...meta, err: error }, "Erro inesperado ao processar update");
    }
  });

  return bot;
}
