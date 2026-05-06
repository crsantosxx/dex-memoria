# Specialist Cooperation

Status: canonical lightweight guide.
Date: 2026-05-02.

Surface: `.harness/guides/skills/` e categoria de guide MCP, nao local de
instalacao de `SKILL.md`.

## Tese

`dex-harness` deve expor um mapa leve dos especialistas recorrentes do fluxo.
O MCP nao carrega o vault global de skills nem cria subagentes sozinho. Ele
orienta quando chamar cada lente, como registrar o achado e para onde o achado
deve ir.

## Mapa Fixo Do Fluxo

```text
Workflow -> Contract -> Task -> Implement -> Review -> Flow Gate -> Judge -> Complete -> Steering
```

## Cooperadores Fixos

### Fernanda Do Fluxo (`ancora-fluxo`)

Usar para manter fase atual, `next:`, `back_to:`, checklist visual e credito de
cooperacao material.

Quando a governanca de skills existir, Fernanda atua como coordenadora do fluxo
vivo: classifica a fase, declara o owner esperado, explicita o gate de saida e
decide a transicao correta (`seguir para`, `segurar em`, `retornar para` ou
`enviar para`). Ela usa a governanca para sugerir cooperadores, mas nao substitui
a skill dona do conteudo.

Sem indice/governanca de skills no ambiente, use apenas a funcao portavel:
fase, gate, transicao e registro de evidencia. Nao invente nomes de
especialistas.

Entrada minima:

- fase atual;
- objetivo do corte;
- gate de saida esperado;
- proximo destino provavel.

Saida esperada:

- `next:` claro;
- `back_to:` quando houver regressao;
- checklist curto de andamento;
- credito apenas para cooperacao material.

Registro recomendado:

```text
kind=flow_gate
gate=advance_when|regress_when|stop_when|park_when|complete_when
```

Nao usar para decidir conteudo tecnico no lugar do dono da fase.

### Kant (`karpathy-guidelines`)

Usar como lente transversal de simplicidade, mudanca cirurgica e criterio
verificavel.

Entrada minima:

- plano, diff ou decisao candidata;
- criterio de pronto esperado.

Saida esperada:

- corte menor quando houver excesso;
- premissas explicitas;
- validacao proporcional.

Destino comum:

- simplificar plano;
- reduzir escopo;
- exigir validacao proporcional.

Registro recomendado: `review_finding` quando a lente mudar a decisao ou
`flow_gate` quando bloquear/permitir transicao.

Nao usar para bloquear tarefa trivial sem risco real.

### Akita Dev Raiz

Usar para separar fundamento tecnico de apego a ferramenta, exigir evidencia e
evitar teatro de automacao.

Entrada minima:

- promessa tecnica;
- ferramenta/automacao envolvida;
- evidencia disponivel.

Saida esperada:

- fundamento que continua valido sem a ferramenta;
- risco tecnico plausivel;
- menor experimento real.

Destino comum:

- bloquear implementacao sem prova;
- pedir menor experimento real;
- apontar quando uma ferramenta esta substituindo diagnostico.

Registro recomendado: `review_finding` para risco material ou `flow_gate` para
`stop_when`/`regress_when` quando a prova falhar.

Nao usar como anti-ferramenta por reflexo; exigir evidencia, nao identidade.

### Focado

Usar quando a conversa, plano ou sprint comecar a espalhar.

Entrada minima:

- objetivo declarado;
- lista de assuntos competindo;
- restricao de tempo ou corte.

Saida esperada:

- prioridade dominante;
- itens fora do corte;
- proximo passo unico.

Destino comum:

- reordenar prioridade;
- cortar tarefas fora do objetivo atual;
- declarar o menor proximo passo.

Registro recomendado: `flow_gate` quando o foco muda a fase ou estaciona algo.

Nao usar para apagar achado real; achado fora do foco deve ir para
estacionamento.

### Duda Dev

Usar na fase de implementacao quando ja houver escopo, contrato e criterio de
validacao.

Entrada minima:

- arquivo(s) ou modulo(s) em escopo;
- comportamento desejado;
- validacao esperada.

Saida esperada:

- patch minimo;
- arquivos alterados;
- evidencia executada;
- ressalvas.

Destino comum:

- implementar menor fatia;
- tocar apenas arquivos do escopo;
- devolver mudancas e validacao.

Registro recomendado: `decision` para marco de implementacao e
`review_finding` se encontrar bug durante a construcao.

Nao usar antes de haver escopo e criterio de pronto.

### Renata Review (`revisor-codigo`)

Usar na fase Review para revisar diff, PR, codigo alterado, testes e riscos de
manutencao.

Entrada minima:

- diff, PR ou lista de arquivos alterados;
- base de comparacao;
- objetivo da mudanca.

Saida esperada:

- findings priorizados;
- cenario afetado;
- acao sugerida;
- teste faltante quando houver.

Registro recomendado:

```text
kind=review_finding
reviewer=revisor-codigo
action=fix_now|judge|park|memory|steering|ignore
```

Nao usar para reescrever o patch inteiro; review aponta achado acionavel.

### Chato

Usar na fase Review para perguntas "e se?", risco adversarial, lacuna, regressao
e premissa escondida.

Entrada minima:

- conclusao candidata;
- evidencia usada;
- risco de falso pronto.

Saida esperada:

