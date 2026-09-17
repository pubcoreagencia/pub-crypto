import type { MarketSnapshot, PortfolioState, RiskConfig, RiskResult, TradeProposal } from './domain.js';

export class RiskEngine {
  constructor(private readonly config: RiskConfig) {}

  evaluate(proposal: TradeProposal, portfolio: PortfolioState, market: MarketSnapshot, now = Date.now()): RiskResult {
    const rules: string[] = [];
    const age = now - market.asOf;
    if (portfolio.killSwitch) return this.result(proposal, 'HALT', 0, ['KILL_SWITCH'], 'Kill switch is active.', now);
    if (age > this.config.maxDataAgeMs) return this.result(proposal, 'HALT', 0, ['STALE_DATA'], 'Market snapshot is stale.', now);
    if (proposal.entry <= 0 || proposal.stop <= 0 || proposal.target <= 0 || proposal.requestedQuantity <= 0) {
      return this.result(proposal, 'REJECT', 0, ['INVALID_PROPOSAL'], 'Proposal contains non-positive trading values.', now);
    }
    if (proposal.horizonMinutes <= 0) return this.result(proposal, 'REJECT', 0, ['INVALID_HORIZON'], 'Trading horizon must be positive.', now);

    const notional = proposal.entry * proposal.requestedQuantity;
    const singleAssetPct = (Math.abs(portfolio.positions[proposal.symbol] ?? 0) * proposal.entry + notional) / portfolio.equity * 100;
    const portfolioPct = (portfolio.grossExposure + notional) / portfolio.equity * 100;
    const stopDistancePct = Math.abs(proposal.entry - proposal.stop) / proposal.entry * 100;
    const slippagePct = Math.abs(market.price - proposal.entry) / proposal.entry * 100;

    if (portfolio.equity <= 0 || portfolio.availableCapital <= 0) return this.result(proposal, 'REJECT', 0, ['NO_AVAILABLE_CAPITAL'], 'No available capital.', now);
    if (portfolio.rollingDrawdownPct >= this.config.maxDrawdownPct) return this.result(proposal, 'HALT', 0, ['DRAWDOWN_LIMIT'], 'Drawdown limit reached.', now);
    if (slippagePct > this.config.maxSlippagePct) return this.result(proposal, 'REJECT', 0, ['SLIPPAGE_LIMIT'], 'Entry is outside slippage tolerance.', now);
    if (singleAssetPct > this.config.maxSingleAssetExposurePct) rules.push('SINGLE_ASSET_LIMIT');
    if (portfolioPct > this.config.maxPortfolioExposurePct) rules.push('PORTFOLIO_EXPOSURE_LIMIT');
    if (notional > portfolio.equity * this.config.maxStrategyExposurePct / 100) rules.push('STRATEGY_EXPOSURE_LIMIT');
    if (stopDistancePct <= 0) rules.push('INVALID_STOP_DISTANCE');
    if (proposal.side === 'LONG' && proposal.stop >= proposal.entry) rules.push('LONG_STOP_INVALID');
    if (proposal.side === 'SHORT' && proposal.stop <= proposal.entry) rules.push('SHORT_STOP_INVALID');
    if (proposal.side === 'LONG' && proposal.target <= proposal.entry) rules.push('LONG_TARGET_INVALID');
    if (proposal.side === 'SHORT' && proposal.target >= proposal.entry) rules.push('SHORT_TARGET_INVALID');

    if (rules.some((rule) => rule.endsWith('_INVALID'))) return this.result(proposal, 'REJECT', 0, rules, 'Proposal violates trade geometry.', now);
    if (rules.length === 0) return this.result(proposal, 'APPROVE', proposal.requestedQuantity, ['RISK_OK'], 'Proposal is within configured limits.', now);

    const maxNotional = portfolio.equity * this.config.maxSingleAssetExposurePct / 100;
    const reducedQuantity = Math.max(0, Math.min(proposal.requestedQuantity, maxNotional / proposal.entry));
    if (reducedQuantity <= 0) return this.result(proposal, 'REJECT', 0, rules, 'No quantity remains after risk constraints.', now);
    return this.result(proposal, 'REDUCE_SIZE', reducedQuantity, rules, 'Quantity reduced to remain inside risk constraints.', now);
  }

  private result(proposal: TradeProposal, decision: RiskResult['decision'], quantity: number, rules: string[], reason: string, evaluatedAt: number): RiskResult {
    return { decision, approvedQuantity: quantity, rules, reason, evaluatedAt, proposalId: proposal.proposalId };
  }
}
