export interface Config {
  botToken: string;
  pow: {
    minMessages: number;
    maxMessages: number;
    delayMinMs: number;
    delayMaxMs: number;
    cooldownSeconds: number;
  };
  log: {
    level: string;
    dir: string;
    maxSize: string;
    maxFiles: number;
  };
  isProduction: boolean;
}

export class ConfigError extends Error {
  override name = "ConfigError";
}

type Env = Record<string, string | undefined>;

function readInt(env: Env, key: string, fallback: number, min = 0): number {
  const raw = env[key]?.trim();
  if (raw === undefined || raw === "") return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < min) {
    throw new ConfigError(`${key} deve ser um inteiro >= ${min} (recebido: "${raw}")`);
  }
  return value;
}

function readString(env: Env, key: string, fallback: string): string {
  const raw = env[key]?.trim();
  return raw ? raw : fallback;
}

export function loadConfig(env: Env = process.env): Config {
  const botToken = env.BOT_TOKEN?.trim();
  if (!botToken) {
    throw new ConfigError("BOT_TOKEN não definido. Copie .env.example para .env e preencha o token do @BotFather.");
  }

  const pow = {
    minMessages: readInt(env, "POW_MIN_MESSAGES", 1, 1),
    maxMessages: readInt(env, "POW_MAX_MESSAGES", 5, 1),
    delayMinMs: readInt(env, "POW_DELAY_MIN_MS", 300),
    delayMaxMs: readInt(env, "POW_DELAY_MAX_MS", 1200),
    cooldownSeconds: readInt(env, "POW_COOLDOWN_SECONDS", 10),
  };
  if (pow.minMessages > pow.maxMessages) {
    throw new ConfigError("POW_MIN_MESSAGES não pode ser maior que POW_MAX_MESSAGES");
  }
  if (pow.delayMinMs > pow.delayMaxMs) {
    throw new ConfigError("POW_DELAY_MIN_MS não pode ser maior que POW_DELAY_MAX_MS");
  }

  return {
    botToken,
    pow,
    log: {
      level: readString(env, "LOG_LEVEL", "info"),
      dir: readString(env, "LOG_DIR", "logs"),
      maxSize: readString(env, "LOG_MAX_SIZE", "1m"),
      maxFiles: readInt(env, "LOG_MAX_FILES", 5, 1),
    },
    isProduction: env.NODE_ENV === "production",
  };
}
