/** Poisson / weighting primitives, ported from the WinMix forecast core. */

/** Poisson PMF via the P(k) = P(k-1) * lambda / k recurrence. */
export function poissonPmfArray(lambda: number, maxK: number): number[] {
  const arr = new Array<number>(maxK + 1)
  arr[0] = Math.exp(-lambda)
  for (let k = 1; k <= maxK; k++) arr[k] = (arr[k - 1] * lambda) / k
  return arr
}

export function adaptiveMaxGoals(lambda: number): number {
  return Math.min(15, Math.max(7, Math.ceil(lambda + 5 * Math.sqrt(Math.max(0.01, lambda)))))
}

/** Recency decay per observation (newest carries weight 1). */
export const VENUE_DECAY_LAMBDA = 0.94

/**
 * Exponential decay (recency weighting) + shrinkage toward the league mean.
 * Cold-start and empty inputs return the league mean instead of dividing by zero.
 */
export function decayedShrunkAvg(
  values: number[],
  leagueAvg: number,
  lambda: number = VENUE_DECAY_LAMBDA,
  k = 5
): number {
  const n = values.length
  if (n === 0) return leagueAvg
  let weightedSum = 0
  let weightSum = 0
  values.forEach((v, idx) => {
    const w = Math.pow(lambda, n - 1 - idx)
    weightedSum += v * w
    weightSum += w
  })
  const rawAvg = weightSum > 0 ? weightedSum / weightSum : leagueAvg
  const shrunk = (n * rawAvg + k * leagueAvg) / (n + k)
  return Number.isFinite(shrunk) ? shrunk : leagueAvg
}

/** The classic Dixon-Coles tau adjustment on the four low-score cells. */
export function dcTau(
  gh: number,
  ga: number,
  lambdaH: number,
  lambdaA: number,
  rho: number
): number {
  if (rho === 0) return 1
  if (gh === 0 && ga === 0) return Math.max(1e-6, 1 - lambdaH * lambdaA * rho)
  if (gh === 0 && ga === 1) return Math.max(1e-6, 1 + lambdaH * rho)
  if (gh === 1 && ga === 0) return Math.max(1e-6, 1 + lambdaA * rho)
  if (gh === 1 && ga === 1) return Math.max(1e-6, 1 - rho)
  return 1
}

export interface ScoreGrid {
  maxGoals: number
  /** grid[gh][ga] */
  grid: number[][]
}

export function scoreGrid(lambdaH: number, lambdaA: number, rho = 0): ScoreGrid {
  const maxGoals = Math.max(adaptiveMaxGoals(lambdaH), adaptiveMaxGoals(lambdaA))
  const pmfH = poissonPmfArray(lambdaH, maxGoals)
  const pmfA = poissonPmfArray(lambdaA, maxGoals)
  const grid: number[][] = []
  let sum = 0
  for (let gh = 0; gh <= maxGoals; gh++) {
    grid[gh] = []
    for (let ga = 0; ga <= maxGoals; ga++) {
      const p = pmfH[gh] * pmfA[ga] * dcTau(gh, ga, lambdaH, lambdaA, rho)
      grid[gh][ga] = p
      sum += p
    }
  }
  if (sum > 0) {
    for (let gh = 0; gh <= maxGoals; gh++)
      for (let ga = 0; ga <= maxGoals; ga++) grid[gh][ga] /= sum
  }
  return { maxGoals, grid }
}