- perguntas "e se?" com alvo;
- lacunas reais;
- risco que muda decisao.

Registro recomendado:

```text
kind=review_finding
reviewer=chato
severity=P0|P1|P2|P3
```

Nao usar para gerar ansiedade generica; toda pergunta deve apontar um risco ou
uma prova.

### Harness Boundary

Usar como judge semantico quando uma rodada de setup tiver achado material sobre
fronteira operacional: MCP real versus shell, `cwd`/`HARNESS_ROOT`, dashboard
oficial versus leitura manual de `.harness/.local`, ou `.harness/` entrando em
deploy.

Entrada minima:

- resumo da sessao ou fechamento;
- achados de Review relevantes;
- Flow Gate decidido;
- evidencia de dashboard ou motivo para nao renderizar.

Saida esperada:

- veredito estruturado via `judge_record`;
- lacuna concreta se a fronteira ficou ambigua;
- menor patch, prova ou decisao para fechar.

Registro recomendado:

```text
judge_review(rubric_id=harness-boundary) -> judge_record
```

Nao usar como rito obrigatorio quando nao ha achado material de fronteira.

### Garimpeiro

Usar no fechamento para separar aprendizado forte de ruido.

Entrada minima:

- achados do corte;
- decisoes tomadas;
- evidencias que se repetem.

Saida esperada:

- aprendizado candidato;
- destino sugerido;
- o que descartar.

Destino comum:

- memoria;
- guide candidato;
- steering;
- descarte.

Registro recomendado: `review_finding` com `action=memory` ou
`action=steering` quando o aprendizado for reutilizavel.

Nao usar para memorizar tudo.

### Estacionamento

Usar quando um achado e real, mas nao pertence ao foco atual.

Entrada minima:

- achado fora do corte;
- motivo para nao resolver agora;
- condicao de retomada.

Saida esperada:

- item estacionado com dono ou gatilho;
- criterio para voltar ou descartar.

Registro recomendado:

```text
kind=flow_gate
gate=park_when
```

Nao usar como lixeira; se nao ha valor futuro, descarte.

### Atlas

Usar quando houver multiplas lentes, achados concorrentes ou risco de incoerencia
com `SPEC.md`.

Entrada minima:

- resultado final do corte;
- arquivos ou docs alterados;
- evidencias executadas;
- tensoes entre especialistas.

Saida esperada:

- leitura consolidada;
- incoerencias;
- risco residual;
- proximo passo coerente.

Destino comum:

- consolidar decisao tecnica;
- resolver conflito entre docs, runtime e workflow.

Registro recomendado: `review_finding` quando encontrar incoerencia material ou
`flow_gate` quando consolidar o avanco.

Nao usar para reabrir a reuniao inteira sem motivo tecnico.

### Vera Veredito

Usar no fechamento para separar achado, decisao, veredito e memoria. Vera nao e
substituta de `judge_record`; ela decide se o fechamento precisa de judge,
memoria, estacionamento ou apenas resumo.

Entrada minima:

- objetivo original;
- evidencia executada;
- riscos restantes;
- git status ou artefatos finais.

Saida esperada:

- pronto ou nao pronto;
- pendencias;
- proximo passo seguro;
- decisao sobre memoria/steering quando aplicavel.

Registro recomendado: `decision` para fechamento narrativo ou `flow_gate` com
`complete_when` quando o criterio de pronto estiver atendido.

Nao usar como atalho para `judge_record` quando a spec exigir judge estruturado.

## Responsavel Nomeado Ou Fase

Quando um contrato, workflow, guide ou fonte viva nomear responsavel operacional,
preserve o nome e explique o papel. Nao remova especialista nomeado para
"generalizar".

Esta camada so se aplica quando o ambiente declarar um indice/governanca de
skills, por exemplo `skills/INDEX.md` e
`skills/00-governanca-mesa-de-skills.md`, ou equivalentes. Se essa governanca
nao existir, ignore nomes de especialistas como regra operacional e use apenas
a etapa ou fase.

Quando a fonte nao nomear responsavel, use a etapa ou fase como nome central:
`Pensamento`, `Planejamento`, `Construir`, `Review`, `Teste`, `Validacao` ou
`Fechamento`.

Nao invente especialista para preencher campo. Cooperadores entram quando a
documentacao de governanca/fluxo os indicar ou quando a lente reduzir risco,
ambiguidade ou retrabalho.

Quando a governanca existir e o contrato/workflow indicar especialista ou
cooperador, trate isso como acionavel: aplique a lente, registre a contribuicao
material, ou registre explicitamente por que ela nao se aplicou neste corte.
Nao substitua especialista indicado por comentario generico de fase.

Registre cooperacao material, nao presenca decorativa: o evento deve dizer quem
contribuiu, em qual fase, que evidencia ou decisao mudou, e para onde o achado
foi (`fix_now`, `park`, `memory`, `steering`, `judge` ou `ignore`).

## Regra De Registro

- Achado de Review vira `review_finding`.
- Decisao de transicao vira `flow_gate`.
- Veredito estruturado vira `judge_record`.
- Aprendizado recorrente vira candidato a Steering ou memoria.
- Residuo util fora de foco vira estacionamento.

## Anti-Excesso

Nao transforme todo especialista em judge. Nao transforme todo achado em task.
Nao crie subagent quando uma lente local basta. Nao promova regra sem evidencia
de repeticao ou custo real de esquecimento.
