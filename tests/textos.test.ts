import { describe, expect, it } from "vitest";
import { boasVindasGrupo, boasVindasPrivado, descricao, descricaoCurta } from "../src/data/textos.js";

const queima = { minMessages: 1, maxMessages: 5, cooldownSeconds: 10 };
// Nome de exibição bem longo (o Telegram permite até 64 caracteres).
const nomeLongo = "x".repeat(64);

describe("descrições", () => {
  it("respeitam os limites do Telegram", () => {
    expect(descricao(nomeLongo).length).toBeLessThanOrEqual(512);
    expect(descricaoCurta().length).toBeLessThanOrEqual(120);
  });
});

describe("boas-vindas", () => {
  it("cumprimenta pelo nome no privado e funciona sem nome", () => {
    expect(boasVindasPrivado("Powpei", "Ana", queima)).toContain("Opa, Ana!");
    expect(boasVindasPrivado("Powpei", undefined, queima)).toMatch(/^Opa! /);
  });

  it("reflete a configuração de mensagens e cooldown", () => {
    expect(boasVindasGrupo("Powpei", queima)).toContain("de 1 a 5 estouros");
    expect(boasVindasGrupo("Powpei", queima)).toContain("10s");
    expect(boasVindasGrupo("Powpei", { ...queima, minMessages: 3, maxMessages: 3 })).toContain("3 estouros");
  });

  it("omite o aviso de cooldown quando desativado", () => {
    expect(boasVindasGrupo("Powpei", { ...queima, cooldownSeconds: 0 })).not.toContain("recarregar");
  });
});
