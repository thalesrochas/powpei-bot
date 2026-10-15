export interface Config {
  botToken: string;
  pow: {
    /** Teto de segurança de mensagens por /pow (o roteiro do fogo define a quantidade). */
    maxMessages: number;
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

  const isProduction = env.NODE_ENV === "production";

  return {
    botToken,
    pow: {
      maxMessages: readInt(env, "POW_MAX_MESSAGES", 8, 1),
      cooldownSeconds: readInt(env, "POW_COOLDOWN_SECONDS", 5),
    },
    log: {
      // Em produção, só avisos e erros, para poupar disco (cartão SD) e CPU.
      level: readString(env, "LOG_LEVEL", isProduction ? "warn" : "info"),
      dir: readString(env, "LOG_DIR", "logs"),
      maxSize: readString(env, "LOG_MAX_SIZE", "1m"),
      maxFiles: readInt(env, "LOG_MAX_FILES", 5, 1),
    },
    isProduction,
  };
}
