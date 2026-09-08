export { supabase } from '@/integrations/supabase/client'
import type { Database } from '@/integrations/supabase/types'

export type Match = Database['public']['Tables']['matches']['Row']

export type MatchFilters = {
  home_team?: string
  away_team?: string
  btts_computed?: boolean
  comeback_computed?: boolean
  result_computed?: string
  date_from?: string
  date_to?: string
}

export type MatchStats = {
  total_matches: number
  home_wins: number
  draws: number
  away_wins: number
  btts_count: number
  comeback_count: number
  avg_goals: number
  home_win_percentage: number
  draw_percentage: number
  away_win_percentage: number
  btts_percentage: number
  comeback_percentage: number
}