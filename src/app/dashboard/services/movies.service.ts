// src/app/shared/services/movies.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const TMDB_BASE = 'https://api.themoviedb.org/3';

/* =========================
 *        Tipos base
 * ========================= */

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

/* =========================
 *    Tipos extendidos TMDB
 * ========================= */

// Créditos
export interface CastMember {
  id: number;
  name: string;
  character?: string;
  profile_path?: string | null;
  order?: number;
  credit_id?: string;
}
export interface CrewMember {
  id: number;
  name: string;
  job?: string;
  department?: string;
  profile_path?: string | null;
  credit_id?: string;
}
export interface CreditsResponse {
  cast: CastMember[];
  crew: CrewMember[];
}

// Vídeos
export interface VideoItem {
  id: string;
  key: string;
  name: string;
  site: string;   // 'YouTube'
  type: string;   // 'Trailer' | 'Teaser' | ...
  official?: boolean;
  published_at?: string;
}
export interface VideosResponse { results: VideoItem[]; }

// Imágenes
export interface ImageItem {
  file_path: string;
  width: number;
  height: number;
  vote_average: number;
  vote_count: number;
  iso_639_1: string | null;
  aspect_ratio: number;
}
export interface ImagesResponse {
  backdrops: ImageItem[];
  posters: ImageItem[];
  logos: ImageItem[];
}

// Proveedores (dónde ver)
export interface ProviderItem {
  display_priority: number;
  logo_path: string;
  provider_id: number;
  provider_name: string;
}
export interface ProvidersByType {
  flatrate?: ProviderItem[];
  buy?: ProviderItem[];
  rent?: ProviderItem[];
  ads?: ProviderItem[];
  free?: ProviderItem[];
}
export interface WatchProvidersResponse {
  results: { [countryCode: string]: ProvidersByType };
}

// Fechas de estreno / certificaciones
export interface ReleaseDatesResponse {
  results: Array<{
    iso_3166_1: string;
    release_dates: Array<{
      certification: string;
      iso_639_1: string | null;
      note?: string;
      release_date: string;
      type: number;
    }>;
  }>;
}

// Recomendaciones/similares
export interface MovieListResponse extends PaginatedResponse<Movie> {}

// Otros añadidos útiles
export interface KeywordsResponse {
  keywords?: Array<{ id: number; name: string }>;
  keywords_results?: Array<{ id: number; name: string }>; // por compatibilidad
}
export interface ExternalIdsResponse {
  imdb_id?: string | null;
  facebook_id?: string | null;
  instagram_id?: string | null;
  twitter_id?: string | null;
}
export interface TranslationsResponse {
  translations: Array<{
    iso_3166_1: string;
    iso_639_1: string;
    name: string;
    english_name: string;
    data: { title?: string; overview?: string; homepage?: string };
  }>;
}

/**
 * Detalle “todo en uno” de película.
 * Incluye campos base + agregados que pedimos con append_to_response.
 */
export interface MovieAllDetails extends MovieDetails {
  credits?: CreditsResponse;
  videos?: VideosResponse;
  images?: ImagesResponse;
  ['watch/providers']?: WatchProvidersResponse;
  release_dates?: ReleaseDatesResponse;
  recommendations?: MovieListResponse;
  similar?: MovieListResponse;
  keywords?: KeywordsResponse;
  external_ids?: ExternalIdsResponse;
  translations?: TranslationsResponse;

  // Para tolerar futuros agregados sin romper TS:
  [key: string]: any;
}

export type SortOption =
  | 'popularity.desc'
  | 'popularity.asc'
  | 'release_date.desc'
  | 'release_date.asc'
  | 'vote_average.desc'
  | 'vote_average.asc'
  | 'vote_count.desc'
  | 'vote_count.asc';

@Injectable({ providedIn: 'root' })
export class MoviesService {
  constructor(private http: HttpClient) {}

  /** Populares (paginado) */
  getPopular(page = 1): Observable<PaginatedResponse<Movie>> {
    return this.http.get<PaginatedResponse<Movie>>(
      `${TMDB_BASE}/movie/popular`,
      { params: { page } as any }
    );
  }

  /** En cartelera (now playing) */
  getNowPlaying(page = 1): Observable<PaginatedResponse<Movie>> {
    return this.http.get<PaginatedResponse<Movie>>(
      `${TMDB_BASE}/movie/now_playing`,
      { params: { page } as any }
    );
  }

  /** Próximos estrenos */
  getUpcoming(page = 1): Observable<PaginatedResponse<Movie>> {
    return this.http.get<PaginatedResponse<Movie>>(
      `${TMDB_BASE}/movie/upcoming`,
      { params: { page } as any }
    );
  }

