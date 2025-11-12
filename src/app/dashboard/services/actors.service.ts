import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

const TMDB_BASE = 'https://api.themoviedb.org/3';

/* ===== Tipos base ===== */
export interface PaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

/* ====== Person / Actor ====== */
export interface Person {
  id: number;
  name: string;
  biography: string | null;
  birthday: string | null;
  deathday: string | null;
  gender: 0 | 1 | 2 | 3; // 0 Unknown, 1 Female, 2 Male, 3 Non-binary (TMDB)
  known_for_department: string | null;
  profile_path: string | null;
  place_of_birth: string | null;
  homepage: string | null;
  popularity: number;
  also_known_as: string[];
}

/* ====== Imágenes ====== */
export interface ImageItem {
  file_path: string;
  width: number;
  height: number;
  vote_average: number;
  vote_count: number;
  iso_639_1: string | null;
  aspect_ratio: number;
}
export interface PersonImagesResponse {
  profiles: ImageItem[];
}

/* ====== External IDs ====== */
export interface PersonExternalIds {
  imdb_id?: string | null;
  facebook_id?: string | null;
  instagram_id?: string | null;
  twitter_id?: string | null;
  tiktok_id?: string | null;
  wikidata_id?: string | null;
  youtube_id?: string | null;
}

/* ====== Credits combinados (cine + series) ====== */
export interface CombinedCast {
  adult?: boolean;
  backdrop_path?: string | null;
  id: number;
  title?: string;           // movies
  name?: string;            // tv
  original_title?: string;
  original_name?: string;
  overview?: string;
  poster_path?: string | null;
  media_type: 'movie' | 'tv';
  genre_ids?: number[];
  popularity?: number;
  release_date?: string;     // movie
  first_air_date?: string;   // tv
  vote_average?: number;
  vote_count?: number;
  character?: string | null;
  credit_id?: string;
  episode_count?: number;
}
export interface CombinedCrew extends Omit<CombinedCast, 'character'> {
  department?: string | null;
  job?: string | null;
}

export interface CombinedCreditsResponse {
  cast: CombinedCast[];
  crew: CombinedCrew[];
}

/* ====== Tagged Images (imágenes etiquetadas en títulos) ====== */
export interface TaggedImage {
  file_path: string;
  width: number;
  height: number;
  vote_average: number;
  vote_count: number;
  media_type: 'movie' | 'tv';
  iso_639_1: string | null;
  aspect_ratio: number;
}
export interface TaggedImagesResponse {
  page: number;
  results: TaggedImage[];
  total_pages: number;
  total_results: number;
}

/* ====== Translations (bio localizada) ====== */
export interface PersonTranslationsResponse {
  translations: Array<{
    iso_3166_1: string;
    iso_639_1: string;
    name: string;
    english_name: string;
    data: { biography?: string };
  }>;
}

/* ====== Resultado “todo en uno” ====== */
export interface PersonAllDetails extends Person {
  images?: PersonImagesResponse;
  combined_credits?: CombinedCreditsResponse;
  external_ids?: PersonExternalIds;
  tagged_images?: TaggedImagesResponse;
  translations?: PersonTranslationsResponse;

  // tolerancia ante agregados futuros
  [key: string]: any;
}

@Injectable({ providedIn: 'root' })
export class ActorsService {
  constructor(private http: HttpClient) {}

  /** Búsqueda de personas (paginada) */
  search(query: string, page = 1): Observable<PaginatedResponse<Person>> {
    return this.http.get<PaginatedResponse<Person>>(
      `${TMDB_BASE}/search/person`,
      { params: { query, page } as any }
    ).pipe(
      tap( (res) => {
        console.log('[ActorsService] search()', query, res);
      })
    );
  }

  /** Personas populares (paginada) */
  getPopular(page = 1): Observable<PaginatedResponse<Person>> {
    return this.http.get<PaginatedResponse<Person>>(
      `${TMDB_BASE}/person/popular`,
      { params: { page } as any }
    );
  }

  /** Detalle básico (por compatibilidad) */
  getDetails(personId: number): Observable<Person> {
    return this.http.get<Person>(`${TMDB_BASE}/person/${personId}`);
  }

  /** ✅ TODO EN UNO por ID (una sola petición con append_to_response) */
  getAllById(personId: number): Observable<PersonAllDetails> {
    const APPENDS = [
      'images',
      'combined_credits',
      'external_ids',
      'tagged_images',
      'translations'
    ].join(',');
    return this.http.get<PersonAllDetails>(`${TMDB_BASE}/person/${personId}`, {
      params: { append_to_response: APPENDS } as any
    });
  }
}
