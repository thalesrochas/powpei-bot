import { describe, expect, it } from "vitest";
import { foiAdicionado, foiRemovido } from "../src/events/membership.js";

describe("foiAdicionado", () => {
  it("detecta a entrada no grupo", () => {
    expect(foiAdicionado("left", "member")).toBe(true);
    expect(foiAdicionado("kicked", "member")).toBe(true);
    expect(foiAdicionado("left", "administrator")).toBe(true);
  });

  it("ignora mudanças de permissão de quem já estava no grupo", () => {
    expect(foiAdicionado("member", "administrator")).toBe(false);
    expect(foiAdicionado("administrator", "member")).toBe(false);
  });
});

describe("foiRemovido", () => {
  it("detecta a saída do grupo", () => {
    expect(foiRemovido("member", "left")).toBe(true);
    expect(foiRemovido("administrator", "kicked")).toBe(true);
    expect(foiRemovido("left", "kicked")).toBe(false);
  });
});
