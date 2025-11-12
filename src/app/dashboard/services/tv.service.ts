import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

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

/** ⬇️ NUEVO: temporadas */
export interface TvSeason {
  id: number;
  name: string;
  air_date: string | null;
  episode_count: number;
  poster_path: string | null;
  season_number: number;
}

/** ⬇️ Ahora incluye seasons */
export interface TvDetails extends TvShow {
  genres: { id: number; name: string }[];
  number_of_seasons: number;
  number_of_episodes: number;
  homepage: string | null;
  seasons: TvSeason[]; // ✅ aquí
  videos?: { results: Array<{ key: string; site: string; type: string; name: string }> };
}

/* ========= Tipos extendidos útiles para detalle ========= */

export interface TvAggregateRole {
  character?: string;
  episode_count?: number;
}
export interface TvAggregateCast {
  id: number;
  name: string;
  roles?: TvAggregateRole[];
  profile_path?: string | null;
  total_episode_count?: number;
  order?: number;
  credit_id?: string;
}
export interface TvAggregateCrewJob {
  job?: string;
  episode_count?: number;
}
export interface TvAggregateCrew {
  id: number;
  name: string;
  jobs?: TvAggregateCrewJob[];
  department?: string;
  profile_path?: string | null;
  total_episode_count?: number;
  credit_id?: string;
}
export interface TvAggregateCreditsResponse {
  cast: TvAggregateCast[];
  crew: TvAggregateCrew[];
}

export interface TvVideoItem {
  id: string;
  key: string;
  name: string;
  site: string;   // 'YouTube'
  type: string;   // 'Trailer' | 'Teaser' | 'Clip' | 'Featurette' | ...
  official?: boolean;
  published_at?: string;
  iso_639_1?: string;   // ⬅️ opcional
  iso_3166_1?: string;  // ⬅️ opcional
  size?: number;        // ⬅️ opcional (360, 720, 1080...)
}

export interface TvVideosResponse { results: TvVideoItem[]; }

export interface TvImageItem {
  file_path: string;
  width: number;
  height: number;
  vote_average: number;
  vote_count: number;
  iso_639_1: string | null;
  aspect_ratio: number;
}
export interface TvImagesResponse {
  backdrops: TvImageItem[];
  posters: TvImageItem[];
  logos: TvImageItem[];
}

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
export interface TvWatchProvidersResponse {
  results: { [countryCode: string]: ProvidersByType };
}

export interface TvContentRatingsResponse {
  results: Array<{ iso_3166_1: string; rating: string; }>;
}

export interface TvListResponse extends PaginatedResponse<TvShow> {}

export interface TvKeywordsResponse {
  results?: Array<{ id: number; name: string }>;
  keywords?: Array<{ id: number; name: string }>;
}
export interface TvExternalIdsResponse {
  imdb_id?: string | null;
  facebook_id?: string | null;
  instagram_id?: string | null;
  twitter_id?: string | null;
}
export interface TvTranslationsResponse {
  translations: Array<{
    iso_3166_1: string;
    iso_639_1: string;
    name: string;
    english_name: string;
    data: { name?: string; overview?: string; homepage?: string };
  }>;
}

/** Detalle “todo en uno” de serie (extiende TvDetails que ya tiene seasons) */
export interface TvAllDetails extends TvDetails {
  aggregate_credits?: TvAggregateCreditsResponse;
  videos?: TvVideosResponse;
  images?: TvImagesResponse;
  ['watch/providers']?: TvWatchProvidersResponse;
  content_ratings?: TvContentRatingsResponse;
  recommendations?: TvListResponse;
  similar?: TvListResponse;
  keywords?: TvKeywordsResponse;
  external_ids?: TvExternalIdsResponse;
  translations?: TvTranslationsResponse;
  [key: string]: any;
}

export interface TvEpisode {
  id: number;
  name: string;
  overview: string;
  still_path: string | null;
  episode_number: number;
  season_number: number;
  air_date: string | null;
  runtime?: number | null;
  vote_average?: number;
  vote_count?: number;
  crew?: Array<{ id: number; name: string; job: string; profile_path: string | null }>;
  guest_stars?: Array<{ id: number; name: string; character?: string; profile_path: string | null }>;
}

