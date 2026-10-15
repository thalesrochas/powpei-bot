import { describe, expect, it } from "vitest";
import { FRASES } from "../src/data/onomatopeias.js";
import { combo, generateFireworks } from "../src/lib/fireworks.js";

describe("generateFireworks", () => {
  it("gera exatamente a quantidade pedida, sem mensagens vazias", () => {
    for (let count = 1; count <= 5; count++) {
      const messages = generateFireworks(count);
      expect(messages).toHaveLength(count);
      for (const m of messages) expect(m.trim()).not.toBe("");
    }
  });

  it("não repete a mesma mensagem duas vezes seguidas", () => {
    for (let i = 0; i < 200; i++) {
      const messages = generateFireworks(5);
      for (let j = 1; j < messages.length; j++) expect(messages[j]).not.toBe(messages[j - 1]);
    }
  });
});

describe("combo", () => {
  it("monta texto com subida e estouro", () => {
    for (let i = 0; i < 100; i++) expect(combo()).toMatch(/\.\.\. \S/);
  });
});

describe("FRASES", () => {
  it("não tem duplicadas nem itens vazios", () => {
    expect(new Set(FRASES).size).toBe(FRASES.length);
    for (const f of FRASES) expect(f.trim()).not.toBe("");
  });
});
