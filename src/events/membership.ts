import type { ChatMember } from "grammy/types";
import type { Context, Filter } from "grammy";
import type { Config } from "../config.js";
import { boasVindasGrupo } from "../data/textos.js";
import type { Logger } from "../logger.js";

const FORA: ReadonlyArray<ChatMember["status"]> = ["left", "kicked"];
const DENTRO: ReadonlyArray<ChatMember["status"]> = ["member", "administrator", "creator"];

export function foiAdicionado(antes: ChatMember["status"], depois: ChatMember["status"]): boolean {
  return FORA.includes(antes) && DENTRO.includes(depois);
}

export function foiRemovido(antes: ChatMember["status"], depois: ChatMember["status"]): boolean {
  return !FORA.includes(antes) && FORA.includes(depois);
}

/** Administradores não estão sujeitos ao modo lento do grupo. */
function ehAdmin(status: ChatMember["status"]): boolean {
  return status === "administrator" || status === "creator";
}

/** Dá boas-vindas quando o bot entra em um grupo e registra quando sai. */
export function createMembershipHandler(config: Config["pow"], logger: Logger) {
  return async (ctx: Filter<Context, "my_chat_member">): Promise<void> => {
    const { chat, old_chat_member, new_chat_member, from } = ctx.myChatMember;
    if (chat.type !== "group" && chat.type !== "supergroup") return;

    const log = logger.child({ chatId: chat.id, chatTitle: chat.title, userId: from.id });

    if (foiAdicionado(old_chat_member.status, new_chat_member.status)) {
      log.info("Bot adicionado ao grupo");

      let modoLento = false;
      if (!ehAdmin(new_chat_member.status)) {
        const info = await ctx.api.getChat(chat.id).catch((err) => {
          log.warn({ err }, "Não foi possível consultar o modo lento do grupo");
          return undefined;
        });
        modoLento = (info?.slow_mode_delay ?? 0) > 0;
        if (modoLento) {
          log.warn({ slowModeDelay: info?.slow_mode_delay }, "Grupo com modo lento e bot sem admin: o /pow não vai funcionar");
        }
      }

      await ctx.api.sendMessage(chat.id, boasVindasGrupo(ctx.me.first_name, config, modoLento));
    } else if (foiRemovido(old_chat_member.status, new_chat_member.status)) {
      log.info("Bot removido do grupo");
    }
  };
}
