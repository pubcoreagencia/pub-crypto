import { DecisionLedger } from './decision-ledger.js';
import type { MarketSnapshot, PortfolioState, RiskConfig, TradeProposal, TradingDecision } from './domain.js';
import { FixtureResearchProvider, ResearchEngine } from './research-engine.js';
import { RiskEngine } from './risk-engine.js';
import { ShadowExecutionAdapter } from './shadow-execution.js';

export async function runShadowCycle(input: {
  market: MarketSnapshot;
  portfolio: PortfolioState;
  proposal: TradeProposal;
  riskConfig: RiskConfig;
  now?: number;
}) {
  const now = input.now ?? Date.now();
  const research = await new ResearchEngine(new FixtureResearchProvider()).run(input.market, input.proposal.strategyVersion, `research:${input.proposal.proposalId}`);
  const risk = new RiskEngine(input.riskConfig).evaluate(input.proposal, input.portfolio, input.market, now);
  const state = risk.decision === 'HALT' ? 'HALTED' : risk.decision === 'REJECT' ? 'REJECTED' : risk.decision === 'REDUCE_SIZE' || risk.decision === 'APPROVE' ? 'APPROVED' : 'REJECTED';
  const decision: TradingDecision = {
    decisionId: `decision:${input.proposal.proposalId}`,
    createdAt: now,
    state,
    proposal: input.proposal,
    risk
  };
  const ledger = new DecisionLedger();
  ledger.recordDecision(decision);
  const shadowOrder = state === 'APPROVED' ? new ShadowExecutionAdapter().execute(decision, now) : null;
  return { research, risk, decision, shadowOrder, ledger };
}
