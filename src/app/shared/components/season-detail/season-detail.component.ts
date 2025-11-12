import { Component, ChangeDetectionStrategy, DestroyRef, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { distinctUntilChanged, filter, map, shareReplay, switchMap } from 'rxjs';
import { TvSeasonAllDetails, TvService } from '../../../dashboard/services/tv.service';

@Component({
  selector: 'app-season-detail',
  templateUrl: './season-detail.component.html',
  styleUrls: ['./season-detail.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SeasonDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private tv = inject(TvService);
  private destroyRef = inject(DestroyRef);
  private sanitizer = inject(DomSanitizer);

  vm$ = this.route.paramMap.pipe(
  map(pm => ({ id: Number(pm.get('id')), season: Number(pm.get('season')) })),
  filter(v => Number.isFinite(v.id) && Number.isFinite(v.season)), // ✅ permite 0
  distinctUntilChanged((a, b) => a.id === b.id && a.season === b.season),
  switchMap(v => this.tv.getSeasonAll(v.id, v.season)),
  map(season => ({ season, trailer: this.pickYoutubeTrailer(season) })),
  shareReplay({ bufferSize: 1, refCount: true })
);

  ngOnInit(): void {
    /*
    const sub = this.vm$.subscribe(
      p => .log('[SEASON DETAIL]', p)); // por si quieres depurar
    this.destroyRef.onDestroy(() => sub.unsubscribe());
    */
  }

  pickYoutubeTrailer(s: TvSeasonAllDetails) {
    const list = s.videos?.results ?? [];
    return list.find(v => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser') && !!v.key) || null;
  }

  toSafeYoutube(key: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${key}`);
  }

  heroBg(s: TvSeasonAllDetails): string {
    return s.poster_path ? `url(https://image.tmdb.org/t/p/original${s.poster_path})` : 'none';
  }

  posterUrl(path: string | null, size: 'w300'|'w500' = 'w500'): string {
    return path ? `https://image.tmdb.org/t/p/${size}${path}` : 'assets/images/poster-placeholder.png';
  }

  stillUrl(path: string | null): string {
    return path ? `https://image.tmdb.org/t/p/w500${path}` : 'assets/images/poster-placeholder.png';
  }
}
