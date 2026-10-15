import { describe, expect, it } from "vitest";
import { Cooldown } from "../src/lib/cooldown.js";

describe("Cooldown", () => {
  it("bloqueia o mesmo chat até o tempo expirar", () => {
    let now = 0;
    const cooldown = new Cooldown(10_000, () => now);

    expect(cooldown.tryAcquire(1)).toBe(true);
    now = 9_999;
    expect(cooldown.tryAcquire(1)).toBe(false);
    now = 10_000;
    expect(cooldown.tryAcquire(1)).toBe(true);
  });

  it("é independente por chat", () => {
    const cooldown = new Cooldown(10_000, () => 0);
    expect(cooldown.tryAcquire(1)).toBe(true);
    expect(cooldown.tryAcquire(2)).toBe(true);
    expect(cooldown.tryAcquire(1)).toBe(false);
  });

  it("duração zero desativa o cooldown", () => {
    const cooldown = new Cooldown(0, () => 0);
    expect(cooldown.tryAcquire(1)).toBe(true);
    expect(cooldown.tryAcquire(1)).toBe(true);
  });
});
