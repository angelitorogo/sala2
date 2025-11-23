// src/app/core/services/user-collections.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { MovieSummary, TvSummary } from '../../shared/models/user-collections/user-collections.model';
import { AuthService } from '../../auth/services/auth.service';
import { catchError, map, of, switchMap, throwError } from 'rxjs';

const API_BASE = environment.API_URL;

interface UserCollectionsResponse {
  movies: MovieSummary[];
  tv: TvSummary[];
}

@Injectable({ providedIn: 'root' })
export class UserCollectionsService {

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {}

  // ========== HELPERS ==========

  /**
   * Devuelve true si hay usuario logado con id, false si no.
   */
  private hasUser(): boolean {
    const user = this.authService.user;
    return !!user && !!user.id;
  }

  /**
   * Si no hay usuario, devolvemos un observable que falla con NOT_AUTHENTICATED.
   */
  private ensureAuthenticatedOrError() {
    if (!this.hasUser()) {
      return false;
    }
    return true;
  }

  // ========== CARGA COMPLETA (opcional) ==========

  /**
   * Devuelve TODAS las colecciones del usuario desde el backend.
   * No guarda nada en memoria, solo devuelve los datos.
   */
  loadCollections() {
    /*
    if (!this.hasUser()) {

      // Si no hay usuario, devolvemos colecciones vacías
      const empty: UserCollectionsResponse = { movies: [], tv: [] };
      return of(empty);
    }
      */

    return this.http.get<UserCollectionsResponse>(`${API_BASE}/collections`, {
      withCredentials: true,
    });
  }

  // ========== PELÍCULAS FAVORITAS ==========

  /**
   * Consulta al backend si una película concreta es favorita.
   * Estrategia sencilla: pide todas las colecciones y mira si está en movies.
   * (Más adelante, si quieres, podemos hacer un endpoint /collections/movies/:id)
   */
  isMovieFavorite(id: Number) {

    return this.http.post(`${API_BASE}/collections/movies/is-favorite`, {movieId: id});
  }

  /**
   * Llama al backend para alternar favorito (add/remove).
   * Devuelve 'added' o 'removed'. No mantiene ningún estado en memoria.
   */
  toggleMovieFavorite(movie: MovieSummary) {
    if (!this.hasUser()) {
      console.warn('[UserCollectionsService] Necesita login para favoritos');
      return throwError(() => new Error('NOT_AUTHENTICATED'));
    }

    return this.http.post<{ status: 'added' | 'removed' }>(
      `${API_BASE}/collections/movies/toggle`,
      {
        id: movie.id,
        title: movie.title,
        posterPath: movie.posterPath ?? null,
        voteAverage: movie.voteAverage ?? null,
      },
      {
        withCredentials: true,
      }
    ).pipe(
      map(res => res.status),
    );
  }

  // ========== SERIES SEGUIDAS ==========

  /**
   * Consulta al backend si una serie concreta está seguida.
   * Igual que con películas: cargamos colecciones y filtramos.
   */
  isTvFollowed(id: number) {
    
    return this.http.post(`${API_BASE}/collections/tv/is-favorite`, {tvId: id});

  }

  /**
   * Alterna el "seguir serie" en el backend.
   * Devuelve 'added' o 'removed'.
   */
  toggleTvFollow(tv: TvSummary) {
    if (!this.hasUser()) {
      console.warn('[UserCollectionsService] Necesita login para seguir series');
      return throwError(() => new Error('NOT_AUTHENTICATED'));
    }

    return this.http.post<{ status: 'added' | 'removed' }>(
      `${API_BASE}/collections/tv/toggle`,
      {
        id: tv.id,
        name: tv.name,
        posterPath: tv.posterPath ?? null,
        voteAverage: tv.voteAverage ?? null,
      },
      {
        withCredentials: true,
      }
    ).pipe(
      map(res => res.status),
    );
  }

}
