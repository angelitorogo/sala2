// src/app/features/series/pages/tv-detail/tv-detail.component.ts
import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  DestroyRef,
  inject,
  OnInit
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { map } from 'rxjs';

import {
  TvAggregateCrew,
  TvAllDetails,
  TvService
} from '../../../dashboard/services/tv.service';

// login + colecciones
import { AuthService } from '../../../auth/services/auth.service';
import { UserCollectionsService } from '../../../dashboard/services/user-collections.service';
import { TvSummary } from '../../models/user-collections/user-collections.model';
import { TvDetailResponse } from '../../responses/tv-detail.response';
import { pickBestYoutubeVideo } from '../../helpers/video-utils';

@Component({
  selector: 'app-tv-detail',
  templateUrl: './tv-detail.component.html',
  styleUrls: ['./tv-detail.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TvDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private tvService = inject(TvService);
  private sanitizer = inject(DomSanitizer);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  private authService = inject(AuthService);
  private userCollections = inject(UserCollectionsService);

  // Estado de login reactivo (igual que en movie-detail)
  isLoggedIn$ = this.authService.user$.pipe(
    map(user => !!user)
  );

  public tvId!: number;
  public tvDetails: TvDetailResponse | undefined;
  public isFollowed: boolean | null = null;

  ngOnInit(): void {
    const sub = this.route.paramMap
      .pipe(
        map(pm => Number(pm.get('id'))),
        map(id => (isNaN(id) ? null : id)),
      )
      .subscribe(id => {
        if (!id) {
          this.router.navigate(['/dashboard']);
          return;
        }

        this.tvId = id;
        this.loadDetails(id);
      });

    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }

  private loadDetails(id: number): void {
    // 🔹 1) Reseteamos estado para mostrar loader
    this.tvDetails = undefined;
    this.isFollowed = null;
    this.cdr.markForCheck();

    // 🔹 2) Petición al backend
    this.tvService.getAllById(id).subscribe({
      next: (response) => {

        //console.log(response)
        this.tvDetails = response;
        this.loadFollowStatus(this.tvDetails.id);
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('[TvDetail] Error cargando detalles de la serie', err);
      },
    });
  }

  private loadFollowStatus(id: number): void {
    this.userCollections.isTvFollowed(id).subscribe({
      next: (status) => {
        //console.log('[TvDetail] isTvFollowed para id', id, '=>', status);
        this.isFollowed = !!status;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('[TvDetail] Error al comprobar si está seguida', err);
      }
    });
  }

  // ===== Helpers seguros / YouTube =====
  getYoutubeTrailer(m: any) {
    return pickBestYoutubeVideo(m);
  }

  /*
  toSafeYoutubeEmbed(key: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube.com/embed/${key}`
    );
  }
    */

  toSafeYoutubeEmbed(key: string): SafeResourceUrl {
    const url = `https://www.youtube.com/embed/${key}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
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

  directorsAndProducers(m: TvDetailResponse): TvAggregateCrew[] {
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

  // ===== SEGUIR SERIE (igual patrón que favoritos en movie-detail) =====

  onToggleFollow(serie: TvDetailResponse): void {
    if (!this.authService.user) {
      console.warn('[TvDetail] Debes iniciar sesión para seguir series');
      return;
    }

    const summary: TvSummary = {
      id: serie.id,
      name: serie.name,
      posterPath: serie.poster_path ?? null,
      voteAverage: serie.vote_average
    };

    this.userCollections.toggleTvFollow(summary).subscribe({
      next: (res) => {
        //console.log(res);
        this.loadFollowStatus(serie.id);
      },
      error: (err) => {
        console.error('[TvDetail] Error al alternar seguir serie', err);
      }
    });
  }
}
