import type { Bot } from "grammy";
import { descricao, descricaoCurta } from "./data/textos.js";
import type { Logger } from "./logger.js";

/**
 * Mantém a descrição e a descrição curta do bot iguais às definidas em `data/textos.ts`.
 * Só chama a API de escrita quando o texto mudou.
 */
export async function syncProfile(bot: Bot, logger: Logger): Promise<void> {
  const desejada = descricao(bot.botInfo.first_name);
  const desejadaCurta = descricaoCurta();

  const [{ description }, { short_description }] = await Promise.all([
    bot.api.getMyDescription(),
    bot.api.getMyShortDescription(),
  ]);

  if (description !== desejada) {
    await bot.api.setMyDescription(desejada);
    logger.info("Descrição do bot atualizada");
  }
  if (short_description !== desejadaCurta) {
    await bot.api.setMyShortDescription(desejadaCurta);
    logger.info("Descrição curta do bot atualizada");
  }
}
