import { useEffect, useState } from 'react'
import { supabase, type Match } from '@/lib/supabase'
import { buildLeagueIndex, type LeagueIndex } from '@/lib/engine/forecast'

/** Loads the full match history once and builds the forecast index from it. */
export const useLeagueIndex = () => {
  const [index, setIndex] = useState<LeagueIndex | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const all: Match[] = []
        const size = 1000
        for (let from = 0; ; from += size) {
          const { data, error: qErr } = await supabase
            .from('matches')
            .select('*')
            .order('match_time', { ascending: true })
            .range(from, from + size - 1)
          if (qErr) throw qErr
          if (!data || data.length === 0) break
          all.push(...data)
          if (data.length < size) break
        }
        if (cancelled) return
        setIndex(buildLeagueIndex(all))
      } catch (err) {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Hiba az adatok betöltése során')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  return { index, loading, error }
}
