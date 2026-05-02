---
name: dex-memoria
description: Use quando for preciso criar, revisar, resolver, arquivar ou superseder memoria operacional de projetos Dex Agent com contrato de ciclo de vida, evitando que memoria resolvida continue viva como proximo passo.
---

# Dex Memoria

`dex-memoria` e o ponto de entrada pratico para operar memoria com ciclo de vida.

Use esta skill quando uma captura, achado ou decisao precisar ser classificada antes de virar:

- memoria viva;
- ledger historico;
- arquivo resolvido;
- handoff entre projetos;
- skill-candidate;
- estacionamento;
- descarte.

## Regra Central

Memoria operacional nao e apenas anotacao. Ela precisa responder:

- como entra;
- quando deve ser lembrada;
- quanto deve ser lembrada;
- como deve ser usada;
- quando nao deve ser lembrada;
- como sai do estado vivo.

## Fonte Completa

Leia primeiro:

- `SPEC.md`
- `docs/usage.md`
- `docs/runtime-boundary.md`

Use os templates quando precisar criar ou fechar uma memoria:

- `templates/memory-contract.md`
- `templates/memory-resolution-checklist.md`
- `templates/child-usage-prompt.md`

Use os exemplos como referencia de formato:

- `examples/active-operational-memory.md`
- `examples/resolved-operational-finding.md`
- `examples/ledger-only-memory.md`
- `examples/child-to-child-handoff.md`

## Prioridade Entre Fontes

Para proximo passo vivo, a prioridade recomendada e:

1. `INDEX.md`
2. `.agents/HANDOFF.md`
3. `.agents/ACTIVE.md`
4. sprint ou artefato ativo
5. `.agents/MEMORY.ndjson`
6. arquivo resolvido ou arquivado

Regra pratica:

- `HANDOFF.md` manda no proximo passo seguro;
- `ACTIVE.md` manda no objetivo vivo e loops abertos;
- `.agents/MEMORY.ndjson` e ledger duravel, nao fila viva;
- arquivo resolvido ou arquivado nao reabre trabalho sozinho.

## Limite Da V1

Esta V1 e contrato, template e exemplo.

Ela nao executa comandos `add`, `resolve`, `archive`, `status` ou `audit`.
Ela tambem nao e hook automatico e nao roda sozinha ao abrir ou fechar uma janela de contexto.

Scripts so entram numa V2 depois de uso real repetido com baixa ambiguidade.
