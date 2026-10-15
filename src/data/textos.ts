/**
 * Textos de apresentação do bot. `nome` é o nome de exibição definido no @BotFather.
 * Limites do Telegram: descrição até 512 caracteres, descrição curta até 120.
 */

/** Exibida no chat privado vazio, em "O que este bot faz?". */
export function descricao(nome: string): string {
  return [
    `🎆 ${nome} — a queima de fogos do seu grupo!`,
    "",
    "Me adicione a um grupo e mande /pow: eu respondo com uma rajada de rojões, foguetes e bombinhas " +
      "em forma de onomatopeia. POW! PÁ PÁ PÁ! FIIIIIUUUU... KABUM! 💥",
    "",
    "Qualquer pessoa do grupo pode soltar os fogos, e cada /pow é uma queima diferente. 🧨🚀",
  ].join("\n");
}

/** Exibida no perfil do bot e quando o link dele é compartilhado. */
export function descricaoCurta(): string {
  return "Solta fogos de artifício no seu grupo! 🎆 Mande /pow e prepare os ouvidos. 💥";
}

interface Queima {
  minMessages: number;
  maxMessages: number;
  cooldownSeconds: number;
}

function faixaDeEstouros({ minMessages, maxMessages }: Queima): string {
  if (minMessages === maxMessages)
    return minMessages === 1 ? "1 estouro" : `${minMessages} estouros`;
  return `de ${minMessages} a ${maxMessages} estouros`;
}

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
    `🧨 /pow — solta uma rajada de fogos (${faixaDeEstouros(queima)})`,
    "",
    "Eu brilho mesmo é em grupo: me adicione a um e qualquer pessoa pode soltar os fogos.",
    "Quer testar? Manda um /pow aqui mesmo! 💥",
  ].join("\n");
}

/** Enviada quando o bot entra em um grupo (e no /start dentro de grupos). */
export function boasVindasGrupo(nome: string, queima: Queima): string {
  return [
    "🎆 Chegou o fogueteiro! 🎆",
    "",
    `Valeu por me chamar, galera! Eu sou o ${nome}.`,
    `Sempre que quiserem comemorar, é só mandar /pow e eu solto os fogos (${faixaDeEstouros(queima)}). 🧨🚀💥`,
    ...avisoCooldown(queima),
  ].join("\n");
}
