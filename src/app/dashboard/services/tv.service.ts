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

export interface TvShow {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  genre_ids?: number[];
}

export interface TvDetails extends TvShow {
  genres: { id: number; name: string }[];
  number_of_seasons: number;
  number_of_episodes: number;
  homepage: string | null;
  videos?: { results: Array<{ key: string; site: string; type: string; name: string }> };
}

@Injectable({ providedIn: 'root' })
export class TvService {
  constructor(private http: HttpClient) {}

  /** Series populares (paginado) */
  getPopular(page = 1): Observable<PaginatedResponse<TvShow>> {
    return this.http.get<PaginatedResponse<TvShow>>(`${TMDB_BASE}/tv/popular`, { params: { page } as any });
  }

  /** En emisión hoy */
  getAiringToday(page = 1): Observable<PaginatedResponse<TvShow>> {
    return this.http.get<PaginatedResponse<TvShow>>(`${TMDB_BASE}/tv/airing_today`, { params: { page } as any });
  }

  /** En emisión actualmente */
  getOnTheAir(page = 1): Observable<PaginatedResponse<TvShow>> {
    return this.http.get<PaginatedResponse<TvShow>>(`${TMDB_BASE}/tv/on_the_air`, { params: { page } as any });
  }

  /** Mejor valoradas */
  getTopRated(page = 1): Observable<PaginatedResponse<TvShow>> {
    return this.http.get<PaginatedResponse<TvShow>>(`${TMDB_BASE}/tv/top_rated`, { params: { page } as any });
  }

  /** Búsqueda por texto */
  search(query: string, page = 1, includeAdult = false): Observable<PaginatedResponse<TvShow>> {
    return this.http.get<PaginatedResponse<TvShow>>(`${TMDB_BASE}/search/tv`, {
      params: { query, page, include_adult: includeAdult } as any,
    });
  }

  /** Detalle + videos (trailers) */
  getDetails(tvId: number, appendVideos = true): Observable<TvDetails> {
    const params: any = appendVideos ? { append_to_response: 'videos' } : {};
    return this.http.get<TvDetails>(`${TMDB_BASE}/tv/${tvId}`, { params });
  }

  /** Recomendaciones basadas en una serie */
  getRecommendations(tvId: number, page = 1): Observable<PaginatedResponse<TvShow>> {
    return this.http.get<PaginatedResponse<TvShow>>(`${TMDB_BASE}/tv/${tvId}/recommendations`, {
      params: { page } as any,
    });
  }

  /** Similares */
  getSimilar(tvId: number, page = 1): Observable<PaginatedResponse<TvShow>> {
    return this.http.get<PaginatedResponse<TvShow>>(`${TMDB_BASE}/tv/${tvId}/similar`, {
      params: { page } as any,
    });
  }

  /** Tendencias de hoy (series) */
  getTrendingToday(page = 1): Observable<PaginatedResponse<TvShow>> {
    return this.http.get<PaginatedResponse<TvShow>>(
      `${TMDB_BASE}/trending/tv/day`,
      { params: { page } as any }
    );
  }
  
}
