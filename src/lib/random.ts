/** Inteiro aleatório no intervalo fechado [min, max]. */
export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Elemento aleatório de uma lista não vazia. */
export function pick<T>(items: readonly T[]): T {
  if (items.length === 0) throw new Error("pick() chamado com lista vazia");
  return items[randInt(0, items.length - 1)] as T;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
