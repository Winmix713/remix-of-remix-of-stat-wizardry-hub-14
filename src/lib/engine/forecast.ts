/**
 * Forecast core — venue-split, recency-decayed, shrunk Poisson model over the
 * match history in the database, plus market probabilities and a directed
 * head-to-head read. Ported from the WinMix engine and adapted to the
 * `matches` table of this app.
 *
 * Everything is computed from finished matches only; there is no hidden state.
 */
import type { Match } from '@/lib/supabase'
import { canon } from './teams'
import { decayedShrunkAvg, scoreGrid, VENUE_DECAY_LAMBDA } from './stats'

export type Outcome = 'H' | 'D' | 'A'

export interface Probs {
  home: number
  draw: number
  away: number
}

export interface Markets {
  btts: number
  over25: number
  over15: number
  over35: number
  homeOrDraw: number
  awayOrDraw: number
  homeOrAway: number
}

export interface H2HRead {
  played: number
  winsHome: number
  draws: number
  winsAway: number
  avgGoals: number
  bttsPct: number
  over25Pct: number
  last: Match[]
}

export interface TeamForm {
  played: number
  attack: number
  defense: number
  avgScored: number
  avgConceded: number
  last5: Outcome[]
}

export type Tier = 'strong' | 'moderate' | 'weak'

export interface Forecast {
  homeTeam: string
  awayTeam: string
  lambdaHome: number
  lambdaAway: number
  probs: Probs
  markets: Markets
  topScores: Array<{ score: string; p: number }>
  expectedGoals: number
  h2h: H2HRead
  homeForm: TeamForm
  awayForm: TeamForm
  tier: Tier
  tierReasons: string[]
}

export interface LeagueIndex {
  teams: string[]
  /** canonical key -> display name */
  aliases: Record<string, string>
  homeMatches: Map<string, Match[]>
  awayMatches: Map<string, Match[]>
  leagueHomeAvg: number
  leagueAwayAvg: number
  totalMatches: number
  all: Match[]
}

const asc = (a: Match, b: Match) =>
  new Date(a.match_time).getTime() - new Date(b.match_time).getTime()

export function buildLeagueIndex(matches: Match[]): LeagueIndex {
  const sorted = [...matches].sort(asc)
  const aliases: Record<string, string> = {}
  const homeMatches = new Map<string, Match[]>()
  const awayMatches = new Map<string, Match[]>()
  let homeGoals = 0
  let awayGoals = 0

  sorted.forEach((m) => {
    const hk = canon(m.home_team)
    const ak = canon(m.away_team)
    aliases[hk] = m.home_team
    aliases[ak] = m.away_team
    if (!homeMatches.has(hk)) homeMatches.set(hk, [])
    if (!awayMatches.has(ak)) awayMatches.set(ak, [])
    homeMatches.get(hk)!.push(m)
    awayMatches.get(ak)!.push(m)
    homeGoals += m.full_time_home_goals
    awayGoals += m.full_time_away_goals
  })

  const n = sorted.length || 1
  return {
    teams: Object.values(aliases).sort((a, b) => a.localeCompare(b, 'hu')),
    aliases,
    homeMatches,
    awayMatches,
    leagueHomeAvg: homeGoals / n,
    leagueAwayAvg: awayGoals / n,
    totalMatches: sorted.length,
    all: sorted,
  }
}

function outcomeOf(m: Match, teamKey: string): Outcome {
  const isHome = canon(m.home_team) === teamKey
  const gf = isHome ? m.full_time_home_goals : m.full_time_away_goals
  const ga = isHome ? m.full_time_away_goals : m.full_time_home_goals
  if (gf > ga) return 'H'
  if (gf === ga) return 'D'
  return 'A'
}

function formOf(idx: LeagueIndex, teamKey: string, isHome: boolean): TeamForm {
  const venue = (isHome ? idx.homeMatches.get(teamKey) : idx.awayMatches.get(teamKey)) ?? []
  const scoredAvgLeague = isHome ? idx.leagueHomeAvg : idx.leagueAwayAvg
  const concededAvgLeague = isHome ? idx.leagueAwayAvg : idx.leagueHomeAvg

  const scored = venue.map((m) => (isHome ? m.full_time_home_goals : m.full_time_away_goals))
  const conceded = venue.map((m) => (isHome ? m.full_time_away_goals : m.full_time_home_goals))

  const attack = decayedShrunkAvg(scored, scoredAvgLeague, VENUE_DECAY_LAMBDA, 5)
  const defense = decayedShrunkAvg(conceded, concededAvgLeague, VENUE_DECAY_LAMBDA, 5)

  const all = [
    ...(idx.homeMatches.get(teamKey) ?? []),
    ...(idx.awayMatches.get(teamKey) ?? []),
  ].sort(asc)

  return {
    played: venue.length,
    attack,
    defense,
    avgScored: scored.length ? scored.reduce((a, c) => a + c, 0) / scored.length : 0,
    avgConceded: conceded.length ? conceded.reduce((a, c) => a + c, 0) / conceded.length : 0,
    last5: all.slice(-5).reverse().map((m) => outcomeOf(m, teamKey)),
  }
}

