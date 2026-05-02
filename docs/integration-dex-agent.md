# Integracao Com Dex Agent

Este documento descreve como o Dex Agent deve consumir `dex-memoria` sem misturar responsabilidades.

## Integracao Atual

Na versao `0.1.0`, o Dex Agent continua sendo a fonte do runtime. Este repo fornece o contrato operacional.

O Dex Agent pode apontar para este repo em:

- inventario de skills;
- roteamento de memoria operacional;
- documentacao de operadores;
- fluxos `dex-pai` e `dex-rede`;
- validacoes futuras de memoria.

## Atualizacoes Futuras

Depois da publicacao `0.1.0`, avaliar updates em:

- `roteador-memoria`;
- `memoria-viva`;
- governanca da mesa de skills;
- skill global `dex-agent`;
- skill global ou local `dex-pai`;
- possivel criacao de `dex-rede` global.

## Nao Fazer Automaticamente

- nao alterar skills globais como efeito colateral da publicacao;
- nao mover ou apagar a skill original no `dex-agent`;
- nao copiar `.agents/` reais;
- nao copiar runtime inteiro de `src/`;
- nao publicar novas versoes sem revisao humana.
