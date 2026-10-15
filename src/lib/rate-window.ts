/**
 * Conta mensagens enviadas por chave (ex.: id do chat) numa janela deslizante,
 * para não passar do limite do Telegram (~20 mensagens por minuto por grupo).
 */
export class RateWindow {
  private readonly sent = new Map<number, number[]>();

  constructor(
    private readonly limit: number,
    private readonly windowMs = 60_000,
    private readonly now: () => number = Date.now,
  ) {}

  /** Quantas mensagens ainda cabem na janela atual. */
  available(key: number): number {
    return this.limit - this.recent(key).length;
  }

  record(key: number): void {
    this.sent.set(key, [...this.recent(key), this.now()]);
  }

  /** Envios ainda dentro da janela; descarta os antigos (e a chave, se esvaziar). */
  private recent(key: number): number[] {
    const cutoff = this.now() - this.windowMs;
    const list = (this.sent.get(key) ?? []).filter((t) => t > cutoff);
    if (list.length > 0) this.sent.set(key, list);
    else this.sent.delete(key);
    return list;
  }
}
