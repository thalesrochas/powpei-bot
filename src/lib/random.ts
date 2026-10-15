/** Inteiro aleatório no intervalo fechado [min, max]. */
export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Elemento aleatório de uma lista não vazia. */
export function pick<T>(items: readonly T[]): T {
  if (items.length === 0) throw new Error("pick() chamado com lista vazia");
  return items[randInt(0, items.length - 1)] as T;
}

/** Elemento aleatório de uma lista não vazia, com probabilidade proporcional ao peso. */
export function pickWeighted<T>(items: readonly T[], weight: (item: T) => number): T {
  const total = items.reduce((sum, item) => sum + weight(item), 0);
  if (total <= 0) throw new Error("pickWeighted() chamado sem pesos positivos");

  let r = Math.random() * total;
  for (const item of items) {
    r -= weight(item);
    if (r < 0) return item;
  }
  return items.at(-1) as T;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
