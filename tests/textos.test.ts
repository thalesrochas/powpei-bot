import { describe, expect, it } from "vitest";
import { boasVindasGrupo, boasVindasPrivado, descricao, descricaoCurta } from "../src/data/textos.js";

const queima = { cooldownSeconds: 10 };
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

  it("reflete o cooldown configurado", () => {
    expect(boasVindasGrupo("Powpei", queima)).toContain("10s");
    expect(boasVindasPrivado("Powpei", "Ana", queima)).toContain("10s");
  });

  it("omite o aviso de cooldown quando desativado", () => {
    expect(boasVindasGrupo("Powpei", { cooldownSeconds: 0 })).not.toContain("recarregar");
  });
});
