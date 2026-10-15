/**
 * Cooldown em memória por chave (ex.: id do chat), contado a partir do fim do uso:
 * `tryAcquire` ocupa a chave e `release` libera e inicia a espera.
 */
export class Cooldown {
  private readonly ocupadas = new Set<number>();
  private readonly until = new Map<number, number>();

  constructor(
    private readonly durationMs: number,
    private readonly now: () => number = Date.now,
  ) {}

  /** Retorna true se a chave estava livre e foi ocupada; false se está em uso ou em cooldown. */
  tryAcquire(key: number): boolean {
    if (this.ocupadas.has(key)) return false;
    const until = this.until.get(key);
    if (until !== undefined && until > this.now()) return false;

    this.ocupadas.add(key);
    return true;
  }

  /** Libera a chave; ela fica bloqueada por mais `durationMs` a partir de agora. */
  release(key: number): void {
    const now = this.now();
    this.ocupadas.delete(key);
    this.until.set(key, now + this.durationMs);
    this.prune(now);
  }

  /** Remove entradas expiradas para o Map não crescer indefinidamente. */
  private prune(now: number): void {
    if (this.until.size < 100) return;
    for (const [key, until] of this.until) {
      if (until <= now) this.until.delete(key);
    }
  }
}