export interface SeasonCastMember {
  id: number;
  name: string;
  character?: string;
  profile_path?: string | null;
  credit_id?: string;
  order?: number;
}

export interface SeasonCrewMember {
  id: number;
  name: string;
  job?: string;
  department?: string;
  profile_path?: string | null;
  credit_id?: string;
}

export interface SeasonCreditsResponse {
  cast: SeasonCastMember[];
  crew: SeasonCrewMember[];
}

export interface SeasonImagesResponse {
  posters: Array<{ file_path: string; width: number; height: number; vote_average: number; vote_count: number }>;
}

export interface SeasonVideosResponse {
  results: Array<{
    id: string;
    key: string;
    name: string;
    site: string;   // 'YouTube'
    type: string;   // 'Trailer' | 'Teaser' | 'Clip' | ...
    official?: boolean;
    published_at?: string;
    size?: number;
  }>;
}

export interface SeasonExternalIds {
  tvdb_id?: number | null;
  tvrage_id?: number | null;
  facebook_id?: string | null;
  instagram_id?: string | null;
  twitter_id?: string | null;
}

export interface TvSeasonDetails {
  _id?: string;
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  air_date: string | null;
  season_number: number;
  episodes: TvEpisode[];
}

export interface TvSeasonAllDetails extends TvSeasonDetails {
  credits?: SeasonCreditsResponse;
  images?: SeasonImagesResponse;
  videos?: SeasonVideosResponse;
  external_ids?: SeasonExternalIds;
  translations?: {
    translations: Array<{
      iso_3166_1: string;
      iso_639_1: string;
      name: string;
      english_name: string;
      data: { name?: string; overview?: string };
    }>;
  };

  [key: string]: any;
}

export interface TvEpisodeAllDetails extends TvEpisode {
  credits?: { cast: SeasonCastMember[]; crew: SeasonCrewMember[] };
  images?: { stills: Array<{ file_path: string; width: number; height: number; vote_average: number; vote_count: number }> };
  videos?: SeasonVideosResponse;
  external_ids?: SeasonExternalIds;
  translations?: any;

  [key: string]: any;
}



export type TvSortOption =
  | 'popularity.desc' | 'popularity.asc'
  | 'first_air_date.desc' | 'first_air_date.asc'
  | 'vote_average.desc' | 'vote_average.asc'
  | 'vote_count.desc' | 'vote_count.asc';

@Injectable({ providedIn: 'root' })
export class TvService {
  constructor(private http: HttpClient) {}

  getPopular(page = 1): Observable<PaginatedResponse<TvShow>> {
    return this.http.get<PaginatedResponse<TvShow>>(`${TMDB_BASE}/tv/popular`, { params: { page } as any });
  }
  getAiringToday(page = 1): Observable<PaginatedResponse<TvShow>> {
    return this.http.get<PaginatedResponse<TvShow>>(`${TMDB_BASE}/tv/airing_today`, { params: { page } as any });
  }
  getOnTheAir(page = 1): Observable<PaginatedResponse<TvShow>> {
    return this.http.get<PaginatedResponse<TvShow>>(`${TMDB_BASE}/tv/on_the_air`, { params: { page } as any });
  }
  getTopRated(page = 1): Observable<PaginatedResponse<TvShow>> {
    return this.http.get<PaginatedResponse<TvShow>>(`${TMDB_BASE}/tv/top_rated`, { params: { page } as any });
  }
  search(query: string, page = 1, includeAdult = false): Observable<PaginatedResponse<TvShow>> {
    return this.http.get<PaginatedResponse<TvShow>>(`${TMDB_BASE}/search/tv`, {
      params: { query, page, include_adult: includeAdult } as any,
    });
  }
  getDetails(tvId: number, appendVideos = true): Observable<TvDetails> {
    const params: any = appendVideos ? { append_to_response: 'videos' } : {};
    return this.http.get<TvDetails>(`${TMDB_BASE}/tv/${tvId}`, { params });
  }
  getRecommendations(tvId: number, page = 1): Observable<PaginatedResponse<TvShow>> {
    return this.http.get<PaginatedResponse<TvShow>>(`${TMDB_BASE}/tv/${tvId}/recommendations`, {
      params: { page } as any,
    });
  }
  getSimilar(tvId: number, page = 1): Observable<PaginatedResponse<TvShow>> {
    return this.http.get<PaginatedResponse<TvShow>>(`${TMDB_BASE}/tv/${tvId}/similar`, {
      params: { page } as any },
    );
  }
  getTrendingToday(page = 1): Observable<PaginatedResponse<TvShow>> {
    return this.http.get<PaginatedResponse<TvShow>>(
      `${TMDB_BASE}/trending/tv/day`,
      { params: { page } as any }
    );
  }

