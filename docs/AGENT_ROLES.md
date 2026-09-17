# PUB Crypto AI — Agent Roles V0

Agents are bounded specialists. No agent may bypass deterministic risk/execution controls.

| Agent | Responsibility | Output |
|---|---|---|
| Market Scout | detect relevant market changes | observations |
| Quant Researcher | factors, signals, statistics | quantified hypothesis |
| Technical Analyst | structure, momentum, volatility | technical thesis |
| Macro/Sentiment Researcher | news, macro and sentiment context | contextual evidence |
| Adversarial/Bear Agent | attack thesis and identify failure modes | objections |
| Strategy Synthesizer | combine evidence into a trade thesis | decision candidate |
| Portfolio Risk Agent | portfolio impact and sizing proposal | risk envelope |
| Validation Agent | backtest/walk-forward/shadow evidence | validation report |
| Execution Agent | translate approved decision into order | execution intent |
| Post-Trade Analyst | attribution and postmortem | outcome + lesson candidate |

## Authority model
`research agents < synthesizer < risk gate < execution gate`

Research agents cannot place orders. The synthesizer cannot override risk. Execution cannot alter approved size, side or invalidation without a new decision record.

## Debate contract
For material trades, the system should retain:
- thesis;
- strongest supporting evidence;
- strongest contradictory evidence;
- missing evidence;
- invalidation conditions;
- expected holding horizon;
- proposed position size;
- portfolio impact;
- confidence and uncertainty.

## Human/LLM boundary
LLMs are probabilistic research and synthesis components. Deterministic services own accounting, limits, state transitions, order validation, idempotency and emergency controls.
