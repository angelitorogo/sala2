// src/app/features/series/pages/tv-detail/tv-detail.component.ts
import {
  Component,
  ChangeDetectionStrategy,
  DestroyRef,
  inject,
  OnInit
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { filter, map, switchMap } from 'rxjs';
import {
  TvAggregateCrew,
  TvAllDetails,
  TvService
} from '../../../dashboard/services/tv.service';

// 👇 NUEVO: para login + colecciones de usuario
import { AuthService } from '../../../auth/services/auth.service';
import { UserCollectionsService } from '../../../dashboard/services/user-collections.service';
import { TvSummary } from '../../models/user-collections/user-collections.model';

@Component({
  selector: 'app-tv-detail',
  templateUrl: './tv-detail.component.html',
  styleUrls: ['./tv-detail.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TvDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private tv = inject(TvService);
  private destroyRef = inject(DestroyRef);
  private sanitizer = inject(DomSanitizer);
  private router = inject(Router);

  // 👇 NUEVO
  private authService = inject(AuthService);
  private userCollections = inject(UserCollectionsService);

  // Detalle de la serie
  payload$ = this.route.paramMap.pipe(
    map(pm => Number(pm.get('id'))),
    filter((id): id is number => !!id),
    switchMap(id => this.tv.getAllById(id))
  );

  // 👇 NUEVO: estado de login REACTIVO (para OnPush)
  isLoggedIn$ = this.authService.user$.pipe(
    map(user => !!user)
  );

  ngOnInit(): void {
    const sub = this.payload$.subscribe();
    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }

  // ===== Helpers seguros =====
  getBestYoutubeVideo(m: any) {
    const all = (m?.videos?.results ?? []).filter(
      (v: any) => v.site === 'YouTube' && v.key
    );

    if (!all.length) return null;

    const typeRank = (t?: string) => {
      const order = [
        'Trailer',
        'Teaser',
        'Clip',
        'Featurette',
        'Behind the Scenes',
        'Bloopers'
      ];
      const i = order.indexOf(t || '');
      return i === -1 ? 999 : i;
    };
    const langRank = (v: any) =>
      v?.iso_639_1 === 'es' ? 0 : v?.iso_639_1 === 'en' ? 1 : 2;

    // Orden: tipo preferido → official → tamaño → fecha → idioma
    const sorted = [...all].sort(
      (a, b) =>
        typeRank(a.type) - typeRank(b.type) ||
        Number(b.official === true) - Number(a.official === true) ||
        (b.size ?? 0) - (a.size ?? 0) ||
        (Date.parse(b.published_at || '0') -
          Date.parse(a.published_at || '0')) ||
        langRank(a) - langRank(b)
    );

    return sorted[0] || null;
  }

  toSafeYoutubeEmbed(key: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube.com/embed/${key}`
    );
  }

  uniqueBy<T extends Record<string, any>>(
    arr: T[] | undefined,
    key: keyof T
  ): T[] {
    if (!arr) return [];
    const map = new Map<any, T>();
    for (const it of arr) map.set(it[key], it);
    return [...map.values()];
  }

  directorsAndProducers(m: TvAllDetails): TvAggregateCrew[] {
    const crew = this.uniqueBy<TvAggregateCrew>(
      m?.aggregate_credits?.crew,
      'id'
    );
    return crew
      .filter(c =>
        (c.jobs || []).some(
          j => j?.job === 'Director' || j?.job === 'Producer'
        )
      )
      .slice(0, 16);
  }

  jobsLabel(d: TvAggregateCrew): string {
    const names = (d.jobs || [])
      .map(j => j?.job)
      .filter(
        (j): j is string =>
          !!j && (j === 'Director' || j === 'Producer')
      );
    return Array.from(new Set(names)).join(', ');
  }

  onCardClick(t: any): void {
    this.router.navigate(['/dashboard/person', t.id]);
  }

  // ===== SEGUIR SERIE =====

  onToggleFollow(serie: TvAllDetails): void {
    const summary: TvSummary = {
      id: serie.id,
      name: serie.name,
      posterPath: serie.poster_path ?? null,
      voteAverage: serie.vote_average
    };

    this.userCollections.toggleTvFollow(summary);
  }

  isFollowed(serie: TvAllDetails): boolean {
    return this.userCollections.isTvFollowed(serie.id);
  }
}
