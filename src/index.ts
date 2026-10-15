import { run, type RunnerHandle } from "@grammyjs/runner";
import { COMMANDS, createBot } from "./bot.js";
import { ConfigError, loadConfig } from "./config.js";
import { createLogger } from "./logger.js";

let config;
try {
  config = loadConfig();
} catch (err) {
  if (err instanceof ConfigError) {
    console.error(`Configuração inválida: ${err.message}`);
    process.exit(1);
  }
  throw err;
}

const logger = createLogger(config);
const bot = createBot(config, logger);
let runner: RunnerHandle | undefined;
let stopping = false;

async function shutdown(signal: string): Promise<void> {
  stopping = true;
  logger.info({ signal }, "Encerrando o bot...");
  if (runner?.isRunning()) await runner.stop();
  process.exit(0);
}

process.once("SIGINT", () => void shutdown("SIGINT"));
process.once("SIGTERM", () => void shutdown("SIGTERM"));

try {
  await bot.init();
  // Descarta comandos acumulados enquanto o bot estava offline, para não soltar uma rajada de fogos ao religar.
  await bot.api.deleteWebhook({ drop_pending_updates: true });
  await bot.api.setMyCommands(COMMANDS);
} catch (err) {
  logger.fatal({ err }, "Falha ao iniciar o bot");
  process.exit(1);
}

// O runner processa updates em paralelo: um /pow (com pausas entre mensagens) não atrasa os outros grupos.
runner = run(bot, { runner: { maxRetryTime: Infinity, retryInterval: "exponential" } });
logger.info({ username: bot.botInfo.username }, `Bot @${bot.botInfo.username} iniciado 🎆`);

try {
  await runner.task();
  if (!stopping) {
    logger.fatal("Runner parou inesperadamente");
    process.exit(1);
  }
} catch (err) {
  logger.fatal({ err }, "Runner falhou");
  process.exit(1);
}
