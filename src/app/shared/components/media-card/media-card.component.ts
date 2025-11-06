import { Component, Input, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';
import { MediaItem, MediaType } from '../../models/media-item/media-item.component';


const IMG_BASE = 'https://image.tmdb.org/t/p/';
const POSTER_SIZE = 'w342'; // buen equilibrio calidad/peso
const FALLBACK = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="342" height="513"><rect width="100%" height="100%" fill="%23e5e7eb"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="16" fill="%239ca3af">Sin imagen</text></svg>';

@Component({
  selector: 'app-media-card',
  templateUrl: './media-card.component.html',
  styleUrls: ['./media-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MediaCardComponent {
  @Input() item!: MediaItem;
  @Input() type: MediaType = 'movie';
  @Output() select = new EventEmitter<MediaItem>();

  get title(): string {
    return this.type === 'movie'
      ? (this.item.title ?? '')
      : (this.item.name ?? '');
  }

  get date(): string | undefined {
    return this.type === 'movie'
      ? this.item.release_date
      : this.item.first_air_date;
  }

  get posterUrl(): string {
    if (!this.item?.poster_path) return FALLBACK;
    return `${IMG_BASE}${POSTER_SIZE}${this.item.poster_path}`;
  }

  get score(): number | null {
    const v = this.item?.vote_average ?? null;
    return (typeof v === 'number') ? Math.round(v * 10) / 10 : null; // 1 decimal
  }

  onClick() {
    this.select.emit(this.item);
  }
}
