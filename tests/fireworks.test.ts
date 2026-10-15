import { describe, expect, it } from "vitest";
import { FOGOS } from "../src/data/onomatopeias.js";
import { gerarQueima, montarQueima, type Fogo } from "../src/lib/fireworks.js";

const MAX = 8;

describe("FOGOS", () => {
  it("têm nomes únicos, peso positivo e textos não vazios", () => {
    expect(new Set(FOGOS.map((f) => f.nome)).size).toBe(FOGOS.length);
    for (const fogo of FOGOS) {
      expect(fogo.peso).toBeGreaterThan(0);
      expect(fogo.etapas.length).toBeGreaterThan(0);
      for (const etapa of fogo.etapas) {
        expect(etapa.textos.length).toBeGreaterThan(0);
        for (const t of etapa.textos) expect(t.trim()).not.toBe("");
      }
    }
  });
});

describe("montarQueima", () => {
  it("todo roteiro gera de 1 a 8 mensagens, sem repetição seguida e com a primeira sem pausa", () => {
    for (const fogo of FOGOS) {
      for (let i = 0; i < 300; i++) {
        const { disparos } = montarQueima(fogo, MAX);
        expect(disparos.length).toBeGreaterThanOrEqual(1);
        expect(disparos.length).toBeLessThanOrEqual(MAX);
        expect(disparos[0]?.pausaMs).toBe(0);
        for (let j = 1; j < disparos.length; j++) {
          expect(disparos[j]?.texto).not.toBe(disparos[j - 1]?.texto);
        }
      }
    }
  });

  it("respeita chance, repetições e pausas da etapa", () => {
    const fogo: Fogo = {
      nome: "teste",
      peso: 1,
      etapas: [
        { textos: ["a"] },
        { chance: 0, textos: ["nunca"] },
        { repete: [3, 3], pausa: [100, 200], textos: ["x", "y"] },
      ],
    };
    for (let i = 0; i < 50; i++) {
      const { disparos } = montarQueima(fogo, MAX);
      expect(disparos.map((d) => d.texto)).not.toContain("nunca");
      expect(disparos).toHaveLength(4);
      for (const d of disparos.slice(1)) {
        expect(d.pausaMs).toBeGreaterThanOrEqual(100);
        expect(d.pausaMs).toBeLessThanOrEqual(200);
      }
    }
  });

  it("o teto corta o meio mas preserva o desfecho", () => {
    const fogo: Fogo = {
      nome: "longo",
      peso: 1,
      etapas: [
        { textos: ["início"] },
        { repete: [10, 10], pausa: [100, 100], textos: ["TÁ!", "PÁ!"] },
        { pausa: [500, 500], textos: ["final"] },
      ],
    };
    const { disparos } = montarQueima(fogo, 4);
    expect(disparos.map((d) => d.texto)).toEqual(["início", expect.any(String), expect.any(String), "final"]);

    const [unico] = montarQueima(fogo, 1).disparos;
    expect(unico).toEqual({ texto: "final", pausaMs: 0 });
  });
});

describe("gerarQueima", () => {
  it("sorteia todos os tipos de fogo", () => {
    const vistos = new Set<string>();
    for (let i = 0; i < 2000; i++) vistos.add(gerarQueima(MAX).fogo);
    expect([...vistos].sort()).toEqual(FOGOS.map((f) => f.nome).sort());
  });
});
