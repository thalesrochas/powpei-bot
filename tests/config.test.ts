import { describe, expect, it } from "vitest";
import { ConfigError, loadConfig } from "../src/config.js";

describe("loadConfig", () => {
  it("aplica valores padrão", () => {
    const config = loadConfig({ BOT_TOKEN: "123:abc" });
    expect(config.pow).toEqual({
      minMessages: 1,
      maxMessages: 5,
      delayMinMs: 300,
      delayMaxMs: 1200,
      cooldownSeconds: 5,
    });
    expect(config.log).toEqual({ level: "info", dir: "logs", maxSize: "1m", maxFiles: 5 });
    expect(config.isProduction).toBe(false);
  });

  it("exige BOT_TOKEN", () => {
    expect(() => loadConfig({})).toThrow(ConfigError);
  });

  it("rejeita números inválidos e min > max", () => {
    expect(() => loadConfig({ BOT_TOKEN: "x", POW_MAX_MESSAGES: "abc" })).toThrow(ConfigError);
    expect(() => loadConfig({ BOT_TOKEN: "x", POW_MIN_MESSAGES: "0" })).toThrow(ConfigError);
    expect(() => loadConfig({ BOT_TOKEN: "x", POW_MIN_MESSAGES: "6", POW_MAX_MESSAGES: "5" })).toThrow(ConfigError);
    expect(() => loadConfig({ BOT_TOKEN: "x", POW_DELAY_MIN_MS: "2000", POW_DELAY_MAX_MS: "1000" })).toThrow(
      ConfigError,
    );
  });
});
