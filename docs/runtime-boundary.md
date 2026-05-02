# Runtime Boundary

`dex-memoria` e contrato documental. O runtime de memoria continua no Dex Agent ate decisao posterior.

## Fica No Dex Agent

- comandos `/inbox` e `/memory`;
- captura de candidates;
- proposal-first writes;
- ledger `.agents/MEMORY.ndjson`;
- inbox `.agents/INBOX/`;
- recall automatico;
- manutencao de superficies;
- integracao Telegram;
- codigo em `src/orchestrator/*`, `src/bot/*` e `src/index.ts`.

## Fica Neste Repo

- contrato de ciclo de vida;
- templates;
- exemplos sanitizados;
- criterios de criacao, resolucao, arquivamento e supersedencia;
- documentacao de fronteira.

## Regra De Uso

Quando a pergunta for sobre como operar uma memoria, use este repo.

Quando a pergunta for sobre como o bot grava, recupera, mostra ou injeta memoria em prompts, consulte o runtime do Dex Agent.
