/** Cooldown em memória por chave (ex.: id do chat). */
export class Cooldown {
  private readonly until = new Map<number, number>();

  constructor(
    private readonly durationMs: number,
    private readonly now: () => number = Date.now,
  ) {}

  /** Retorna true se a chave estava livre e foi marcada; false se ainda está em cooldown. */
  tryAcquire(key: number): boolean {
    const now = this.now();
    const until = this.until.get(key);
    if (until !== undefined && until > now) return false;

    this.until.set(key, now + this.durationMs);
    this.prune(now);
    return true;
  }

  /** Remove entradas expiradas para o Map não crescer indefinidamente. */
  private prune(now: number): void {
    if (this.until.size < 100) return;
    for (const [key, until] of this.until) {
      if (until <= now) this.until.delete(key);
    }
  }
}