function h2hOf(idx: LeagueIndex, homeKey: string, awayKey: string): H2HRead {
  const list = idx.all.filter(
    (m) =>
      (canon(m.home_team) === homeKey && canon(m.away_team) === awayKey) ||
      (canon(m.home_team) === awayKey && canon(m.away_team) === homeKey)
  )
  let winsHome = 0
  let winsAway = 0
  let draws = 0
  let goals = 0
  let btts = 0
  let over25 = 0

  list.forEach((m) => {
    const homeIsFirst = canon(m.home_team) === homeKey
    const gA = homeIsFirst ? m.full_time_home_goals : m.full_time_away_goals
    const gB = homeIsFirst ? m.full_time_away_goals : m.full_time_home_goals
    if (gA > gB) winsHome++
    else if (gA < gB) winsAway++
    else draws++
    const total = m.full_time_home_goals + m.full_time_away_goals
    goals += total
    if (m.full_time_home_goals > 0 && m.full_time_away_goals > 0) btts++
    if (total > 2.5) over25++
  })

  const n = list.length
  return {
    played: n,
    winsHome,
    draws,
    winsAway,
    avgGoals: n ? goals / n : 0,
    bttsPct: n ? (btts / n) * 100 : 0,
    over25Pct: n ? (over25 / n) * 100 : 0,
    last: list.slice(-5).reverse(),
  }
}

function marketsFrom(grid: number[][], maxGoals: number): Markets {
  let btts = 0
  let over15 = 0
  let over25 = 0
  let over35 = 0
  let home = 0
  let draw = 0
  let away = 0
  for (let gh = 0; gh <= maxGoals; gh++) {
    for (let ga = 0; ga <= maxGoals; ga++) {
      const p = grid[gh][ga]
      const total = gh + ga
      if (gh > 0 && ga > 0) btts += p
      if (total > 1.5) over15 += p
      if (total > 2.5) over25 += p
      if (total > 3.5) over35 += p
      if (gh > ga) home += p
      else if (gh === ga) draw += p
      else away += p
    }
  }
  return {
    btts,
    over15,
    over25,
    over35,
    homeOrDraw: home + draw,
    awayOrDraw: away + draw,
    homeOrAway: home + away,
  }
}

/**
 * Confidence tier. Deliberately conservative: a thin sample or a model that
 * contradicts the head-to-head record is never labelled strong.
 */
function tierFor(
  probs: Probs,
  homeForm: TeamForm,
  awayForm: TeamForm,
  h2h: H2HRead
): { tier: Tier; reasons: string[] } {
  const reasons: string[] = []
  const top = Math.max(probs.home, probs.draw, probs.away)
  const sample = Math.min(homeForm.played, awayForm.played)

  if (sample < 4) reasons.push(`Kevés mérkőzés a pályaválasztási szereplésből (${sample})`)
  if (h2h.played === 0) reasons.push('Nincs korábbi egymás elleni találkozó')
  if (top < 0.42) reasons.push('A modell nem jelöl határozott kimenetet')

  if (h2h.played >= 3) {
    const h2hTop =
      Math.max(h2h.winsHome, h2h.draws, h2h.winsAway) === h2h.winsHome
        ? 'home'
        : Math.max(h2h.winsHome, h2h.draws, h2h.winsAway) === h2h.winsAway
          ? 'away'
          : 'draw'
    const modelTop =
      probs.home === top ? 'home' : probs.away === top ? 'away' : 'draw'
    if (h2hTop !== modelTop && h2hTop !== 'draw' && modelTop !== 'draw') {
      reasons.push('A modell és az egymás elleni mérleg ellentmond egymásnak')
    }
  }

  const tier: Tier =
    reasons.length === 0 && top >= 0.5 && sample >= 6
      ? 'strong'
      : reasons.length <= 1 && top >= 0.42
        ? 'moderate'
        : 'weak'

  return { tier, reasons }
}

export function forecastFixture(
  idx: LeagueIndex,
  homeTeam: string,
  awayTeam: string,
  rho = 0
): Forecast | null {
  const homeKey = canon(homeTeam)
  const awayKey = canon(awayTeam)
  if (!homeKey || !awayKey || homeKey === awayKey) return null
  if (idx.totalMatches === 0) return null

  const homeForm = formOf(idx, homeKey, true)
  const awayForm = formOf(idx, awayKey, false)

  // Attack x opponent defense, expressed relative to the venue league mean.
  const lambdaHome = Math.max(
    0.05,
    (homeForm.attack * awayForm.defense) / Math.max(0.05, idx.leagueAwayAvg)
  )
  const lambdaAway = Math.max(
    0.05,
    (awayForm.attack * homeForm.defense) / Math.max(0.05, idx.leagueHomeAvg)
  )

  const { grid, maxGoals } = scoreGrid(lambdaHome, lambdaAway, rho)
  const markets = marketsFrom(grid, maxGoals)

  let home = 0
  let draw = 0
  let away = 0
  const flat: Array<{ score: string; p: number }> = []
  for (let gh = 0; gh <= maxGoals; gh++) {
    for (let ga = 0; ga <= maxGoals; ga++) {
      const p = grid[gh][ga]
      if (gh > ga) home += p
      else if (gh === ga) draw += p
      else away += p
      if (gh <= 5 && ga <= 5) flat.push({ score: `${gh}-${ga}`, p })
    }
  }

  const probs: Probs = { home, draw, away }
  const h2h = h2hOf(idx, homeKey, awayKey)
  const { tier, reasons } = tierFor(probs, homeForm, awayForm, h2h)

  return {
    homeTeam: idx.aliases[homeKey] ?? homeTeam,
    awayTeam: idx.aliases[awayKey] ?? awayTeam,
    lambdaHome,
    lambdaAway,
    probs,
    markets,
    topScores: flat.sort((a, b) => b.p - a.p).slice(0, 6),
    expectedGoals: lambdaHome + lambdaAway,
    h2h,
    homeForm,
    awayForm,
    tier,
    tierReasons: reasons,
  }
}

export const pct = (v: number) => `${(v * 100).toFixed(1)}%`
