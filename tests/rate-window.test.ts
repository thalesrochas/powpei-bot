import { describe, expect, it } from "vitest";
import { RateWindow } from "../src/lib/rate-window.js";

describe("RateWindow", () => {
  it("desconta envios e devolve o espaço quando saem da janela", () => {
    let now = 0;
    const janela = new RateWindow(3, 60_000, () => now);

    expect(janela.available(1)).toBe(3);
    janela.record(1);
    now = 10_000;
    janela.record(1);
    expect(janela.available(1)).toBe(1);

    now = 60_000; // o envio do instante 0 saiu da janela
    expect(janela.available(1)).toBe(2);
    now = 70_000;
    expect(janela.available(1)).toBe(3);
  });

  it("é independente por chat", () => {
    const janela = new RateWindow(2, 60_000, () => 0);
    janela.record(1);
    janela.record(1);
    expect(janela.available(1)).toBe(0);
    expect(janela.available(2)).toBe(2);
  });
});
