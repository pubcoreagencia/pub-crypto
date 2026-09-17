export interface MonteCarloSummary {
  simulations: number;
  sampleSize: number;
  seed: number;
  meanFinalEquity: number;
  percentile5FinalEquity: number;
  percentile50FinalEquity: number;
  percentile95FinalEquity: number;
  worstFinalEquity: number;
  bestFinalEquity: number;
}

function mulberry32(seed: number): () => number {
  return () => {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function percentile(values: number[], p: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  if (!sorted.length) throw new Error('EMPTY_SIMULATION');
  const position = (sorted.length - 1) * p;
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (position - lower);
}

export function runMonteCarlo(input: {
  startingEquity: number;
  tradeReturns: number[];
  simulations: number;
  seed?: number;
}): MonteCarloSummary {
  if (!Number.isFinite(input.startingEquity) || input.startingEquity <= 0) throw new Error('INVALID_STARTING_EQUITY');
  if (!Number.isInteger(input.simulations) || input.simulations < 1) throw new Error('INVALID_SIMULATIONS');
  if (!input.tradeReturns.length) throw new Error('EMPTY_TRADE_RETURNS');

  const seed = input.seed ?? 42;
  const random = mulberry32(seed);
  const finals: number[] = [];

  for (let simulation = 0; simulation < input.simulations; simulation += 1) {
    let equity = input.startingEquity;
    for (let i = 0; i < input.tradeReturns.length; i += 1) {
      const index = Math.floor(random() * input.tradeReturns.length);
      equity *= 1 + input.tradeReturns[index];
    }
    finals.push(equity);
  }

  return {
    simulations: input.simulations,
    sampleSize: input.tradeReturns.length,
    seed,
    meanFinalEquity: finals.reduce((a, b) => a + b, 0) / finals.length,
    percentile5FinalEquity: percentile(finals, 0.05),
    percentile50FinalEquity: percentile(finals, 0.5),
    percentile95FinalEquity: percentile(finals, 0.95),
    worstFinalEquity: Math.min(...finals),
    bestFinalEquity: Math.max(...finals)
  };
}
