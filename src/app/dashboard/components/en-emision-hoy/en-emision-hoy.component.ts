import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { PaginatedResponse, TvService, TvShow, TvSortOption } from '../../services/tv.service';
import { Subscription } from 'rxjs';
import { MediaItem } from '../../../shared/models/media-item/media-item.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-en-emision-hoy',
  templateUrl: './en-emision-hoy.component.html',
  styleUrls: ['./en-emision-hoy.component.css']
})
export class EnEmisionHoyComponent implements OnInit, OnDestroy, AfterViewInit {
  loading = false;
  error: string | null = null;

  shows: TvShow[] = [];
  page = 1;
  totalPages = 1;

  // Filtros
  genreId: number | null = null;
  sortBy: TvSortOption = 'popularity.desc';

  openGenre = false;
  openSort = false;

  @ViewChild('gridHost', { static: false }) gridHost!: ElementRef<HTMLElement>;

  // Estado de scroll relativo al <main>
  gridScrollProgress = 0;
  gridInViewport = false;
  gridNearBottom = false;

  private sub?: Subscription;

  constructor(private tvService: TvService,  public router: Router) {}

  ngOnInit(): void {
    this.loadFirstPage();
    document.addEventListener('click', this._outsideClick, true);
  }

  ngAfterViewInit(): void {
    this.updateMainScrollInfo();
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

    const viewportTop = window.scrollY || document.documentElement.scrollTop || 0;
    const viewportH = window.innerHeight || document.documentElement.clientHeight || 0;

    const rect = el.getBoundingClientRect();
    const elTopDoc = rect.top + viewportTop;
    const elHeight = el.scrollHeight;

    const viewportBottom = viewportTop + viewportH;
    const elBottomDoc = elTopDoc + elHeight;
    this.gridInViewport = elBottomDoc > viewportTop && elTopDoc < viewportBottom;

    const totalScrollable = Math.max(elHeight - viewportH, 1);
    const current = Math.min(Math.max(viewportTop - elTopDoc, 0), totalScrollable);
    this.gridScrollProgress = +(current / totalScrollable).toFixed(4);

    this.gridNearBottom = viewportBottom >= (elBottomDoc - thresholdPx);

    if (this.gridNearBottom && !this.loading && this.page < this.totalPages) {
      this.loadMore();
    }
  }

  async loadFirstPage(): Promise<void> {
    this.page = 1;
    this.shows = [];
    await this.loadShows(true);
  }

  async loadMore(): Promise<void> {
    if (this.loading || this.page >= this.totalPages) return;
    this.page += 1;
    await this.loadShows(false);
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

  trackByShow = (_: number, s: TvShow) => s.id;

  posterUrl(path: string | null, size: 'w342' | 'w500' = 'w342'): string {
    if (!path) return 'assets/images/poster-placeholder.png';
    return `https://image.tmdb.org/t/p/${size}${path}`;
  }

  /** Sin filtros => endpoint oficial airing_today
   *  Con filtros/orden => discoverAiringToday() (ventana = hoy) para respetar sort_by.
   */
  private async loadShows(replace: boolean): Promise<void> {
    this.loading = true;
    this.error = null;

    const source$ = this.usingFilters
      ? this.tvService.discoverAiringToday({
          page: this.page,
          with_genres: this.genreId,
          sort_by: this.sortBy
        })
      : this.tvService.getAiringToday(this.page);

    this.sub?.unsubscribe();
    this.sub = source$.subscribe({
      next: (res: PaginatedResponse<TvShow>) => {
        this.totalPages = res.total_pages ?? 1;
        this.shows = replace ? res.results : [...this.shows, ...res.results];
        this.loading = false;
      },
      error: () => {
        this.error = 'No se han podido cargar las series en emisión hoy.';
        this.loading = false;
      }
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
      [10759, 'Acción y aventura'],
      [16, 'Animación'],
      [35, 'Comedia'],
      [18, 'Drama'],
      [80, 'Crimen'],
      [9648, 'Misterio'],
      [10765, 'Ciencia ficción y fantasía'],
      [99, 'Documental'],
    ]);
    return id == null ? 'Todos' : (map.get(id) ?? 'Género');
  }

  getSortLabel(s: TvSortOption): string {
    switch (s) {
      case 'first_air_date.asc':  return 'Más recientes';
      case 'vote_average.desc':   return 'Mejor valoradas';
      case 'vote_count.desc':     return 'Más votadas';
      case 'popularity.desc':     return 'Popularidad';
      default:                    return 'Orden';
    }
  }

  onKeydown(e: KeyboardEvent, _which: 'genre' | 'sort') {
    if (e.key === 'Escape') {
      this.openGenre = false; this.openSort = false;
    }
  }

  onCardClick(item: MediaItem) {
         
      this.router.navigate(['/dashboard/series', item.id])
      
    }
}
