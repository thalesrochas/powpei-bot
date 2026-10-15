import { EMOJIS, ESTOUROS, FRASES, RASTILHOS, SUBIDAS } from "../data/onomatopeias.js";
import { pick, randInt } from "./random.js";

/** Probabilidade de montar um combo em vez de usar uma frase pronta. */
const COMBO_CHANCE = 0.3;

/** Monta um combo: [rastilho] subida... estouro [emojis]. */
export function combo(): string {
  const parts: string[] = [];
  if (Math.random() < 0.5) parts.push(pick(RASTILHOS));
  parts.push(`${pick(SUBIDAS)}...`);

  const estouros = Array.from({ length: randInt(1, 3) }, () => pick(ESTOUROS));
  parts.push(estouros.join(" "));

  const emojis = Array.from({ length: randInt(0, 3) }, () => pick(EMOJIS)).join("");
  if (emojis) parts.push(emojis);

  return parts.join(" ");
}

export function firework(): string {
  return Math.random() < COMBO_CHANCE ? combo() : pick(FRASES);
}

/** Gera `count` onomatopeias, sem repetir a mesma duas vezes seguidas. */
export function generateFireworks(count: number): string[] {
  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    let next = firework();
    for (let tries = 0; next === result.at(-1) && tries < 10; tries++) {
      next = firework();
    }
    result.push(next);
  }
  return result;
}
