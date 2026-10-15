import type { CommandContext, Context } from "grammy";
import type { Config } from "../config.js";
import { boasVindasGrupo, boasVindasPrivado } from "../data/textos.js";
import type { Logger } from "../logger.js";

export function createStartHandler(config: Config["pow"], logger: Logger) {
  return async (ctx: CommandContext<Context>): Promise<void> => {
    const nome = ctx.me.first_name;
    const text =
      ctx.chat.type === "private"
        ? boasVindasPrivado(nome, ctx.from?.first_name, config)
        : boasVindasGrupo(nome, config);

    logger.info({ chatId: ctx.chat.id, chatType: ctx.chat.type, userId: ctx.from?.id }, "/start");
    await ctx.reply(text);
  };
}
