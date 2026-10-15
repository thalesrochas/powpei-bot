import { FOGOS } from "../data/onomatopeias.js";
import { pick, pickWeighted, randInt } from "./random.js";

type Intervalo = readonly [min: number, max: number];

export interface Etapa {
  textos: readonly string[];
  /** Probabilidade (0–1) de a etapa acontecer. Padrão: 1. */
  chance?: number;
  /** Quantidade de mensagens da etapa. Padrão: [1, 1]. */
  repete?: Intervalo;
  /** Pausa em ms antes de cada mensagem da etapa. Padrão: [0, 0]. */
  pausa?: Intervalo;
}

export interface Fogo {
  nome: string;
  peso: number;
  etapas: readonly Etapa[];
}

export interface Disparo {
  texto: string;
  /** Pausa antes de enviar esta mensagem. */
  pausaMs: number;
}

export interface Queima {
  fogo: string;
  disparos: Disparo[];
}

/** Percorre as etapas do fogo, sem repetir o mesmo texto duas vezes seguidas. */
export function montarQueima(fogo: Fogo, maxMensagens: number): Queima {
  const disparos: Disparo[] = [];

  for (const etapa of fogo.etapas) {
    if (Math.random() >= (etapa.chance ?? 1)) continue;

    const [minRep, maxRep] = etapa.repete ?? [1, 1];
    const [minPausa, maxPausa] = etapa.pausa ?? [0, 0];
    for (let i = randInt(minRep, maxRep); i > 0; i--) {
      const anterior = disparos.at(-1)?.texto;
      const opcoes = etapa.textos.filter((t) => t !== anterior);
      disparos.push({
        texto: pick(opcoes.length > 0 ? opcoes : etapa.textos),
        pausaMs: disparos.length === 0 ? 0 : randInt(minPausa, maxPausa),
      });
    }
  }

  // Teto de segurança: corta o meio, mas preserva o desfecho do fogo.
  if (disparos.length > maxMensagens) {
    const ultimo = disparos.at(-1) as Disparo;
    disparos.splice(maxMensagens - 1, Infinity, ultimo);
    const primeiro = disparos[0] as Disparo;
    primeiro.pausaMs = 0;
  }

  return { fogo: fogo.nome, disparos };
}

export function gerarQueima(maxMensagens: number, fogos: readonly Fogo[] = FOGOS): Queima {
  return montarQueima(pickWeighted(fogos, (f) => f.peso), maxMensagens);
}
