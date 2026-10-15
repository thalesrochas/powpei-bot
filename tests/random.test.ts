import { describe, expect, it } from "vitest";
import { pick, randInt } from "../src/lib/random.js";

describe("randInt", () => {
  it("fica sempre dentro do intervalo fechado e cobre os extremos", () => {
    const seen = new Set<number>();
    for (let i = 0; i < 2000; i++) {
      const n = randInt(1, 5);
      expect(n).toBeGreaterThanOrEqual(1);
      expect(n).toBeLessThanOrEqual(5);
      seen.add(n);
    }
    expect([...seen].sort()).toEqual([1, 2, 3, 4, 5]);
  });

  it("retorna o próprio valor quando min === max", () => {
    expect(randInt(3, 3)).toBe(3);
  });
});

describe("pick", () => {
  it("retorna um elemento da lista", () => {
    const items = ["a", "b", "c"];
    for (let i = 0; i < 100; i++) expect(items).toContain(pick(items));
  });

  it("falha com lista vazia", () => {
    expect(() => pick([])).toThrow();
  });
});
