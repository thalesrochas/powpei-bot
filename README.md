<p align="center">
  <img src="assets/powpei-bot.png" alt="Foguete listrado entre fogos de artifício com as onomatopeias BOOM!, PÁÁ! e TUM!" width="200">
</p>

# powpei-bot 🎆

Bot de Telegram que solta fogos de artifício — em forma de onomatopeia — nos grupos.
Qualquer membro do grupo manda `/pow` e o bot solta um fogo sorteado, mensagem a mensagem:
`tsss...` → `FIIIIIUUUUU 🚀` → `POW! 💥🎆` → `PÁ PÁ PÁ ✨`.

Feito em Node.js + TypeScript com [grammY](https://grammy.dev), para rodar em Docker — pensado para um
Raspberry Pi 3B.

## Como funciona

- `/pow` (ou `/pow@NomeDoBot` em grupos) solta **um fogo**, sorteado por peso. Cada fogo segue um
  roteiro de etapas, e cada etapa vira uma ou mais mensagens, com pausas próprias (ex.: o silêncio antes do estouro):

  | Fogo     | Peso | Roteiro                                                     | Mensagens |
  | -------- | ---- | ----------------------------------------------------------- | --------- |
  | bombinha | 25   | pavio (30%) → estouro                                       | 1–2       |
  | rojão    | 25   | subida → estouro forte → eco (60%)                          | 2–3       |
  | foguete  | 30   | rastilho (70%) → subida → estouro → estalos (60%) → reação (40%) | 2–5  |
  | bateria  | 15   | acendendo (60%) → 3–6 tiros rápidos → gran finale           | 4–8       |
  | mixou    | 5    | pavio → silêncio → fiasco 💨                                 | 3         |

  Exemplo (foguete): `chhhhh...` → `VRRRUUUSH 🚀` → `POW! 💥🎆` → `pipoco pipoco pipoco` → `ooooohhh 🤩`.
  O mesmo texto nunca sai duas vezes seguidas.
- **Cooldown por grupo** (padrão 5 s), contado a partir do **fim** do fogo: enquanto um fogo está em
  andamento ou em cooldown, novos `/pow` naquele grupo são ignorados em silêncio. Assim os fogos nunca se
  sobrepõem e o grupo fica longe do limite do Telegram (~20 mensagens/min por grupo).
- Comandos enviados enquanto o bot estava desligado são descartados ao religar (sem rajada acumulada).
- Updates são processados em paralelo ([@grammyjs/runner](https://grammy.dev/plugins/runner)), então um
  `/pow` em andamento num grupo não atrasa os outros.
- Erros de flood limit (429) e falhas 5xx do Telegram são repetidos automaticamente
  ([@grammyjs/auto-retry](https://grammy.dev/plugins/auto-retry)).

Os fogos, pesos e pausas ficam no código ([como editar](#adicionando-sons-e-fogos)); cooldown, teto de
mensagens e logs são configurados pelo [`.env`](#configuração-env).

### Apresentação e boas-vindas

- **Descrição** (tela do chat privado vazio, "O que este bot faz?") e **descrição curta** (perfil do bot e
  links compartilhados) ficam em [src/data/textos.ts](src/data/textos.ts). O bot as sincroniza com o
  Telegram ao iniciar — só envia quando o texto mudou, então basta editar o arquivo e fazer o deploy.
- **`/start`** no privado responde com uma apresentação e a lista de comandos; em grupos, com a mensagem
  de boas-vindas do grupo.
- Ao ser **adicionado a um grupo**, o bot manda a mensagem de boas-vindas automaticamente.
- Os textos usam o nome de exibição definido no @BotFather e refletem o cooldown configurado.

## Criando o bot no Telegram

1. Fale com o [@BotFather](https://t.me/BotFather) e use `/newbot`. Guarde o **token**.
2. Garanta que o bot pode entrar em grupos: `/setjoingroups` → **Enable** (é o padrão).
3. O *privacy mode* pode continuar ligado: mesmo assim o bot recebe comandos como `/pow`.
4. Foto de perfil: `/setuserpic` → escolha o bot → envie [assets/powpei-bot.png](assets/powpei-bot.png)
   **como foto** (não como arquivo).
5. Adicione o bot ao grupo e mande `/pow`.

> Não use `/setdescription` nem `/setabouttext` no @BotFather: o bot sobrescreve esses textos ao iniciar
> com os de [src/data/textos.ts](src/data/textos.ts).

O próprio bot registra o comando `/pow` no menu do Telegram ao iniciar.

## Configuração (`.env`)

Copie o exemplo e preencha o token:

```sh
cp .env.example .env
```

| Variável               | Padrão | Descrição                                                        |
| ---------------------- | ------ | ---------------------------------------------------------------- |
| `BOT_TOKEN`            | —      | Token do @BotFather (**obrigatório**)                             |
| `POW_MAX_MESSAGES`     | `8`    | Teto de mensagens por `/pow`; acima dele o meio do roteiro é cortado, mantendo o desfecho |
| `POW_COOLDOWN_SECONDS` | `5`    | Bloqueio do `/pow` por grupo depois que o fogo termina (`0` desativa) |
| `LOG_LEVEL`            | `info` (dev) / `warn` (produção) | `trace`, `debug`, `info`, `warn`, `error` ou `fatal` |
| `LOG_DIR`              | `logs` | Pasta dos arquivos de log                                        |
| `LOG_MAX_SIZE`         | `1m`   | Tamanho máximo de cada arquivo antes de rotacionar (`k`, `m`, `g`) |
| `LOG_MAX_FILES`        | `5`    | Quantos arquivos antigos manter, além do atual                   |

O `.env` está no `.gitignore` e no `.dockerignore` — nunca é versionado nem copiado para a imagem.

## Desenvolvimento local

Requer Node.js 20.6+ (desenvolvido com Node 24).

```sh
npm install
npm run dev        # roda com recarga automática (tsx watch), lendo o .env
npm test           # testes unitários (vitest)
npm run typecheck  # checagem de tipos
npm run build      # compila para dist/
npm start          # roda o JS compilado, lendo o .env
```

Em desenvolvimento os logs no terminal saem formatados (pino-pretty); com `NODE_ENV=production` saem em JSON.

## Estrutura

```
src/
├─ index.ts              # inicialização, runner, desligamento gracioso
├─ bot.ts                # cria o Bot, plugins, comandos e tratamento de erros
├─ config.ts             # leitura e validação das variáveis de ambiente
├─ logger.ts             # pino: stdout + arquivos com rotação
├─ profile.ts            # sincroniza descrição e descrição curta do bot
├─ commands/
│  ├─ pow.ts             # o comando /pow
│  └─ start.ts           # o comando /start (boas-vindas)
├─ events/membership.ts  # boas-vindas ao entrar em um grupo
├─ data/
│  ├─ onomatopeias.ts    # roteiros dos fogos  ← edite aqui para adicionar sons e fogos
│  └─ textos.ts          # descrição e mensagens de boas-vindas
└─ lib/
   ├─ cooldown.ts        # cooldown em memória por chat
   ├─ fireworks.ts       # sorteio do fogo e montagem das mensagens a partir do roteiro
   └─ random.ts          # randInt, pick, pickWeighted, sleep
tests/                   # testes unitários
assets/                  # imagem de perfil do bot (não vai para a imagem Docker)
logs/                    # arquivos de log (só o .gitkeep é versionado)
```

### Adicionando sons e fogos

Edite a lista `FOGOS` em [src/data/onomatopeias.ts](src/data/onomatopeias.ts). Cada fogo tem `nome`,
`peso` (chance relativa de ser sorteado) e `etapas`, e cada etapa aceita:

| Campo    | Padrão   | Significado                                          |
| -------- | -------- | ---------------------------------------------------- |
| `textos` | —        | Opções sorteadas para a mensagem                     |
| `chance` | `1`      | Probabilidade (0–1) de a etapa acontecer             |
| `repete` | `[1, 1]` | Quantas mensagens a etapa gera (mín, máx)            |
| `pausa`  | `[0, 0]` | Pausa em ms antes de cada mensagem da etapa (mín, máx) |

```ts
{
  nome: "rojão",
  peso: 25,
  etapas: [
    { textos: ["FIIIIIIUUUUUU 🚀", "VUUUUUSH..."] },
    { pausa: [800, 1500], textos: ["PEEEEEI! 💥", "CABRUUUM! ⚡"] },
    { chance: 0.6, pausa: [1200, 2000], textos: ["...pei.", "...bum."] },
  ],
}
```

Para incluir um som novo, basta acrescentá-lo aos `textos` da etapa certa. Rode `npm test` (o teste acusa
nomes repetidos, textos vazios e roteiros fora do limite de mensagens) e faça o deploy.

## Logs

Os logs vão para dois lugares:

- **Arquivos** em `LOG_DIR` (`logs/powpei.N.log`, uma linha JSON por evento). Quando o arquivo atual
  atinge `LOG_MAX_SIZE`, um novo é aberto e os mais antigos são apagados, mantendo só `LOG_MAX_FILES`
  além do atual. Com os padrões, o teto é ~6 MB em disco — mesmo após reinícios.
- **stdout**, visível com `docker compose logs`. No Docker esse log também é limitado (3 × 1 MB).

O nível depende do ambiente, para poupar o cartão SD em produção:

| Nível            | Quando é o padrão                 | O que é registrado                                                        |
| ---------------- | --------------------------------- | ------------------------------------------------------------------------- |
| `warn`           | produção (`NODE_ENV=production`, Docker) | só avisos e erros: falhas da API/rede, erro ao atualizar a descrição, falha no boot |
| `info`           | desenvolvimento (`npm run dev`)   | também inicialização, entrada/saída de grupos, `/start` e cada `/pow` (grupo, usuário, fogo, mensagens) |
| `debug`          | —                                 | também os `/pow` ignorados por fogo em andamento ou cooldown              |

Para investigar algo no Pi, defina `LOG_LEVEL=info` (ou `debug`) no `.env` e rode `docker compose up -d`;
depois comente a linha de novo.

```sh
tail -f logs/powpei.*.log                 # no host
docker compose logs -f                    # stdout do container
```

## Deploy no Raspberry Pi (Docker)

A imagem é construída no próprio servidor a partir de `node:24-alpine`, que tem variantes arm64 e x86_64,
então o mesmo passo a passo serve para outras máquinas. Não é preciso instalar Node.js no servidor.

### Requisitos

- Raspberry Pi 3B ou mais novo com **sistema 64-bit** (arm64), como Raspberry Pi OS 64-bit ou Debian.
- **Docker** com o plugin **Compose** (`docker compose version`) e **git**.
- Usuário no grupo `docker` (`sudo usermod -aG docker $USER` e entrar de novo); sem isso, prefixe os
  comandos `docker` com `sudo`.

### Primeira instalação

```sh
git clone https://github.com/thalesrochas/powpei-bot.git ~/powpei-bot
cd ~/powpei-bot
cp .env.example .env
nano .env                       # preencha o BOT_TOKEN
docker compose up -d --build
docker compose ps               # deve estar "running"; mande /pow no grupo para confirmar
```

Em produção o log só registra avisos e erros, então um `docker compose logs` vazio é bom sinal.

A pasta `logs/` (criada pelo `git clone`) é montada no container em `/app/logs`. O container roda como o
usuário `node` (uid 1000), que costuma ser o mesmo uid do primeiro usuário do sistema. Se o seu for
outro (`id -u`), libere a escrita com `sudo chown 1000:1000 logs`.

### Atualizando

```sh
cd ~/powpei-bot
git pull
docker compose up -d --build
docker image prune -f           # remove imagens antigas e libera espaço no SD
```

### Operação

```sh
docker compose ps               # status
docker compose restart          # reinicia
docker compose down             # para e remove o container
```

Com `restart: unless-stopped` e o serviço `docker` habilitado, o bot volta sozinho após um reboot
ou queda. Se o bot falhar ao iniciar (sem rede, token inválido), ele registra o erro e sai; o Docker
tenta de novo.

### Limites do Pi 3B

- **Memória:** o Pi 3B tem ~1 GB de RAM. O container tem limite de 256 MB (`mem_limit`), e o bot em uso
  consome bem menos. O pico é o **build** (`npm ci` + `tsc`); se ele for morto por falta de memória
  (comum sem swap), habilite zram (`sudo apt install zram-tools`) e tente de novo.
- **Cartão SD:** escritas constantes desgastam o cartão. Por isso, em produção o bot só registra avisos e
  erros, e tanto os arquivos de log quanto o log do Docker têm tamanho limitado.

## Solução de problemas

| Sintoma                                            | Causa provável / solução                                                |
| -------------------------------------------------- | ----------------------------------------------------------------------- |
| `Configuração inválida: BOT_TOKEN não definido`    | `.env` ausente ou sem token.                                             |
| `401: Unauthorized` no log                         | Token errado ou revogado; gere outro no @BotFather.                     |
| `409: Conflict` no log                             | Há outra instância do bot rodando com o mesmo token (ex.: `npm run dev` no PC). |
| `EACCES: permission denied` em `logs/`             | A pasta `logs/` não pertence ao uid 1000: `sudo chown 1000:1000 logs` e `docker compose up -d`. |
| `exec format error` ao subir o container           | Sistema 32-bit ou imagem de outra arquitetura; use um sistema 64-bit e builde no próprio servidor. |
| Bot não responde no grupo                          | Confira se o comando foi `/pow` e se o grupo não está em cooldown (`LOG_LEVEL=debug`). |
| `/pow` responde com atraso                         | Flood limit do Telegram; o auto-retry espera e reenvia. Aumente `POW_COOLDOWN_SECONDS` ou reduza `POW_MAX_MESSAGES`. |
