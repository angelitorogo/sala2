// src/app/features/cine/pages/movie-detail/movie-detail.component.ts
import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  inject,
  OnInit,
  DestroyRef
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { map } from 'rxjs';

import { Movie, MoviesService } from '../../../dashboard/services/movies.service';
import { MovieSummary } from '../../models/user-collections/user-collections.model';
import { UserCollectionsService } from '../../../dashboard/services/user-collections.service';
import { AuthService } from '../../../auth/services/auth.service';
import {
  MovieDetailResponse,
  RecommendationsResult,
} from '../../responses/movie-detail.response';
import { MediaItem } from '../../models/media-item/media-item.component';
import { pickBestYoutubeVideo } from '../../helpers/video-utils';

@Component({
  selector: 'app-movie-detail',
  templateUrl: './movie-detail.component.html',
  styleUrls: ['./movie-detail.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieDetailComponent implements OnInit {

  private route = inject(ActivatedRoute);
  public authService = inject(AuthService);
  private moviesService = inject(MoviesService);
  private sanitizer = inject(DomSanitizer);
  private router = inject(Router);
  private userCollections = inject(UserCollectionsService);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef); 

  // Estado de login reactivo (único observable expuesto a la vista)
  isLoggedIn$ = this.authService.user$.pipe(
    map(user => !!user)
  );

  public movieId!: number;
  public movieDetails: MovieDetailResponse | undefined;
  public isFavorite: boolean | null = null;

  ngOnInit(): void {
    const sub = this.route.paramMap
      .pipe(
        map(pm => Number(pm.get('id'))),
        // evitamos NaN / null
        map(id => (isNaN(id) ? null : id)),
      )
      .subscribe(id => {

        if (!id) {
          // Si el id es inválido, nos vamos al dashboard
          this.router.navigate(['/dashboard']);
          return;
        }

        // Guardamos el id actual de la película
        this.movieId = id;

        // Cargamos detalles + estado de favorito para ESTE id
        this.loadDetails(id);
      });

    // Nos desuscribimos cuando se destruya el componente
    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }


  private loadDetails(id: number): void {

    // 🔹 1) Reseteamos estado para que aparezca el loader
    this.movieDetails = undefined;
    this.isFavorite = null;
    this.cdr.markForCheck();  // Forzamos re-render por OnPush

    // 🔹 2) Hacemos la petición normalmente
    this.moviesService.getAllById(id).subscribe({
      next: (response) => {
        this.movieDetails = response;
        this.loadFavoriteStatus(this.movieDetails.id);
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.log('error', err);
      },
    });
  }

  private loadFavoriteStatus(id: number): void {
    this.userCollections.isMovieFavorite(id).subscribe({
      next: (status) => {
        this.isFavorite = !!status;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('[MovieDetail] Error al comprobar favorito', err);
      }
    });
  }

  // ===== Helpers YouTube =====

  getYoutubeTrailer(m: any) {
    return pickBestYoutubeVideo(m);
  }

  toSafeYoutubeEmbed(key: string): SafeResourceUrl {
    const url = `https://www.youtube.com/embed/${key}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  getBackgroundImage(m: any): string {
    const poster = m?.images?.posters?.[0]?.file_path;
    const backdrop = m?.backdrop_path;

    const base = 'https://image.tmdb.org/t/p/original';

    if (poster) return `url(${base}${poster})`;
    if (backdrop) return `url(${base}${backdrop})`;
    return 'none';
  }

  onCardClick(c: any): void {
    this.router.navigate(['/dashboard/person', c.id]);
  }

  // ===== FAVORITOS =====

  onToggleFavorite(movie: MovieDetailResponse): void {
    if (!this.authService.user) {
      console.warn('[MovieDetail] Debes iniciar sesión para usar favoritos');
      return;
    }

    const summary: MovieSummary = {
      id: movie.id,
      title: movie.title,
      posterPath: movie.poster_path ?? null,
      voteAverage: movie.vote_average
    };

    this.userCollections
      .toggleMovieFavorite(summary)
      .subscribe({
        next: (res) => {

          //console.log(res)

          this.loadFavoriteStatus(movie.id);
        },
        error: (err) => {
          console.error('[MovieDetail] Error al alternar favorito', err);
        }
      });
  }

  toMediaItem(r: RecommendationsResult): MediaItem {
    return {
      id: r.id,
      poster_path: r.poster_path ?? null,
      backdrop_path: r.backdrop_path ?? null,
      vote_average: r.vote_average,
      title: r.title,
      name: undefined,
      release_date: r.release_date?.toString() ?? undefined,
      first_air_date: undefined,
    };
  }

  toMediaItems(list: RecommendationsResult[]): MediaItem[] {
    return list.map(r => this.toMediaItem(r));
  }

}
