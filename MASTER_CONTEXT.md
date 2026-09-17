# MASTER CONTEXT — Pub Crypto

**Identificador Canônico:** `pub-crypto`
**Vertical:** Finanças / Web3
**Holding:** PUB Core Holding
**Status de Maturidade:** BACKTEST VALIDATION V1
**Nível de Prioridade:** MÉDIA
**Data de Alinhamento:** 2026-09-17

---

## 1. Visão Executiva & Propósito
PUB Crypto é o runtime financeiro da PUB Core Holding para pesquisa, validação, gestão de portfólio e futura operação autônoma em criptoativos.

O sistema é concebido como um **Trading OS**, não como um simples bot. Seu ciclo canônico é:

`OBSERVE → RESEARCH → SYNTHESIZE → RISK → DECIDE → VALIDATE → EXECUTE → ATTRIBUTE → LEARN → INSTITUTIONALIZE`

PUB Crypto integra-se ao PUB DEV LOOP / PDL para desenvolvimento e operação da infraestrutura, mas a autoridade financeira permanece dentro dos gates de risco e execução do próprio domínio.

## 2. Arquitetura Canônica
- **PUB Crypto:** observação, pesquisa, estratégias, portfólio, risco, validação, shadow/paper/live e execução.
- **PUB Neural:** memória, evidência, decisões, lessons, patterns, governance e conhecimento institucional.
- **PDL / ACP:** engenharia, automação operacional e ciclo de desenvolvimento.
- **Exchange/Broker adapters:** somente via camada de execução governada.

Documentos canônicos:
- `docs/TRADING_OS_ARCHITECTURE.md`
- `docs/AGENT_ROLES.md`
- `docs/RISK_ENGINE_SPEC.md`
- `docs/RESEARCH_ENGINE_SPEC.md`
- `docs/BACKTEST_VALIDATION_SPEC.md`
- `docs/SHADOW_ACCOUNT_SPEC.md`
- `docs/DECISION_LEDGER_SPEC.md`
- `docs/PUB_NEURAL_INTEGRATION.md`
- `docs/LIVE_EXECUTION_GOVERNANCE.md`

## 3. Implementação V0
O primeiro runtime executável está em `src/` e cobre:
- contratos de domínio para market snapshot, evidence, research, proposal, portfolio, risk e decision;
- `ResearchEngine` com provider substituível e fixture auditável;
- `RiskEngine` determinístico com kill switch, stale-data gate, exposição, drawdown, slippage e geometria da operação;
- `DecisionLedger` append-only em memória;
- `ShadowExecutionAdapter`, sem acesso a capital real;
- `runShadowCycle`, conectando research → risk → decision → shadow execution;
- testes unitários e de integração em `tests/`;
- CI em `.github/workflows/ci.yml`.

Esta V0 é deliberadamente uma fundação executável. Ainda não existe conector de exchange live, nem autorização para capital real.

## 4. Benchmark externo incorporado
- **AutoHedge:** referência para separação de agentes e execução on-chain.
- **Vibe-Trading:** referência para research OS, grounded metrics, backtesting, shadow account, regime analysis, Monte Carlo e trading governance.
- **AI-Trader:** referência futura para rede de agentes, sinais e copy-trading.

Esses projetos são referências arquiteturais, não dependências obrigatórias.

## 5. Maturidade
`ARCHITECTURE BASELINE → DATA + BACKTEST FOUNDATION → RESEARCH → SHADOW → PAPER → GOVERNED LIVE`

O estado atual é uma fundação executável de DATA/RESEARCH/SHADOW. Não autoriza capital real. A capacidade live será habilitada apenas após os gates documentados.

## 6. Governança
**Zero Fake Work:** toda implementação deve produzir código real, testes/gates válidos e publicação no GitHub.

**GitHub é a fonte de verdade.** Seguir `PUB_GIT_CLOSURE_RULE.md`:
`IMPLEMENT → TEST → COMMIT → PUSH → VERIFY REMOTE → DECLARE CLOSED → NEXT STAGE`

**Segurança:** segredos nunca entram em Git, prompts, logs ou memória neural.

## 7. Próximo estágio
Adicionar walk-forward/out-of-sample, regime analysis, Monte Carlo, shadow validation e persistência governada no PUB Neural antes de qualquer paper/live gate.

## 8. Objetivo de longo prazo
Construir um sistema capaz de operar continuamente dentro de limites explícitos, registrar cada decisão, medir seus resultados, aprender com evidência e institucionalizar apenas conhecimento validado.
