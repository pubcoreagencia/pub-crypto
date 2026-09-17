export type Side = 'LONG' | 'SHORT';
export type RiskDecision = 'APPROVE' | 'REDUCE_SIZE' | 'REJECT' | 'HALT';
export type DecisionState = 'PROPOSED' | 'RISK_REVIEW' | 'VALIDATED' | 'APPROVED' | 'EXECUTED' | 'CLOSED' | 'ATTRIBUTED' | 'REJECTED' | 'EXPIRED' | 'CANCELLED' | 'HALTED';

export interface Candle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketSnapshot {
  snapshotId: string;
  symbol: string;
  asOf: number;
  price: number;
  candles: Candle[];
  source: string;
}

export interface Evidence {
  evidenceId: string;
  kind: 'MARKET' | 'DERIVATIVES' | 'NEWS' | 'MACRO' | 'ONCHAIN' | 'STRATEGY';
  source: string;
  observedAt: number;
  summary: string;
  value?: number;
}

export interface ResearchRun {
  researchRunId: string;
  snapshotId: string;
  thesis: string;
  evidence: Evidence[];
  contradictions: string[];
  uncertainty: string;
  strategyVersion: string;
}

export interface TradeProposal {
  proposalId: string;
  symbol: string;
  side: Side;
  entry: number;
  stop: number;
  target: number;
  requestedQuantity: number;
  horizonMinutes: number;
  strategyVersion: string;
  thesis: string;
  researchRunId: string;
  snapshotId: string;
}

export interface PortfolioState {
  equity: number;
  availableCapital: number;
  grossExposure: number;
  positions: Record<string, number>;
  dailyPnl: number;
  rollingDrawdownPct: number;
  killSwitch: boolean;
}

export interface RiskConfig {
  maxPortfolioExposurePct: number;
  maxSingleAssetExposurePct: number;
  maxStrategyExposurePct: number;
  maxLeverage: number;
  maxDrawdownPct: number;
  maxSlippagePct: number;
  maxDataAgeMs: number;
}

export interface RiskResult {
  decision: RiskDecision;
  approvedQuantity: number;
  rules: string[];
  reason: string;
  evaluatedAt: number;
  proposalId: string;
}

export interface TradingDecision {
  decisionId: string;
  createdAt: number;
  state: DecisionState;
  proposal: TradeProposal;
  risk: RiskResult;
}

export interface ShadowOrder {
  orderId: string;
  decisionId: string;
  symbol: string;
  side: Side;
  quantity: number;
  fillPrice: number;
  timestamp: number;
  environment: 'SHADOW';
}
