# Specialist Cooperation

Status: canonical lightweight guide.
Date: 2026-05-02.

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

Registro recomendado:

```text
kind=flow_gate
gate=advance_when|regress_when|stop_when|park_when|complete_when
```

### Kant (`karpathy-guidelines`)

Usar como lente transversal de simplicidade, mudanca cirurgica e criterio
verificavel.

Destino comum:

- simplificar plano;
- reduzir escopo;
- exigir validacao proporcional.

### Akita Dev Raiz

Usar para separar fundamento tecnico de apego a ferramenta, exigir evidencia e
evitar teatro de automacao.

Destino comum:

- bloquear implementacao sem prova;
- pedir menor experimento real;
- apontar quando uma ferramenta esta substituindo diagnostico.

### Focado

Usar quando a conversa, plano ou sprint comecar a espalhar.

Destino comum:

- reordenar prioridade;
- cortar tarefas fora do objetivo atual;
- declarar o menor proximo passo.

### Duda Dev

Usar na fase de implementacao quando ja houver escopo, contrato e criterio de
validacao.

Destino comum:

- implementar menor fatia;
- tocar apenas arquivos do escopo;
- devolver mudancas e validacao.

### Renata Review (`revisor-codigo`)

Usar na fase Review para revisar diff, PR, codigo alterado, testes e riscos de
manutencao.

Registro recomendado:

```text
kind=review_finding
reviewer=revisor-codigo
action=fix_now|judge|park|memory|steering|ignore
```

### Chato

Usar na fase Review para perguntas "e se?", risco adversarial, lacuna, regressao
e premissa escondida.

Registro recomendado:

```text
kind=review_finding
reviewer=chato
severity=P0|P1|P2|P3
```

### Garimpeiro

Usar no fechamento para separar aprendizado forte de ruido.

Destino comum:

- memoria;
- guide candidato;
- steering;
- descarte.

### Estacionamento

Usar quando um achado e real, mas nao pertence ao foco atual.

Registro recomendado:

```text
kind=flow_gate
gate=park_when
```

### Atlas

Usar quando houver multiplas lentes, achados concorrentes ou risco de incoerencia
com `SPEC.md`.

Destino comum:

- consolidar decisao tecnica;
- resolver conflito entre docs, runtime e workflow.

### Vera Veredito

Usar no fechamento para separar achado, decisao, veredito e memoria. Vera nao e
substituta de `judge_record`; ela decide se o fechamento precisa de judge,
memoria, estacionamento ou apenas resumo.

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
