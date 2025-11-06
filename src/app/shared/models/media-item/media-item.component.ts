export type MediaType = 'movie' | 'tv';

export interface MediaItem {
  id: number;
  poster_path: string | null;
  backdrop_path?: string | null;
  vote_average?: number; // 0..10
  title?: string;        // movies
  name?: string;         // tv
  release_date?: string; // movies
  first_air_date?: string; // tv
}
