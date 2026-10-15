import { GrammyError, type CommandContext, type Context } from "grammy";
import { pino } from "pino";
import { describe, expect, it, vi } from "vitest";
import { createPowHandler } from "../src/commands/pow.js";

// Sem pausas reais entre as mensagens.
vi.mock("../src/lib/random.js", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../src/lib/random.js")>()),
  sleep: () => Promise.resolve(),
}));

const logger = pino({ level: "silent" });

function fakeCtx(reply: (texto: string) => Promise<unknown>) {
  return {
    chat: { id: -100, type: "supergroup", title: "Grupo" },
    from: { id: 1 },
    reply: vi.fn(reply),
  } as unknown as CommandContext<Context> & { reply: ReturnType<typeof vi.fn> };
}

function erro429(retryAfter: number) {
  return new GrammyError(
    "Call to 'sendMessage' failed!",
    {
      ok: false,
      error_code: 429,
      description: `Too Many Requests: retry after ${retryAfter}`,
      parameters: { retry_after: retryAfter },
    },
    "sendMessage",
    {},
  );
}

describe("/pow", () => {
  it("após um 429 longo, interrompe o fogo e pausa o chat sem tentar de novo", async () => {
    const pow = createPowHandler({ maxMessages: 8, maxMessagesPerMinute: 15, cooldownSeconds: 0 }, logger);
    const ctx = fakeCtx(() => Promise.reject(erro429(2956)));

    await expect(pow(ctx)).resolves.toBeUndefined();
    expect(ctx.reply).toHaveBeenCalledTimes(1);

    await pow(ctx);
    expect(ctx.reply).toHaveBeenCalledTimes(1);
  });

  it("ignora o /pow quando o fogo não cabe no orçamento do minuto", async () => {
    const pow = createPowHandler({ maxMessages: 1, maxMessagesPerMinute: 1, cooldownSeconds: 0 }, logger);
    const ctx = fakeCtx(() => Promise.resolve({}));

    await pow(ctx);
    expect(ctx.reply).toHaveBeenCalledTimes(1);

    await pow(ctx);
    expect(ctx.reply).toHaveBeenCalledTimes(1);
  });

  it("outros erros sobem para o bot.catch e não travam o chat", async () => {
    const pow = createPowHandler({ maxMessages: 8, maxMessagesPerMinute: 15, cooldownSeconds: 0 }, logger);
    const ctx = fakeCtx(() => Promise.reject(new Error("rede caiu")));

    await expect(pow(ctx)).rejects.toThrow("rede caiu");
    await expect(pow(ctx)).rejects.toThrow("rede caiu");
    expect(ctx.reply).toHaveBeenCalledTimes(2);
  });
});
