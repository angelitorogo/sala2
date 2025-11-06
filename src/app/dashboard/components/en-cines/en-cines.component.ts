import { Component, OnDestroy, OnInit } from '@angular/core';
import { Movie, MoviesService, SortOption } from '../../services/movies.service';
import { Subscription } from 'rxjs';
import { PaginatedResponse } from '../../services/tv.service';

@Component({
  selector: 'app-en-cines',
  templateUrl: './en-cines.component.html',
  styleUrl: './en-cines.component.css'
})
export class EnCinesComponent implements OnInit, OnDestroy {
  loading = false;
  error: string | null = null;

  movies: Movie[] = [];
  page = 1;
  totalPages = 1;

  // Filtros mínimos para cartelera
  genreId: number | null = null;
  sortBy: SortOption = 'popularity.desc';

  openGenre = false;
  openSort = false;

  private sub?: Subscription;

  constructor(private moviesService: MoviesService) {}

  ngOnInit(): void {
    this.loadFirstPage();
    document.addEventListener('click', this._outsideClick, true);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    document.removeEventListener('click', this._outsideClick, true);
  }

  private _outsideClick = (ev: Event) => {
  const target = ev.target as HTMLElement;
  const select = target.closest('.select');
  if (!select) { this.openGenre = false; this.openSort = false; }
};

  async loadFirstPage(): Promise<void> {
    this.page = 1;
    this.movies = [];
    await this.loadMovies(true);
  }

  async loadMore(): Promise<void> {
    if (this.loading || this.page >= this.totalPages) return;
    this.page += 1;
    await this.loadMovies(false);
  }

  async applyFilters(): Promise<void> {
    await this.loadFirstPage();
  }

  async resetFilters(): Promise<void> {
    this.genreId = null;
    this.sortBy = 'popularity.desc';
    await this.loadFirstPage();
  }

  get usingFilters(): boolean {
    return this.genreId !== null || this.sortBy !== 'popularity.desc';
  }

  trackByMovie = (_: number, m: Movie) => m.id;

  posterUrl(path: string | null, size: 'w342' | 'w500' = 'w342'): string {
    if (!path) return 'assets/placeholders/poster-placeholder.svg';
    return `https://image.tmdb.org/t/p/${size}${path}`;
  }

  private async loadMovies(replace: boolean): Promise<void> {
    this.loading = true;
    this.error = null;

    const source$ = this.usingFilters
      ? this.moviesService.discoverNowInCinemas({
          page: this.page,
          with_genres: this.genreId,
          sort_by: this.sortBy,
        })
      : this.moviesService.getNowPlaying(this.page);

    this.sub?.unsubscribe();
    this.sub = source$.subscribe({
      next: (res: PaginatedResponse<Movie>) => {
        this.totalPages = res.total_pages ?? 1;
        this.movies = replace ? res.results : [...this.movies, ...res.results];
        this.loading = false;
      },
      error: () => {
        this.error = 'No se han podido cargar las películas en cartelera.';
        this.loading = false;
      },
    });
  }

  toggle(which: 'genre' | 'sort') {
    if (which === 'genre') {
      this.openGenre = !this.openGenre;
      this.openSort = false;
    } else {
      this.openSort = !this.openSort;
      this.openGenre = false;
    }
  }

  setGenre(id: number | null) {
    this.genreId = id;
    this.openGenre = false;
    this.applyFilters();
  }

  setSort(val: SortOption) {
    this.sortBy = val;
    this.openSort = false;
    this.applyFilters();
  }

  getGenreLabel(id: number | null): string {
    const map = new Map<number, string>([
      [28,'Acción'],[12,'Aventura'],[16,'Animación'],[35,'Comedia'],
      [18,'Drama'],[27,'Terror'],[53,'Thriller'],[878,'Ciencia ficción'],
    ]);
    return id == null ? 'Todos' : (map.get(id) ?? 'Género');
  }

  getSortLabel(s: SortOption): string {
    switch (s) {
      case 'vote_average.desc': return 'Mejor valoradas';
      case 'release_date.desc': return 'Más recientes';
      default: return 'Popularidad';
    }
  }

  /* Cerrar con teclado y click fuera */
  onKeydown(e: KeyboardEvent, which: 'genre' | 'sort') {
    if (e.key === 'Escape') {
      this.openGenre = false; this.openSort = false;
    }
  }

}

