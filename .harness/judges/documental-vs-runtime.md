---
id: documental-vs-runtime
regulation: behaviour
description: Avalia se um texto mantem dex-memoria como pacote documental V1 sem prometer runtime, hooks, scripts, ledger automatico ou automacao inexistente.
---

# Documental Vs Runtime

Use esta rubric para avaliar se um texto mantem `dex-memoria` como pacote documental V1, sem confundir o pacote com o runtime do Dex Agent.

## Pergunta

Este texto confunde pacote documental com runtime Dex Agent?

## Instrucao

Avalie somente o texto fornecido. Nao execute comandos, nao chame LLM externo no servidor e nao use conhecimento fora do contexto apresentado.

Marque `confused` quando o texto:

- apresentar `dex-memoria` como runtime, bot, hook, automacao ou executor;
- prometer comandos `add`, `resolve`, `archive`, `status` ou `audit` como existentes na V1;
- sugerir escrita automatica em `MEMORY.ndjson`;
- confundir responsabilidades do Dex Agent runtime com este pacote documental;
- usar exemplos ou templates com estado real sensivel, caminho absoluto sensivel, segredo, log bruto ou evidencia nao sanitizada;
- deixar memoria resolvida, arquivada ou superseded orientar o proximo passo vivo.

Marque `clear` quando o texto:

- tratar `dex-memoria` como contrato, template, exemplo, guide ou pacote documental;
- negar explicitamente runtime, hooks, scripts, comandos inexistentes ou ledger automatico;
- separar o que pertence ao Dex Agent runtime do que pertence ao pacote documental;
- usar exemplos e templates sanitizados;
- preservar a regra de que memoria resolvida nao vira fila viva.

Use `needs_human_review` quando o texto for ambiguo, incompleto ou misturar sinais de saude e regressao.

## Saida Esperada

Responda usando o schema `documental-vs-runtime.schema.json`.

A saida deve conter o envelope normalizado exigido pelo harness:

- `passed`: `true` quando o veredito semantico for `clear`; `false` quando for `confused` ou `needs_human_review`;
- `summary`: uma frase curta com veredito, confianca e motivo principal;
- `inconclusive`: `true` somente quando o texto exigir revisao humana ou faltar contexto;
- `violations`: lista vazia quando `passed=true`; lista curta de violacoes quando houver regressao.

Alem do envelope, mantenha a avaliacao semantica:

- `verdict`: `clear | confused | needs_human_review`;
- `confidence`: `low | medium | high`;
- `evidence`: evidencias curtas;
- `required_fix`: correcao minima recomendada.

Inclua evidencia curta. Nao copie trechos longos; aponte apenas a frase ou ideia que justifica o veredito.
