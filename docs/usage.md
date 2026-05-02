# Usage

Este guia explica como instalar, usar e ativar `dex-memoria` como pacote documental.

`dex-memoria` nao e runtime. Ele nao grava memoria, nao executa hooks, nao cria inbox, nao escreve ledger e nao instala comandos automaticamente.

## Instalacao

### Clonar O Repo

```bash
git clone https://github.com/crsantosxx/dex-memoria.git
cd dex-memoria
```

Use este modo quando quiser consultar o contrato, copiar templates ou apontar outro projeto para esta documentacao.

### Usar Como Pacote Documental

Leia nesta ordem:

1. `README.md`
2. `SPEC.md`
3. `docs/runtime-boundary.md`
4. `templates/memory-contract.md`
5. `templates/memory-resolution-checklist.md`

Use `examples/` como referencia de formato, nao como estado real.

### Copiar Ou Adaptar Como Skill Local

Quando um projeto precisar usar `dex-memoria` como skill local, copie ou referencie estes itens:

- `SKILL.md`
- `SPEC.md`
- `docs/`
- `templates/`
- `examples/`

Depois ajuste somente caminhos de referencia do projeto destino. Nao copie `.agents/` reais, inbox, ledger, logs, screenshots, secrets, caches ou runtime `src/`.

## Como Ativar

Use `dex-memoria` quando uma captura, achado, decisao ou residuo precisar ser classificado antes de virar memoria viva, ledger, arquivo, estacionamento, skill-candidate ou descarte.

Ativar significa pedir que o agente aplique este contrato documental. A V1 nao liga hook, nao registra automaticamente e nao cria comandos como `add`, `resolve`, `archive`, `status` ou `audit`.

## Prompts Prontos

### Ativacao Geral

```text
Use dex-memoria nesta conversa.

Antes de salvar, lembrar, arquivar ou encaminhar qualquer captura operacional, aplique o contrato de ciclo de vida:
- classifique a captura;
- diga a fonte de verdade;
- diga quando lembrar;
- diga quando nao lembrar;
- diga quem vence em conflito;
- diga o criterio de resolucao;
- diga o proximo destino.

Nao trate MEMORY.ndjson como fila viva.
Nao deixe memoria resolvida orientar o proximo passo.
Nao prometa scripts, hooks ou automacao que nao existem nesta V1.
```

### Classificar Uma Captura

```text
Use dex-memoria para classificar esta captura antes de salvar, lembrar ou encaminhar.

Captura:
<cole aqui>

Responda com:
- veredito: memoria viva | ledger-only | estacionamento | skill-candidate | descarte;
- tipo;
- estado;
- fonte de verdade;
- quando lembrar;
- quando nao lembrar;
- quem vence em conflito;
- criterio de resolucao;
- proximo destino: local | pai | rede | nenhum.
```

### Criar Uma Memoria Operacional

```text
Use dex-memoria para transformar esta captura em memoria operacional somente se ela realmente precisar orientar retomadas futuras.

Captura:
<cole aqui>

Use o formato de templates/memory-contract.md e preencha:
- id;
- titulo;
- tipo;
- estado;
- escopo;
- projeto;
- origem;
- evidencia;
- o_que_lembrar;
- quando_lembrar;
- quando_nao_lembrar;
- fonte_viva;
- quem_vence_em_conflito;
- criterio_de_resolucao;
- proximo_dono.

Se nao for memoria viva, explique por que deve virar ledger-only, estacionamento, skill-candidate ou descarte.
```

### Resolver Ou Arquivar Uma Memoria

```text
Use dex-memoria para decidir se esta memoria ativa ja pode ser resolvida, arquivada ou supersedida.

Memoria:
<cole aqui>

Evidencia de fechamento:
<cole aqui>

Aplique templates/memory-resolution-checklist.md e responda:
- veredito: fechado | ainda vivo | supersedido | precisa revisao humana;
- prova encontrada;
- ponteiros vivos que devem sair;
- historico que deve permanecer;
- risco de regressao de retomada;
- proximo passo seguro.

Nao deixe uma memoria resolvida continuar como proximo passo.
```

### Decidir O Destino Correto

```text
Use dex-memoria para decidir o destino desta captura.

Captura:
<cole aqui>

Escolha exatamente um destino principal:
- memoria viva;
- ledger-only;
- estacionamento;
- skill-candidate;
- descarte.

Explique:
- por que este destino vence;
- o que nao deve ser lembrado;
- qual arquivo ou camada deve receber o registro;
- qual camada nao deve receber o registro;
- qual condicao futura mudaria o veredito.
```

### Usar Em Projeto Filho

```text
Use dex-memoria em modo projeto filho.

Contexto do projeto filho:
<nome e objetivo>

Captura:
<cole aqui>

Regras:
- HANDOFF.md manda no proximo passo seguro;
- ACTIVE.md manda no objetivo vivo e loops abertos;
- MEMORY.ndjson e ledger, nao fila viva;
- memoria resolvida nao orienta proximo passo;
- bug do Dex Agent pai usa rota pai;
- handoff entre filhos usa rota rede;
- nao misture este contrato com runtime do Dex Agent.

Responda com:
- veredito;
- fonte de verdade;
- destino local | pai | rede | nenhum;
- texto minimo a registrar;
- quando parar de lembrar.
```

## Exemplos De Uso Em Projeto Filho

Use `templates/child-usage-prompt.md` quando o projeto filho so precisa classificar uma captura.

Use `templates/memory-contract.md` quando a captura realmente precisa virar memoria operacional forte.

Use `templates/memory-resolution-checklist.md` quando uma memoria ativa foi corrigida, cumprida, substituida ou arquivada.

Use `examples/active-operational-memory.md`, `examples/ledger-only-memory.md`, `examples/resolved-operational-finding.md` e `examples/child-to-child-handoff.md` como exemplos sanitizados.

## O Que Depende Do Dex Agent

Continua no Dex Agent:

- comandos `/inbox` e `/memory`;
- captura de candidates;
- proposal-first writes;
- ledger `.agents/MEMORY.ndjson`;
- inbox `.agents/INBOX/`;
- recall automatico;
- manutencao de superficies vivas;
- integracao Telegram;
- codigo de runtime.

## O Que Nao Acontece Automaticamente

Este pacote nao:

- instala skill global;
- altera `dex-agent`;
- cria comandos;
- executa scripts;
- grava ledger;
- move arquivos;
- publica releases;
- apaga memoria antiga;
- valida projetos filhos sozinho.

## Limites Da V1

A V1 e contrato, template, exemplo e guia de uso. Scripts, hooks e integracoes automaticas so entram depois de uso real repetido, com baixa ambiguidade e revisao humana.
