import type { DecisionState, TradingDecision } from './domain.js';

export interface LedgerEvent {
  eventId: string;
  decisionId: string;
  state: DecisionState;
  occurredAt: number;
  payload: Record<string, unknown>;
}

export class DecisionLedger {
  private readonly events: LedgerEvent[] = [];

  append(event: LedgerEvent): void {
    if (this.events.some((item) => item.eventId === event.eventId)) throw new Error(`Duplicate event: ${event.eventId}`);
    const last = this.events.filter((item) => item.decisionId === event.decisionId).at(-1);
    if (last && last.occurredAt > event.occurredAt) throw new Error('Ledger events must be append-only and time ordered.');
    this.events.push(Object.freeze({ ...event, payload: Object.freeze({ ...event.payload }) }));
  }

  recordDecision(decision: TradingDecision): void {
    this.append({
      eventId: `decision:${decision.decisionId}`,
      decisionId: decision.decisionId,
      state: decision.state,
      occurredAt: decision.createdAt,
      payload: { proposalId: decision.proposal.proposalId, riskDecision: decision.risk.decision }
    });
  }

  history(decisionId: string): readonly LedgerEvent[] {
    return this.events.filter((event) => event.decisionId === decisionId);
  }

  all(): readonly LedgerEvent[] {
    return [...this.events];
  }
}
