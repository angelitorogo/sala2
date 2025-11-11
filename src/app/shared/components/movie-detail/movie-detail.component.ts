// src/app/features/cine/pages/movie-detail/movie-detail.component.ts
import { Component, ChangeDetectionStrategy, DestroyRef, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { filter, map, switchMap } from 'rxjs';
import { MoviesService } from '../../../dashboard/services/movies.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-movie-detail',
  templateUrl: './movie-detail.component.html',
  styleUrls: ['./movie-detail.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private movies = inject(MoviesService);
  private destroyRef = inject(DestroyRef);
  private sanitizer = inject(DomSanitizer);

  payload$ = this.route.paramMap.pipe(
    map(pm => Number(pm.get('id'))),
    filter((id): id is number => !!id),
    switchMap(id => this.movies.getAllById(id))
  );

  ngOnInit(): void {
    const sub = this.payload$.subscribe(payload => {
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

  // 👇 NUEVO: convierte la key en una URL segura para <iframe>
  toSafeYoutubeEmbed(key: string): SafeResourceUrl {
    const url = `https://www.youtube.com/embed/${key}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
