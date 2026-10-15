/**
 * Textos de apresentação do bot. `nome` é o nome de exibição definido no @BotFather.
 * Limites do Telegram: descrição até 512 caracteres, descrição curta até 120.
 */

/** Exibida no chat privado vazio, em "O que este bot faz?". */
export function descricao(nome: string): string {
  return [
    `🎆 ${nome} — a queima de fogos do seu grupo!`,
    "",
    "Me adicione a um grupo e mande /pow: eu solto um fogo — bombinha, rojão, foguete ou bateria — " +
      "em forma de onomatopeia. tsss... FIIIIIUUUU... POW! 💥",
    "",
    "Qualquer pessoa do grupo pode soltar os fogos, e cada /pow é uma queima diferente. 🧨🚀",
  ].join("\n");
}

/** Exibida no perfil do bot e quando o link dele é compartilhado. */
export function descricaoCurta(): string {
  return "Solta fogos de artifício no seu grupo! 🎆 Mande /pow e prepare os ouvidos. 💥";
}

interface Queima {
  cooldownSeconds: number;
}

const TIPOS_DE_FOGO = "bombinha, rojão, foguete, bateria…";

function avisoCooldown({ cooldownSeconds }: Queima): string[] {
  if (cooldownSeconds <= 0) return [];
  return [
    "",
    `⏳ Depois de cada queima, os rojões levam ${cooldownSeconds}s pra recarregar.`,
  ];
}

/** Resposta ao /start no chat privado. */
export function boasVindasPrivado(
  nome: string,
  usuario: string | undefined,
  queima: Queima,
): string {
  return [
    usuario ? `Opa, ${usuario}! 🎆` : "Opa! 🎆",
    "",
    `Eu sou o ${nome}, o fogueteiro do Telegram.`,
    "",
    `🧨 /pow — solta um fogo diferente a cada vez: ${TIPOS_DE_FOGO}`,
    "",
    "Eu brilho mesmo é em grupo: me adicione a um e qualquer pessoa pode soltar os fogos.",
    "Quer testar? Manda um /pow aqui mesmo! 💥",
    ...avisoCooldown(queima),
  ].join("\n");
}

/** Enviada quando o bot entra em um grupo (e no /start dentro de grupos). */
export function boasVindasGrupo(nome: string, queima: Queima): string {
  return [
    "🎆 Chegou o fogueteiro! 🎆",
    "",
    `Valeu por me chamar, galera! Eu sou o ${nome}.`,
    `Sempre que quiserem comemorar, é só mandar /pow e eu solto um fogo: ${TIPOS_DE_FOGO} 🧨🚀💥`,
    ...avisoCooldown(queima),
  ].join("\n");
}
