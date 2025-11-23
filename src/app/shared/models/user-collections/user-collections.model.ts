export interface MovieSummary {
  id: number;  
  movieId?: number;            // TMDB id
  title: string;
  posterPath: string | null;
  voteAverage: number;
}

export interface TvSummary {
  id: number;  
  tvId?: number;            // TMDB id
  name: string;
  posterPath: string | null;
  voteAverage: number;
}