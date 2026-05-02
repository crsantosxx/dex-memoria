# Project Audit Docs

Use este guide para auditorias leves do `dex-memoria`.

O objetivo e confirmar que o projeto continua sendo um pacote documental V1 de memoria operacional, sem virar runtime, hook, ledger automatico ou automacao pesada.

## Escopo Da Auditoria

Leia somente as superficies documentais essenciais:

- `README.md`
- `SPEC.md`
- `SKILL.md`
- `docs/`
- `templates/`
- `examples/`
- `contracts/`, quando existir

Nao leia `.env`, secrets, `.harness/.local`, `node_modules`, logs, caches ou estado bruto do Git.

## Perguntas Obrigatorias

1. Este pacote continua documental?
2. Ele esta prometendo runtime, hook, comando ou escrita automatica que nao existe?
3. A fronteira com o Dex Agent esta clara?
4. Templates e exemplos continuam sanitizados, sem estado real sensivel?
5. Memoria resolvida esta impedida de virar proximo passo operacional?

## Sinais De Saude

- `README.md` apresenta o pacote como contrato documental.
- `SPEC.md` mantem runtime, `/inbox`, `/memory`, ledger automatico e scripts fora da V1.
- `SKILL.md` direciona para contrato, templates e exemplos sem prometer execucao automatica.
- `docs/runtime-boundary.md` separa o que fica neste repo do que fica no Dex Agent.
- `templates/` pedem fonte de verdade, criterio de resolucao, quando lembrar e quando nao lembrar.
- `examples/` usam conteudo sanitizado e nao parecem estado real de projeto.
- `contracts/` nao compete com `HANDOFF.md` como proximo passo seguro.

## Sinais De Regressao

- O pacote passa a prometer comandos `add`, `resolve`, `archive`, `status` ou `audit`.
- O pacote sugere gravar `.agents/MEMORY.ndjson` sozinho.
- Memoria resolvida, arquivada ou superseded aparece como proximo passo vivo.
- Um exemplo contem log bruto, segredo, token, screenshot sensivel ou estado real nao sanitizado.
- A fronteira com o Dex Agent fica ambigua ou o repo passa a parecer runtime do bot.

## Excesso Neste Projeto

Considere excesso, nesta fase documental V1:

- criar hooks, comandos, workflows ou automacoes antes de uso real repetido;
- criar sensor, judge ou contract spec durante a propria auditoria;
- ler logs, secrets, runtime local, caches ou estado bruto que nao seja documentacao essencial;
- validar projetos filhos automaticamente;
- transformar `dex-memoria` em runtime do Dex Agent por efeito colateral.

## Saida Esperada

Responda com:

- veredito: `ok | regressao | precisa revisao humana`;
- evidencias documentais consultadas;
- risco principal;
- excesso identificado, se houver;
- menor proximo corte verificavel.

Nao crie sensor, judge, contract spec ou workflow durante esta auditoria. Se a mesma verificacao se repetir com baixa ambiguidade, proponha automacao em um passo separado.
