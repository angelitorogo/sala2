import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const TMDB_BASE = 'https://api.themoviedb.org/3';

export interface PaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  genre_ids?: number[];
}

export interface MovieDetails extends Movie {
  genres: { id: number; name: string }[];
  runtime: number | null;
  homepage: string | null;
  videos?: { results: Array<{ key: string; site: string; type: string; name: string }> };
}

@Injectable({ providedIn: 'root' })
export class MoviesService {
  constructor(private http: HttpClient) {}

  /** Populares (paginado) */
  getPopular(page = 1): Observable<PaginatedResponse<Movie>> {
    return this.http.get<PaginatedResponse<Movie>>(`${TMDB_BASE}/movie/popular`, { params: { page } as any });
  }

  /** En cartelera (now playing) */
  getNowPlaying(page = 1): Observable<PaginatedResponse<Movie>> {
    return this.http.get<PaginatedResponse<Movie>>(`${TMDB_BASE}/movie/now_playing`, { params: { page } as any });
  }

  /** Próximos estrenos */
  getUpcoming(page = 1): Observable<PaginatedResponse<Movie>> {
    return this.http.get<PaginatedResponse<Movie>>(`${TMDB_BASE}/movie/upcoming`, { params: { page } as any });
  }

  /** Mejor valoradas */
  getTopRated(page = 1): Observable<PaginatedResponse<Movie>> {
    return this.http.get<PaginatedResponse<Movie>>(`${TMDB_BASE}/movie/top_rated`, { params: { page } as any });
  }

  /** Búsqueda por texto */
  search(query: string, page = 1, includeAdult = false): Observable<PaginatedResponse<Movie>> {
    return this.http.get<PaginatedResponse<Movie>>(`${TMDB_BASE}/search/movie`, {
      params: { query, page, include_adult: includeAdult } as any,
    });
  }

  /** Detalle + videos (trailers) */
  getDetails(movieId: number, appendVideos = true): Observable<MovieDetails> {
    const params: any = appendVideos ? { append_to_response: 'videos' } : {};
    return this.http.get<MovieDetails>(`${TMDB_BASE}/movie/${movieId}`, { params });
  }

  /** Recomendaciones basadas en una película */
  getRecommendations(movieId: number, page = 1): Observable<PaginatedResponse<Movie>> {
    return this.http.get<PaginatedResponse<Movie>>(`${TMDB_BASE}/movie/${movieId}/recommendations`, {
      params: { page } as any,
    });
  }

  /** Similares */
  getSimilar(movieId: number, page = 1): Observable<PaginatedResponse<Movie>> {
    return this.http.get<PaginatedResponse<Movie>>(`${TMDB_BASE}/movie/${movieId}/similar`, {
      params: { page } as any,
    });
  }

  /** Tendencias de hoy (películas) */
  getTrendingToday(page = 1): Observable<PaginatedResponse<Movie>> {
    return this.http.get<PaginatedResponse<Movie>>(
      `${TMDB_BASE}/trending/movie/day`,
      { params: { page } as any }
    );
}
}
