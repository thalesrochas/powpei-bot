import { describe, expect, it } from "vitest";
import { ConfigError, loadConfig } from "../src/config.js";

describe("loadConfig", () => {
  it("aplica valores padrão", () => {
    const config = loadConfig({ BOT_TOKEN: "123:abc" });
    expect(config.pow).toEqual({ maxMessages: 8, cooldownSeconds: 5 });
    expect(config.log).toEqual({ level: "info", dir: "logs", maxSize: "1m", maxFiles: 5 });
    expect(config.isProduction).toBe(false);
  });

  it("exige BOT_TOKEN", () => {
    expect(() => loadConfig({})).toThrow(ConfigError);
  });

  it("rejeita números inválidos", () => {
    expect(() => loadConfig({ BOT_TOKEN: "x", POW_MAX_MESSAGES: "abc" })).toThrow(ConfigError);
    expect(() => loadConfig({ BOT_TOKEN: "x", POW_MAX_MESSAGES: "0" })).toThrow(ConfigError);
    expect(() => loadConfig({ BOT_TOKEN: "x", POW_COOLDOWN_SECONDS: "-1" })).toThrow(ConfigError);
  });
});
