import type { ShadowOrder, TradingDecision } from './domain.js';

export class ShadowExecutionAdapter {
  execute(decision: TradingDecision, now = Date.now()): ShadowOrder {
    if (decision.state !== 'APPROVED') throw new Error('Only approved decisions can reach execution.');
    if (decision.risk.approvedQuantity <= 0) throw new Error('Approved quantity must be positive.');
    return {
      orderId: `shadow:${decision.decisionId}`,
      decisionId: decision.decisionId,
      symbol: decision.proposal.symbol,
      side: decision.proposal.side,
      quantity: decision.risk.approvedQuantity,
      fillPrice: decision.proposal.entry,
      timestamp: now,
      environment: 'SHADOW'
    };
  }
}