  /** Mejor valoradas */
  getTopRated(page = 1): Observable<PaginatedResponse<Movie>> {
    return this.http.get<PaginatedResponse<Movie>>(
      `${TMDB_BASE}/movie/top_rated`,
      { params: { page } as any }
    );
  }

  /** Búsqueda por texto */
  search(query: string, page = 1, includeAdult = false): Observable<PaginatedResponse<Movie>> {
    return this.http.get<PaginatedResponse<Movie>>(
      `${TMDB_BASE}/search/movie`,
      { params: { query, page, include_adult: includeAdult } as any }
    );
  }

  /** Detalle + vídeos (lo dejo por compatibilidad con tu código) */
  getDetails(movieId: number, appendVideos = true): Observable<MovieDetails> {
    const params: any = appendVideos ? { append_to_response: 'videos' } : {};
    return this.http.get<MovieDetails>(`${TMDB_BASE}/movie/${movieId}`, { params });
  }

  /** Recomendaciones basadas en una película */
  getRecommendations(movieId: number, page = 1): Observable<PaginatedResponse<Movie>> {
    return this.http.get<PaginatedResponse<Movie>>(
      `${TMDB_BASE}/movie/${movieId}/recommendations`,
      { params: { page } as any }
    );
  }

  /** Similares */
  getSimilar(movieId: number, page = 1): Observable<PaginatedResponse<Movie>> {
    return this.http.get<PaginatedResponse<Movie>>(
      `${TMDB_BASE}/movie/${movieId}/similar`,
      { params: { page } as any }
    );
  }

  /** Tendencias de hoy (películas) */
  getTrendingToday(page = 1): Observable<PaginatedResponse<Movie>> {
    return this.http.get<PaginatedResponse<Movie>>(
      `${TMDB_BASE}/trending/movie/day`,
      { params: { page } as any }
    );
  }

  /**
   * Descubrir películas actualmente en cines (ventana alrededor de “hoy”).
   */
  discoverNowInCinemas(options: {
    page?: number;
    with_genres?: number | null;
    sort_by?: SortOption;
  } = {}): Observable<PaginatedResponse<Movie>> {
    const { page = 1, with_genres = null, sort_by = 'popularity.desc' } = options;

    const today = new Date();
    const toISO = (d: Date) => d.toISOString().slice(0, 10);
    const minusDays = (d: Date, n: number) => new Date(d.getTime() - n * 86400000);
    const plusDays = (d: Date, n: number) => new Date(d.getTime() + n * 86400000);

    const gte = toISO(minusDays(today, 28));
    const lte = toISO(plusDays(today, 14));

    const params: any = {
      page,
      sort_by,
      'with_release_type': '2|3',
      'release_date.gte': gte,
      'release_date.lte': lte,
      'include_adult': false
    };

    if (with_genres) params['with_genres'] = with_genres;

    return this.http.get<PaginatedResponse<Movie>>(`${TMDB_BASE}/discover/movie`, { params });
  }

  /** Próximos estrenos (future window) */
  discoverUpcoming(options: {
    page?: number;
    with_genres?: number | null;
    sort_by?: SortOption;
  } = {}): Observable<PaginatedResponse<Movie>> {
    const { page = 1, with_genres = null, sort_by = 'release_date.asc' } = options;

    const today = new Date();
    const toISO = (d: Date) => d.toISOString().slice(0, 10);
    const plusDays = (d: Date, n: number) => new Date(d.getTime() + n * 86400000);

    const gte = toISO(plusDays(today, 1));
    const lte = toISO(plusDays(today, 90));

    const params: any = {
      page,
      sort_by,
      'with_release_type': '2|3',
      'release_date.gte': gte,
      'release_date.lte': lte,
      'include_adult': false,
    };

    if (with_genres) params['with_genres'] = with_genres;

    return this.http.get<PaginatedResponse<Movie>>(`${TMDB_BASE}/discover/movie`, { params });
  }

  /* =========================================
   *  ✅ MÉTODO SIMPLE “TODO EN UNO” POR ID
   * =========================================
   *
   * Este método hace UNA petición y devuelve el detalle completo
   * de una película con la mayor cantidad de agregados útiles.
   *
   * Si algún agregado no te interesa, quítalo del string APPENDS.
   */
  getAllById(movieId: number): Observable<MovieAllDetails> {
    const APPENDS =
      [
        'credits',
        'videos',
        'images',
        'watch/providers',
        'release_dates',
        'recommendations',
        'similar',
        'keywords',
        'external_ids',
        'translations'
      ].join(',');

    return this.http.get<MovieAllDetails>(`${TMDB_BASE}/movie/${movieId}`, {
      params: { append_to_response: APPENDS } as any
    });
  }
}
