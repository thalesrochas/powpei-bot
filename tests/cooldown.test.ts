import { describe, expect, it } from "vitest";
import { Cooldown } from "../src/lib/cooldown.js";

describe("Cooldown", () => {
  it("bloqueia enquanto o fogo está em andamento", () => {
    let now = 0;
    const cooldown = new Cooldown(5_000, () => now);

    expect(cooldown.tryAcquire(1)).toBe(true);
    now = 60_000; // muito tempo depois, mas ainda sem release
    expect(cooldown.tryAcquire(1)).toBe(false);
  });

  it("conta o tempo a partir do fim (release)", () => {
    let now = 0;
    const cooldown = new Cooldown(5_000, () => now);

    cooldown.tryAcquire(1);
    now = 8_000; // o fogo durou 8s
    cooldown.release(1);

    now = 12_999;
    expect(cooldown.tryAcquire(1)).toBe(false);
    now = 13_000;
    expect(cooldown.tryAcquire(1)).toBe(true);
  });

  it("é independente por chat", () => {
    const cooldown = new Cooldown(5_000, () => 0);
    expect(cooldown.tryAcquire(1)).toBe(true);
    expect(cooldown.tryAcquire(2)).toBe(true);
    expect(cooldown.tryAcquire(1)).toBe(false);
  });

  it("duração zero libera logo após o fim", () => {
    const cooldown = new Cooldown(0, () => 0);
    expect(cooldown.tryAcquire(1)).toBe(true);
    expect(cooldown.tryAcquire(1)).toBe(false);
    cooldown.release(1);
    expect(cooldown.tryAcquire(1)).toBe(true);
  });
});
