import type { Fogo } from "../lib/fireworks.js";

/**
 * Roteiros do /pow. Cada /pow sorteia um fogo (pelo `peso`) e percorre suas etapas em ordem;
 * cada etapa vira uma ou mais mensagens.
 *
 * Etapa:
 * - `textos`: opções sorteadas para a mensagem;
 * - `chance`: probabilidade (0–1) de a etapa acontecer — padrão 1 (sempre);
 * - `repete`: [mín, máx] de mensagens da etapa — padrão [1, 1];
 * - `pausa`: [mín, máx] em ms antes de cada mensagem da etapa — padrão [0, 0].
 *   A primeira mensagem do /pow sempre sai sem pausa.
 *
 * Para criar um fogo novo, basta adicionar um objeto à lista.
 */
export const FOGOS: readonly Fogo[] = [
  {
    nome: "bombinha",
    peso: 25,
    etapas: [
      { chance: 0.3, textos: ["tsss...", "tsc tsc...", "chhh..."] },
      {
        pausa: [600, 1200],
        textos: ["PÁ!", "BUM! 🧨", "PEI!", "POC!", "PIPOCO! 🧨", "POW! 💥", "TRAQUE! 🧨", "PUM!", "PLAU! ✨"],
      },
    ],
  },
  {
    nome: "rojão",
    peso: 25,
    etapas: [
      { textos: ["FIIIIIIUUUUUU 🚀", "VUUUUUSH...", "ZIIIIIIIM 🚀", "FIIIIIIIIIIIIIIIU 🚀", "VRUUUUUSH 🚀"] },
      {
        pausa: [800, 1500],
        textos: [
          "PEEEEEI! 💥",
          "CABRUUUM! ⚡",
          "KABUM!!! 💥💥",
          "BRRRRRAAAAAM!",
          "PEI! PEI! PEI!",
          "KA-BLAM! 💥",
          "BOOOOOOOOM 💥",
        ],
      },
      { chance: 0.6, pausa: [1200, 2000], textos: ["...pei.", "...bum.", "...tum.", "...pei... pei."] },
    ],
  },
  {
    nome: "foguete",
    peso: 30,
    etapas: [
      { chance: 0.7, textos: ["tsssss...", "chhhhh...", "fssssss...", "shhhh...", "chiiiiiiii..."] },
      { pausa: [400, 900], textos: ["FIIIIUUUU 🚀", "VRRRUUUSH", "ZUUUUUUM", "FIUUUUUUUUU 🚀", "VUUUSH..."] },
      {
        pausa: [800, 1500],
        textos: ["POW! 💥🎆", "BOOOOM! 🎇", "PÁÁÁÁ! 🎆", "CRÁÁÁ! 💥", "KABOOOOM! 🎇💥", "TCHÁÁÁ! ✨", "CATAPLÁ! 💥"],
      },
      {
        chance: 0.6,
        pausa: [300, 700],
        textos: [
          "PÁ PÁ PÁ PÁ ✨",
          "pipoco pipoco pipoco 🧨",
          "TRRRRRRRRR 🧨",
          "PRRRRRRRRRRR ✨",
          "PRA-TA-TA-TA-TA! 🧨",
          "POC! POC! POC!",
        ],
      },
      {
        chance: 0.4,
        pausa: [1000, 1800],
        textos: ["ooooohhh 🤩", "Ó O BRILHO! ✨", "uaaau 🎇", "que lindooo 🥹🎆", "aaaaahhh 🎆"],
      },
    ],
  },
  {
    nome: "bateria",
    peso: 15,
    etapas: [
      { chance: 0.6, textos: ["tssssss... 🧨", "acendeu! 🔥", "sai de perto! 🔥"] },
      {
        repete: [3, 6],
        pausa: [200, 500],
        textos: ["TÁ!", "PÁ!", "TRÁ!", "POW!", "PEI!", "BAM!", "PUM!", "POC!"],
      },
      {
        pausa: [600, 1000],
        textos: [
          "TRÁ-TÁ-TÁ-TÁ-PÁÁÁÁ! 💥🎆🎇",
          "BOOM-BOOM-BOOM 🎆🎇🎆",
          "PÁ-PÁ-PÁ-PÁ-PÁ-PÁ-PÁ! 🎆",
          "TRRRRRR PÁ PÁ PÁ BOOOOM! 💥🎇",
        ],
      },
    ],
  },
  {
    nome: "mixou",
    peso: 5,
    etapas: [
      { textos: ["tsssssssss..."] },
      { pausa: [1500, 2500], textos: ["...", "......"] },
      {
        pausa: [1500, 2500],
        textos: ["pfft. 💨", "ffff... mixou. 😐", "...era traque molhado. 🫠", "pff... 💨 (alguém tem outro?)"],
      },
    ],
  },
];
