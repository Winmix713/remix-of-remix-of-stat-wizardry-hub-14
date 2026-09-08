CREATE TABLE public.matches (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  match_time TIMESTAMPTZ NOT NULL,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  half_time_home_goals INTEGER NOT NULL DEFAULT 0,
  half_time_away_goals INTEGER NOT NULL DEFAULT 0,
  full_time_home_goals INTEGER NOT NULL DEFAULT 0,
  full_time_away_goals INTEGER NOT NULL DEFAULT 0,
  btts_computed BOOLEAN GENERATED ALWAYS AS (full_time_home_goals > 0 AND full_time_away_goals > 0) STORED,
  comeback_computed BOOLEAN GENERATED ALWAYS AS (
    (half_time_home_goals < half_time_away_goals AND full_time_home_goals > full_time_away_goals) OR
    (half_time_home_goals > half_time_away_goals AND full_time_home_goals < full_time_away_goals)
  ) STORED,
  result_computed TEXT GENERATED ALWAYS AS (
    CASE WHEN full_time_home_goals > full_time_away_goals THEN 'H'
         WHEN full_time_home_goals < full_time_away_goals THEN 'A'
         ELSE 'D' END
  ) STORED,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX matches_match_time_idx ON public.matches (match_time DESC);
CREATE INDEX matches_home_team_idx ON public.matches (home_team);
CREATE INDEX matches_away_team_idx ON public.matches (away_team);

GRANT SELECT ON public.matches TO anon;
GRANT SELECT ON public.matches TO authenticated;
GRANT ALL ON public.matches TO service_role;

ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Matches are publicly readable"
  ON public.matches FOR SELECT
  TO anon, authenticated
  USING (true);