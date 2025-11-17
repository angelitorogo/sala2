import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  TvShow,
  TvService,
  TvSortOption,
  PaginatedResponse,
} from '../../services/tv.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-series-populares',
  templateUrl: './series-populares.component.html',
  styleUrl: './series-populares.component.css',
})
export class SeriesPopularesComponent implements OnInit, OnDestroy, AfterViewInit {
  loading = false;
  error: string | null = null;

  series: TvShow[] = [];
  page = 1;
  totalPages = 1;

  // Filtros para series populares
  genreId: number | null = null;
  sortBy: TvSortOption = 'popularity.desc';

  openGenre = false;
  openSort = false;

  @ViewChild('gridHost', { static: false }) gridHost!: ElementRef<HTMLElement>;

  /** Datos de scroll relativos al <main class="grid"> */
  gridScrollProgress = 0; // 0..1
  gridInViewport = false;
  gridNearBottom = false;

  private sub?: Subscription;

  constructor(private tvService: TvService, private router: Router) {}

  ngOnInit(): void {
    this.loadFirstPage();
    document.addEventListener('click', this._outsideClick, true);
  }

  ngAfterViewInit(): void {
    this.updateMainScrollInfo();
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    this.updateMainScrollInfo();
  }

  @HostListener('window:resize')
  onWindowResize() {
    this.updateMainScrollInfo();
  }

  private updateMainScrollInfo(thresholdPx = 200) {
    const el = this.gridHost?.nativeElement;
    if (!el) return;

    const viewportTop =
      window.scrollY || document.documentElement.scrollTop || 0;
    const viewportH =
      window.innerHeight || document.documentElement.clientHeight || 0;

    const rect = el.getBoundingClientRect();
    const elTopDoc = rect.top + viewportTop;
    const elHeight = el.scrollHeight;

    const viewportBottom = viewportTop + viewportH;
    const elBottomDoc = elTopDoc + elHeight;
    this.gridInViewport =
      elBottomDoc > viewportTop && elTopDoc < viewportBottom;

    const totalScrollable = Math.max(elHeight - viewportH, 1);
    const current = Math.min(
      Math.max(viewportTop - elTopDoc, 0),
      totalScrollable
    );
    this.gridScrollProgress = +(current / totalScrollable).toFixed(4);

    this.gridNearBottom = viewportBottom >= elBottomDoc - thresholdPx;

    if (this.gridNearBottom) {
      this.loadMore();
    }
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    document.removeEventListener('click', this._outsideClick, true);
  }

  private _outsideClick = (ev: Event) => {
    const target = ev.target as HTMLElement;
    const select = target.closest('.select');
    if (!select) {
      this.openGenre = false;
      this.openSort = false;
    }
  };

  async loadFirstPage(): Promise<void> {
    this.page = 1;
    this.series = [];
    await this.loadSeries(true);
  }

  async loadMore(): Promise<void> {
    if (this.loading || this.page >= this.totalPages) return;
    this.page += 1;
    await this.loadSeries(false);
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

  trackBySeries = (_: number, t: TvShow) => t.id;

  posterUrl(path: string | null, size: 'w342' | 'w500' = 'w342'): string {
    if (!path) return 'assets/images/poster-placeholder.png';
    return `https://image.tmdb.org/t/p/${size}${path}`;
  }

  private async loadSeries(replace: boolean): Promise<void> {
    this.loading = true;
    this.error = null;

    const source$ = this.usingFilters
      ? this.tvService.discoverPopular({
          page: this.page,
          with_genres: this.genreId,
          sort_by: this.sortBy,
        })
      : this.tvService.getPopular(this.page);

    this.sub?.unsubscribe();
    this.sub = source$.subscribe({
      next: (res: PaginatedResponse<TvShow>) => {
        this.totalPages = res.total_pages ?? 1;
        this.series = replace ? res.results : [...this.series, ...res.results];
        this.loading = false;
      },
      error: () => {
        this.error = 'No se han podido cargar las series populares.';
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

  setSort(val: TvSortOption) {
    this.sortBy = val;
    this.openSort = false;
    this.applyFilters();
  }

  getGenreLabel(id: number | null): string {
    const map = new Map<number, string>([
      [16, 'Animación'],
      [35, 'Comedia'],
      [18, 'Drama'],
      [80, 'Crimen'],
      [9648, 'Misterio'],
      [10759, 'Acción & Aventura'],
      [10765, 'Sci-Fi & Fantasía'],
    ]);
    return id == null ? 'Todos' : map.get(id) ?? 'Género';
  }

  getSortLabel(s: TvSortOption): string {
    switch (s) {
      case 'vote_average.desc':
        return 'Mejor valoradas';
      case 'first_air_date.desc':
        return 'Más recientes';
      default:
        return 'Popularidad';
    }
  }

  onKeydown(e: KeyboardEvent, _which: 'genre' | 'sort') {
    if (e.key === 'Escape') {
      this.openGenre = false;
      this.openSort = false;
    }
  }

  onCardClick(item: TvShow) {
    this.router.navigate(['/dashboard/series', item.id]);
  }
}
