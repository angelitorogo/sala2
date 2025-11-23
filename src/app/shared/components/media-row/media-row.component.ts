import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild
} from '@angular/core';
import { MediaItem, MediaType } from '../../models/media-item/media-item.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-media-row',
  templateUrl: './media-row.component.html',
  styleUrls: ['./media-row.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MediaRowComponent implements AfterViewInit {
  @Input() title = '';
  @Input() items: MediaItem[] = [];
  @Input() type: MediaType = 'movie';        // fallback si el item no trae media_type
  @Input() showMoreButton = false;

  @Output() more = new EventEmitter<void>();
  @Output() selectItem = new EventEmitter<MediaItem>();

  @ViewChild('scroller', { static: true }) scrollerRef!: ElementRef<HTMLDivElement>;


  constructor(public router: Router) {
    
  }

  ngAfterViewInit(): void {
    // opcional: ocultar barra si no hay overflow
    //console.log(this.type)
  }

  scrollBy(direction: 1 | -1) {
    const el = this.scrollerRef.nativeElement;
    const step = Math.round(el.clientWidth * 0.9);
    el.scrollBy({ left: step * direction, behavior: 'smooth' });
  }

  onCardClick(item: MediaItem) {

    //console.log(item)

    this.selectItem.emit(item);
    if (this.kindOf(item) === 'movie') {
      this.router.navigate(['/dashboard/cine', item.id])
    } else {
      this.router.navigate(['/dashboard/series', item.id])
    }
  }

  trackById(index: number, item: any) {
    return item.id;
  }

  // ===== Helpers de display (pelis/series) =====
  kindOf(it: any): 'movie' | 'tv' {
    // si el item trae media_type lo usamos; si no, usamos el input
    return (it?.media_type as 'movie' | 'tv') || this.type || 'movie';
  }

  displayTitle(it: any): string {
    // movie.title || tv.name
    return it?.title || it?.name || 'Sin título';
  }

  displayDate(it: any): string | null {
    // movie.release_date || tv.first_air_date
    return it?.release_date || it?.first_air_date || null;
  }

  posterPath(it: any): string | null {
    return it?.poster_path || null;
  }

  vote(it: any): number {
    return Number(it?.vote_average ?? 0);
  }

  // ===== Badges =====
  private toISO(dateStr?: string | null) {
    if (!dateStr) return null;
    return dateStr.slice(0, 10);
  }

  isToday(it: any): boolean {
    const d = this.toISO(this.displayDate(it));
    if (!d) return false;
    const today = new Date().toISOString().slice(0, 10);
    return d === today;
    // Para series con episodio hoy podrías cruzar con airing_today por id.
  }

  isNew(it: any): boolean {
    const dateStr = this.displayDate(it);
    if (!dateStr) return false;
    const diffDays = (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 30;
  }
  
  showCinemaBadge(): boolean {
    // Mostramos "CARTELERA" cuando el título de la fila es "En cines ahora"
    return this.title.toLowerCase().includes('cines ahora');
  }

  imageUrl(it: any, size: 'w185' | 'w342' | 'w500' | 'original' = 'w342'): string {
    const path = this.posterPath(it);
    return path ? `https://image.tmdb.org/t/p/${size}${path}` : 'assets/images/poster-placeholder.png';
  }
}
