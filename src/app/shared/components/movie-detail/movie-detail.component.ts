// src/app/features/cine/pages/movie-detail/movie-detail.component.ts
import {
  Component,
  ChangeDetectionStrategy,
  DestroyRef,
  inject,
  OnInit
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, map, switchMap } from 'rxjs';
import { Movie, MoviesService } from '../../../dashboard/services/movies.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MovieSummary } from '../../models/user-collections/user-collections.model';
import { UserCollectionsService } from '../../../dashboard/services/user-collections.service';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-movie-detail',
  templateUrl: './movie-detail.component.html',
  styleUrls: ['./movie-detail.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieDetailComponent implements OnInit {

  private route = inject(ActivatedRoute);
  public authService = inject(AuthService);
  private movies = inject(MoviesService);
  private destroyRef = inject(DestroyRef);
  private sanitizer = inject(DomSanitizer);
  private router = inject(Router);
  private userCollections = inject(UserCollectionsService);

  // Detalle película
  payload$ = this.route.paramMap.pipe(
    map(pm => Number(pm.get('id'))),
    filter((id): id is number => !!id),
    switchMap(id => this.movies.getAllById(id))
  );

  // 👇 Estado de login REACTIVO (para OnPush)
  isLoggedIn$ = this.authService.user$.pipe(
    map(user => !!user)
  );

  ngOnInit(): void {
    const sub = this.payload$.subscribe(payload => {
      //console.log(payload)
    });
    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }

  // Mantén tu helper para elegir el tráiler de YouTube
  getYoutubeTrailer(m: any) {
    if (!m?.videos?.results?.length) return null;
    return m.videos.results.find((v: any) =>
      v.site === 'YouTube' && v.type === 'Trailer' && !!v.key
    ) || null;
  }

  // 👇 convierte la key en una URL segura para <iframe>
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

  onToggleFavorite(movie: Movie): void {
    const summary: MovieSummary = {
      id: movie.id,
      title: movie.title,
      posterPath: movie.poster_path ?? null,
      voteAverage: movie.vote_average
    };

    this.userCollections.toggleMovieFavorite(summary);
  }

  isFavorite(movie: Movie): boolean {
    return this.userCollections.isMovieFavorite(movie.id);
  }

}
