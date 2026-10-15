import { join } from "node:path";
import { pino, type Logger, type TransportTargetOptions } from "pino";
import type { Config } from "./config.js";

export type { Logger };

/**
 * Logger com duas saídas:
 * - stdout (legível com pino-pretty em dev, JSON em produção/Docker);
 * - arquivos em `LOG_DIR` com rotação por tamanho, mantendo só os `LOG_MAX_FILES` mais recentes.
 *
 * Os transports rodam em worker thread e o pino os descarrega de forma síncrona no `process.exit`,
 * então não é preciso dar flush manual antes de encerrar.
 */
export function createLogger(config: Config): Logger {
  const { level, dir, maxSize, maxFiles } = config.log;

  const stdout: TransportTargetOptions = config.isProduction
    ? { target: "pino/file", level, options: { destination: 1 } }
    : { target: "pino-pretty", level, options: { colorize: true, translateTime: "SYS:standard" } };

  const file: TransportTargetOptions = {
    target: "pino-roll",
    level,
    options: {
      file: join(dir, "powpei"),
      size: maxSize,
      mkdir: true,
      limit: { count: maxFiles, removeOtherLogFiles: true },
    },
  };

  return pino(
    { level, timestamp: pino.stdTimeFunctions.isoTime },
    pino.transport({ targets: [stdout, file] }),
  );
}
