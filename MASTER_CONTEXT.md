# MASTER CONTEXT — Pub Crypto

**Identificador Canônico:** `pub-crypto`
**Vertical:** Finanças / Web3
**Holding:** PUB Core Holding
**Status de Maturidade:** SHADOW VALIDATION / PUB NEURAL ARTIFACT FOUNDATION
**Nível de Prioridade:** MÉDIA
**Data de Alinhamento:** 2026-09-17

---

## 1. Visão Executiva & Propósito
PUB Crypto é o runtime financeiro da PUB Core Holding para pesquisa, validação, gestão de portfólio e futura operação autônoma em criptoativos.

O sistema é concebido como um **Trading OS**, não como um simples bot. Seu ciclo canônico é:

`OBSERVE → RESEARCH → SYNTHESIZE → RISK → DECIDE → VALIDATE → EXECUTE → ATTRIBUTE → LEARN → INSTITUTIONALIZE`

PUB Crypto integra-se ao PUB DEV LOOP / PDL para desenvolvimento e operação da infraestrutura, mas a autoridade financeira permanece dentro dos gates de risco e execução do próprio domínio.

## 2. Implementação Executável
A fundação cobre:
- research operacional com proveniência;
- risk engine determinístico;
- decision ledger;
- shadow execution sem capital real;
- backtest com custos e métricas;
- walk-forward / out-of-sample;
- regime analysis;
- Monte Carlo determinístico;
- shadow validation com atribuição por regime;
- contrato versionado de artefato para PUB Neural;
- testes unitários e CI em `.github/workflows/ci.yml`.

Ainda não existe conector de exchange live, nem autorização para capital real.

## 3. Shadow Validation
`runShadowValidation` produz:
- retorno total;
- número de trades;
- atribuição por regime;
- PnL, win rate e média por regime;
- Monte Carlo quando existe amostra mínima;
- status explícito `SHADOW_VALIDATED` ou `SHADOW_INSUFFICIENT_SAMPLE`.

O threshold atual de 10 trades é um guard de governança, não uma prova estatística de qualidade.

## 4. PUB Neural Boundary
`toNeuralValidationArtifact` transforma a validação em payload versionado contendo:
- strategy version;
- dataset version;
- timestamp;
- status;
- retorno;
- trade count;
- regime attribution;
- Monte Carlo;
- origem `PUB_CRYPTO`.

Esse módulo é **contrato de integração**, não uma alegação de persistência no banco do PUB Neural. A escrita efetiva deverá passar pelo ingestion path governado do PUB Neural.

## 5. Maturidade
`ARCHITECTURE → DATA/BACKTEST → RESEARCH → WALK-FORWARD/OOS → REGIME/MONTE CARLO → SHADOW → PUB NEURAL → PAPER → GOVERNED LIVE`

O estado atual não autoriza capital real.

## 6. Governança
**Zero Fake Work:** toda implementação deve produzir código real, testes/gates válidos e publicação no GitHub.

**GitHub é a fonte de verdade.** Seguir `PUB_GIT_CLOSURE_RULE.md`:
`IMPLEMENT → TEST → COMMIT → PUSH → VERIFY REMOTE → DECLARE CLOSED → NEXT STAGE`

**Segurança:** segredos nunca entram em Git, prompts, logs ou memória neural.

## 7. Próximo estágio
Conectar o artefato ao ingestion path real do PUB Neural, preservar lineage e depois construir shadow validation contínua sobre datasets reais e governados.

## 8. Objetivo de longo prazo
Construir um sistema capaz de operar continuamente dentro de limites explícitos, registrar cada decisão, medir seus resultados, aprender com evidência e institucionalizar apenas conhecimento validado.
