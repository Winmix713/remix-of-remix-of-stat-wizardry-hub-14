import { useState, useEffect } from 'react'
import { supabase, type Match } from '@/lib/supabase'

export interface AdvancedAnalytics {
  mostCommonResults: Array<{
    result: string;
    count: number;
    percentage: number;
  }>;
  goalsTrend: {
    over25Goals: number;
    under25Goals: number;
    over25Percentage: number;
    under25Percentage: number;
  };
  bttsAnalysis: {
    bttsTrue: number;
    bttsFalse: number;
    bttsPercentage: number;
    monthlyTrend: Array<{
      month: string;
      bttsRate: number;
      matches: number;
    }>;
  };
  weeklyResults: Array<{
    day: string;
    matches: number;
    avgGoals: number;
    bttsRate: number;
  }>;
}

export const useAdvancedAnalytics = () => {
  const [analytics, setAnalytics] = useState<AdvancedAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAdvancedAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch all matches for comprehensive analysis
      const { data: matches, error: matchError } = await supabase
        .from('matches')
        .select('*')
        .order('match_time', { ascending: false })
        .limit(1000) // Limit for performance

      if (matchError) {
        throw matchError
      }

      if (!matches || matches.length === 0) {
        setAnalytics(null)
        return
      }

      // 1. Most Common Results Analysis
      const resultCounts: { [key: string]: number } = {}
      matches.forEach(match => {
        const result = `${match.full_time_home_goals}-${match.full_time_away_goals}`
        resultCounts[result] = (resultCounts[result] || 0) + 1
      })

      const mostCommonResults = Object.entries(resultCounts)
        .map(([result, count]) => ({
          result,
          count,
          percentage: Number(((count / matches.length) * 100).toFixed(1))
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10) // Top 10 most common results

      // 2. Goals Trend Analysis (Over/Under 2.5)
      const over25Goals = matches.filter(match => 
        (match.full_time_home_goals + match.full_time_away_goals) > 2.5
      ).length
      const under25Goals = matches.length - over25Goals

      const goalsTrend = {
        over25Goals,
        under25Goals,
        over25Percentage: Number(((over25Goals / matches.length) * 100).toFixed(1)),
        under25Percentage: Number(((under25Goals / matches.length) * 100).toFixed(1))
      }

      // 3. BTTS Professional Analysis
      const bttsTrue = matches.filter(match => match.btts_computed === true).length
      const bttsFalse = matches.length - bttsTrue

      // Monthly BTTS trend
      const monthlyData: { [key: string]: { btts: number; total: number } } = {}
      matches.forEach(match => {
        const month = new Date(match.match_time).toLocaleDateString('hu-HU', { 
          year: 'numeric', 
          month: 'short' 
        })
        if (!monthlyData[month]) {
          monthlyData[month] = { btts: 0, total: 0 }
        }
        monthlyData[month].total++
        if (match.btts_computed) {
          monthlyData[month].btts++
        }
      })

      const monthlyTrend = Object.entries(monthlyData)
        .map(([month, data]) => ({
          month,
          bttsRate: Number(((data.btts / data.total) * 100).toFixed(1)),
          matches: data.total
        }))
        .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
        .slice(-6) // Last 6 months

      const bttsAnalysis = {
        bttsTrue,
        bttsFalse,
        bttsPercentage: Number(((bttsTrue / matches.length) * 100).toFixed(1)),
        monthlyTrend
      }

      // 4. Weekly Results Analysis
      const weeklyData: { [key: string]: { matches: Match[]; count: number } } = {
        'Hétfő': { matches: [], count: 0 },
        'Kedd': { matches: [], count: 0 },
        'Szerda': { matches: [], count: 0 },
        'Csütörtök': { matches: [], count: 0 },
        'Péntek': { matches: [], count: 0 },
        'Szombat': { matches: [], count: 0 },
        'Vasárnap': { matches: [], count: 0 }
      }

      const dayNames = ['Vasárnap', 'Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat']

      matches.forEach(match => {
        const dayIndex = new Date(match.match_time).getDay()
        const dayName = dayNames[dayIndex]
        weeklyData[dayName].matches.push(match)
        weeklyData[dayName].count++
      })

      const weeklyResults = Object.entries(weeklyData).map(([day, data]) => ({
        day,
        matches: data.count,
        avgGoals: data.count > 0 
          ? Number((data.matches.reduce((sum, match) => 
              sum + match.full_time_home_goals + match.full_time_away_goals, 0
            ) / data.count).toFixed(1))
          : 0,
        bttsRate: data.count > 0 
          ? Number(((data.matches.filter(m => m.btts_computed).length / data.count) * 100).toFixed(1))
          : 0
      }))

      setAnalytics({
        mostCommonResults,
        goalsTrend,
        bttsAnalysis,
        weeklyResults
      })

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Hiba az analitika betöltése során'
      setError(errorMessage)
      console.error('Advanced analytics error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAdvancedAnalytics()
  }, [])

  return {
    analytics,
    loading,
    error,
    refetch: fetchAdvancedAnalytics
  }
}