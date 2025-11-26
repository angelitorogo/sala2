// src/app/shared/services/search.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { forkJoin, map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface TmdbSearchResult {
  id: number;
  media_type: 'movie' | 'tv' | 'person';
  title?: string;          // para películas
  name?: string;           // para series/personas
  overview?: string;
  poster_path?: string;
  profile_path?: string;
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
  popularity?: number;
}

export interface TmdbSearchResponse {
  page: number;
  total_pages: number;
  total_results: number;
  results: TmdbSearchResult[];
}

const TMDB_BASE = 'https://api.themoviedb.org/3';

@Injectable({ providedIn: 'root' })
export class SearchService {

  // adapta estos nombres a tu environment si son distintos
  private readonly baseUrl = TMDB_BASE || 'https://api.themoviedb.org/3';
  //private readonly apiKey  = environment.TMDBAPIKEY;

  private data : {
    resultados: TmdbSearchResult[];
    query: String;
  } = {
    resultados: [],
    query : '',
  };


  constructor(private http: HttpClient) {}


  setResults(results: TmdbSearchResult[], query: string) {
    this.data.resultados = results;
    this.data.query = query;
  }

  get results(): any {
    return this.data;
  }

  get resultados(): TmdbSearchResult[] {
    return this.data.resultados;
  }

  fetch180ByType(query: string): Observable<{
    movies: TmdbSearchResult[];
    tv: TmdbSearchResult[];
    persons: TmdbSearchResult[];
  }> {


    return forkJoin({
      // 2 páginas de cada tipo (20 x página = 40)
      moviesP1: this.searchMovies(query, 1),
      moviesP2: this.searchMovies(query, 2),
      moviesP3: this.searchMovies(query, 3),
      tvP1: this.searchTv(query, 1),
      tvP2: this.searchTv(query, 2),
      tvP3: this.searchTv(query, 3),
      personsP1: this.searchPersons(query, 1),
      personsP2: this.searchPersons(query, 2),
      personsP3: this.searchPersons(query, 3),
    }).pipe(
      map(({ moviesP1, moviesP2, moviesP3, tvP1, tvP2, tvP3, personsP1, personsP2, personsP3 }) => {
        const movies = [...moviesP1, ...moviesP2, ...moviesP3].slice(0, 40);
        const tv = [...tvP1, ...tvP2, ...tvP3].slice(0, 40);
        const persons = [...personsP1, ...personsP2, ...personsP3].slice(0, 40);

        return { movies, tv, persons };
      })
    );
  }

  private searchMovies(query: string, page: number = 1): Observable<TmdbSearchResult[]> {
    const params = new HttpParams()
      .set('query', query)
      .set('page', page)
      .set('include_adult', 'false');

    return this.http
      .get<any>(`${this.baseUrl}/search/movie`, { params })
      .pipe(
        map(res =>
          (res.results ?? []).map((r: any) => ({
            ...r,
            media_type: 'movie' as const,
          }))
        )
      );
  }

  private searchTv(query: string, page: number = 1): Observable<TmdbSearchResult[]> {
    const params = new HttpParams()
      .set('query', query)
      .set('page', page)
      .set('include_adult', 'false');

    return this.http
      .get<any>(`${this.baseUrl}/search/tv`, { params })
      .pipe(
        map(res =>
          (res.results ?? []).map((r: any) => ({
            ...r,
            media_type: 'tv' as const,
          }))
        )
      );
  }

  private searchPersons(query: string, page: number = 1): Observable<TmdbSearchResult[]> {
    const params = new HttpParams()
      .set('query', query)
      .set('page', page)
      .set('include_adult', 'false');

    return this.http
      .get<any>(`${this.baseUrl}/search/person`, { params })
      .pipe(
        map(res =>
          (res.results ?? []).map((r: any) => ({
            ...r,
            media_type: 'person' as const,
          }))
        )
      );
  }

}
