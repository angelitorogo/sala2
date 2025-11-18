export interface MovieSummary {
  id: number;              // TMDB id
  title: string;
  posterPath: string | null;
  voteAverage: number;
}

export interface TvSummary {
  id: number;              // TMDB id
  name: string;
  posterPath: string | null;
  voteAverage: number;
}