  discoverOnAir(options: {
    page?: number; with_genres?: number | null; sort_by?: TvSortOption;
  } = {}): Observable<PaginatedResponse<TvShow>> {
    const { page = 1, with_genres = null, sort_by = 'popularity.desc' } = options;
    const today = new Date();
    const toISO = (d: Date) => d.toISOString().slice(0, 10);
    const plusDays = (d: Date, n: number) => new Date(d.getTime() + n * 86400000);
    const minusDays = (d: Date, n: number) => new Date(d.getTime() - n * 86400000);
    const gte = toISO(minusDays(today, 21));
    const lte = toISO(plusDays(today, 21));
    const params: any = { page, sort_by, 'air_date.gte': gte, 'air_date.lte': lte, 'include_adult': false };
    if (with_genres) params['with_genres'] = with_genres;
    return this.http.get<PaginatedResponse<TvShow>>(`${TMDB_BASE}/discover/tv`, { params });
  }

  discoverAiringToday(options: {
    page?: number; with_genres?: number | null; sort_by?: TvSortOption;
  } = {}): Observable<PaginatedResponse<TvShow>> {
    const { page = 1, with_genres = null, sort_by = 'popularity.desc' } = options;
    const today = new Date();
    const toISO = (d: Date) => d.toISOString().slice(0, 10);
    const gte = toISO(today);
    const lte = toISO(today);
    const params: any = { page, sort_by, 'air_date.gte': gte, 'air_date.lte': lte, 'include_adult': false };
    if (with_genres) params['with_genres'] = with_genres;
    return this.http.get<PaginatedResponse<TvShow>>(`${TMDB_BASE}/discover/tv`, { params });
  }

  /* ========= ✅ TODO EN UNO (TV) ========= */
  getAllById(tvId: number): Observable<TvAllDetails> {
    const APPENDS = [
      'aggregate_credits',
      'videos',
      'images',
      'watch/providers',
      'content_ratings',
      'recommendations',
      'similar',
      'keywords',
      'external_ids',
      'translations'
    ].join(',');
    return this.http.get<TvAllDetails>(`${TMDB_BASE}/tv/${tvId}`, {
      params: { append_to_response: APPENDS } as any
    });
  }

  /** ✅ Temporada: TODO en uno (una sola petición) */
  getSeasonAll(tvId: number, seasonNumber: number): Observable<TvSeasonAllDetails> {
    const APPENDS = [
      'credits',
      'images',
      'videos',
      'external_ids',
      'translations'
    ].join(',');

    console.log(`${TMDB_BASE}/tv/${tvId}/season/${seasonNumber}`);

    return this.http.get<TvSeasonAllDetails>(
      `${TMDB_BASE}/tv/${tvId}/season/${seasonNumber}`,
      { params: { append_to_response: APPENDS } as any }
    ).pipe(
      tap( data => {
        console.log(data)
      })
    );
    // Nota: los episodios vienen en la propiedad "episodes" del propio payload.
  }

  /** (Opcional) Episodio: TODO en uno */
  getEpisodeAll(tvId: number, seasonNumber: number, episodeNumber: number): Observable<TvEpisodeAllDetails> {
    const APPENDS = ['credits', 'images', 'videos', 'external_ids', 'translations'].join(',');
    return this.http.get<TvEpisodeAllDetails>(
      `${TMDB_BASE}/tv/${tvId}/season/${seasonNumber}/episode/${episodeNumber}`,
      { params: { append_to_response: APPENDS } as any }
    );
  }

}
