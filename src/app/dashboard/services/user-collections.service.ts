// src/app/core/services/user-collections.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MovieSummary, TvSummary } from '../../shared/models/user-collections/user-collections.model';
import { AuthService } from '../../auth/services/auth.service';

const STORAGE_MOVIES_KEY = 'sala2_fav_movies';
const STORAGE_TV_KEY = 'sala2_followed_tv';

@Injectable({ providedIn: 'root' })
export class UserCollectionsService {
  private favMoviesSubject = new BehaviorSubject<MovieSummary[]>([]);
  favMovies$ = this.favMoviesSubject.asObservable();

  private followedTvSubject = new BehaviorSubject<TvSummary[]>([]);
  followedTv$ = this.followedTvSubject.asObservable();

  constructor(private authService: AuthService) {
    // Cargamos del storage al iniciar
    this.loadFromStorage();
  }

  // --- Películas favoritas ---

  private loadFromStorage(): void {
    try {
      const moviesRaw = localStorage.getItem(STORAGE_MOVIES_KEY);
      const tvRaw = localStorage.getItem(STORAGE_TV_KEY);

      if (moviesRaw) {
        this.favMoviesSubject.next(JSON.parse(moviesRaw));
      }
      if (tvRaw) {
        this.followedTvSubject.next(JSON.parse(tvRaw));
      }
    } catch (err) {
      console.error('[UserCollectionsService] Error leyendo localStorage', err);
    }
  }

  private saveMovies(): void {
    localStorage.setItem(
      STORAGE_MOVIES_KEY,
      JSON.stringify(this.favMoviesSubject.value)
    );
  }

  private saveTv(): void {
    localStorage.setItem(
      STORAGE_TV_KEY,
      JSON.stringify(this.followedTvSubject.value)
    );
  }

  isMovieFavorite(id: number): boolean {
    return this.favMoviesSubject.value.some(m => m.id === id);
  }

  toggleMovieFavorite(movie: MovieSummary): void {
    if (!this.authService.user) {
      // aquí podrías lanzar un modal / navegar al login
      console.warn('[UserCollectionsService] Necesita login para favoritos');
      return;
    }

    const current = this.favMoviesSubject.value;
    const exists = current.some(m => m.id === movie.id);

    const updated = exists
      ? current.filter(m => m.id !== movie.id)
      : [...current, movie];

    this.favMoviesSubject.next(updated);
    this.saveMovies();
  }

  // --- Series seguidas ---

  isTvFollowed(id: number): boolean {
    return this.followedTvSubject.value.some(t => t.id === id);
  }

  toggleTvFollow(tv: TvSummary): void {
    if (!this.authService.user) {
      console.warn('[UserCollectionsService] Necesita login para seguir series');
      return;
    }

    const current = this.followedTvSubject.value;
    const exists = current.some(t => t.id === tv.id);

    const updated = exists
      ? current.filter(t => t.id !== tv.id)
      : [...current, tv];

    this.followedTvSubject.next(updated);
    this.saveTv();
  }
}
