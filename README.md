# powpei-bot 🎆

Bot de Telegram que solta fogos de artifício — em forma de onomatopeia — nos grupos.
Qualquer membro do grupo manda `/pow` e o bot responde com uma rajada aleatória de
`POW! 💥`, `PÁ PÁ PÁ!`, `FIIIIIUUUUU... KABUM!` e afins.

Feito em Node.js + TypeScript com [grammY](https://grammy.dev), para rodar em Docker num Raspberry Pi 3B.

## Como funciona

- `/pow` (ou `/pow@NomeDoBot` em grupos) envia de **1 a 5 mensagens** seguidas, com uma **pausa aleatória**
  entre elas (300–1200 ms), simulando estouros em sequência.
- Cada mensagem é uma frase pronta (~40 opções) ou, em ~30% das vezes, um **combo** montado na hora
  (rastilho + subida + estouro + emojis). A mesma mensagem nunca sai duas vezes seguidas.
- **Cooldown por grupo** (padrão 5 s): enquanto ativo, novos `/pow` naquele grupo são ignorados em silêncio.
- Comandos enviados enquanto o bot estava desligado são descartados ao religar (sem rajada acumulada).
- Updates são processados em paralelo ([@grammyjs/runner](https://grammy.dev/plugins/runner)), então um
  `/pow` em andamento num grupo não atrasa os outros.
- Erros de flood limit (429) e falhas 5xx do Telegram são repetidos automaticamente
  ([@grammyjs/auto-retry](https://grammy.dev/plugins/auto-retry)).

Todos os valores são configuráveis pelo `.env`.

### Apresentação e boas-vindas

- **Descrição** (tela do chat privado vazio, "O que este bot faz?") e **descrição curta** (perfil do bot e
  links compartilhados) ficam em [src/data/textos.ts](src/data/textos.ts). O bot as sincroniza com o
  Telegram ao iniciar — só envia quando o texto mudou, então basta editar o arquivo e fazer o deploy.
- **`/start`** no privado responde com uma apresentação e a lista de comandos; em grupos, com a mensagem
  de boas-vindas do grupo.
- Ao ser **adicionado a um grupo**, o bot manda a mensagem de boas-vindas automaticamente.
- Os textos usam o nome de exibição definido no @BotFather e refletem a configuração atual
  (quantidade de estouros e cooldown).

## Criando o bot no Telegram

1. Fale com o [@BotFather](https://t.me/BotFather) e use `/newbot`. Guarde o **token**.
2. Garanta que o bot pode entrar em grupos: `/setjoingroups` → **Enable** (é o padrão).
3. O *privacy mode* pode continuar ligado: mesmo assim o bot recebe comandos como `/pow`.
4. Adicione o bot ao grupo e mande `/pow`.

O próprio bot registra o comando `/pow` no menu do Telegram ao iniciar.

## Configuração (`.env`)

Copie o exemplo e preencha o token:

```sh
cp .env.example .env
```

| Variável               | Padrão | Descrição                                                        |
| ---------------------- | ------ | ---------------------------------------------------------------- |
| `BOT_TOKEN`            | —      | Token do @BotFather (**obrigatório**)                             |
| `POW_MIN_MESSAGES`     | `1`    | Mínimo de mensagens por `/pow`                                   |
| `POW_MAX_MESSAGES`     | `5`    | Máximo de mensagens por `/pow`                                   |
| `POW_DELAY_MIN_MS`     | `300`  | Pausa mínima entre mensagens (ms)                                |
| `POW_DELAY_MAX_MS`     | `1200` | Pausa máxima entre mensagens (ms)                                |
| `POW_COOLDOWN_SECONDS` | `5`    | Bloqueio do `/pow` por grupo após o uso (`0` desativa)           |
| `LOG_LEVEL`            | `info` | `trace`, `debug`, `info`, `warn`, `error` ou `fatal`             |
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
│  ├─ onomatopeias.ts    # frases e partes de combo  ← edite aqui para adicionar sons
│  └─ textos.ts          # descrição e mensagens de boas-vindas
└─ lib/
   ├─ cooldown.ts        # cooldown em memória por chat
   ├─ fireworks.ts       # sorteio das mensagens (frase pronta ou combo)
   └─ random.ts          # randInt, pick, sleep
tests/                   # testes unitários
```

### Adicionando onomatopeias

Edite [src/data/onomatopeias.ts](src/data/onomatopeias.ts):

- `FRASES`: frases completas, enviadas como estão.
- `RASTILHOS`, `SUBIDAS`, `ESTOUROS`, `EMOJIS`: peças usadas para montar combos.

Rode `npm test` (o teste acusa frases duplicadas ou vazias) e faça o deploy.

## Logs

Os logs vão para dois lugares:

- **Arquivos** em `LOG_DIR` (`logs/powpei.N.log`, uma linha JSON por evento). Quando o arquivo atual
  atinge `LOG_MAX_SIZE`, um novo é aberto e os mais antigos são apagados, mantendo só `LOG_MAX_FILES`
  além do atual. Com os padrões, o teto é ~6 MB em disco — mesmo após reinícios.
- **stdout**, visível com `docker compose logs`. No Docker esse log também é limitado (3 × 1 MB).

O que é registrado: inicialização, entrada/saída de grupos, `/start`, cada `/pow` (grupo, usuário, quantidade de mensagens), erros
da API/rede e, com `LOG_LEVEL=debug`, os `/pow` ignorados por cooldown.

```sh
tail -f logs/powpei.*.log                 # no host
docker compose logs -f                    # stdout do container
```

## Deploy no Raspberry Pi (Docker)

O Pi roda Debian 13 arm64 com Docker (detalhes em [rpi3b-amgiente.md](rpi3b-amgiente.md)).
A imagem é construída no próprio Pi a partir de `node:24-alpine`, que tem variante arm64.

### Primeira instalação

```sh
git clone https://github.com/thalesrochas/powpei-bot.git ~/powpei-bot
cd ~/powpei-bot
cp .env.example .env
nano .env                       # preencha o BOT_TOKEN
docker compose up -d --build
docker compose logs -f          # deve aparecer "Bot @... iniciado 🎆"
```

A pasta `logs/` é montada no container em `/app/logs`. O container roda como o usuário `node`
(uid 1000), o mesmo uid do usuário do Pi, então os arquivos ficam com o dono correto.

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

- O container tem limite de 256 MB de RAM (`mem_limit`); em uso o bot consome bem menos.
- O pico de memória é o **build** (`npm ci` + `tsc`). O Pi não tem swap; se o build for morto por falta
  de memória, habilite zram (`sudo apt install zram-tools`) e tente de novo.

## Solução de problemas

| Sintoma                                            | Causa provável / solução                                                |
| -------------------------------------------------- | ----------------------------------------------------------------------- |
| `Configuração inválida: BOT_TOKEN não definido`    | `.env` ausente ou sem token.                                             |
| `401: Unauthorized` no log                         | Token errado ou revogado; gere outro no @BotFather.                     |
| `409: Conflict` no log                             | Há outra instância do bot rodando com o mesmo token (ex.: `npm run dev` no PC). |
| Bot não responde no grupo                          | Confira se o comando foi `/pow` e se o grupo não está em cooldown (`LOG_LEVEL=debug`). |
| `/pow` responde com atraso                         | Flood limit do Telegram; o auto-retry espera e reenvia. Reduza `POW_MAX_MESSAGES` ou aumente o cooldown. |
