import { Component, ChangeDetectionStrategy, DestroyRef, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, filter, switchMap } from 'rxjs';
import { ActorsService, PersonAllDetails } from '../../../dashboard/services/actors.service';

/** Tipo compatible con app-media-row (sin nulls en vote_average/fechas) */
type MediaItemCompat = {
  id: number;
  poster_path: string | null;
  title?: string;          // para películas
  name?: string;           // para series
  vote_average?: number;   // sin null
  release_date?: string;   // sin null
  first_air_date?: string; // sin null
};

@Component({
  selector: 'app-actor-detail',
  templateUrl: './actor-detail.component.html',
  styleUrls: ['./actor-detail.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActorDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private actors = inject(ActorsService);
  private destroyRef = inject(DestroyRef);

  // estado UI
  showFullBio = false;

  /** VM con persona + filmografía ya normalizada y ordenada */
  person$ = this.route.paramMap.pipe(
    map(pm => Number(pm.get('id'))),
    filter((id): id is number => !!id),
    switchMap(id => this.actors.getAllById(id)),
    map(person => ({
      person,
      moviesCast: this.buildMovies(person), // MediaItemCompat[]
      tvCast: this.buildSeries(person),     // MediaItemCompat[]
    }))
  );

  ngOnInit(): void {
    const sub = this.person$.subscribe(); // para poder depurar si hace falta
    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }

  // ============== Helpers de normalización/ordenación ==============
  private uniqueById<T extends { id: number }>(arr: T[]): T[] {
    const map = new Map<number, T>();
    for (const it of arr) if (!map.has(it.id)) map.set(it.id, it);
    return [...map.values()];
  }

  private dateStr(it: MediaItemCompat): string {
    return it.release_date || it.first_air_date || '0000-01-01';
  }

  private buildMovies(p: PersonAllDetails): MediaItemCompat[] {
    const cast = p.combined_credits?.cast ?? [];
    const movies: MediaItemCompat[] = cast
      .filter(it => it.media_type === 'movie')
      .map(it => ({
        id: it.id,
        poster_path: it.poster_path ?? null,
        title: it.title || it.original_title,
        vote_average: it.vote_average ?? undefined,   // ⬅️ sin null
        release_date: it.release_date || undefined    // ⬅️ sin null
      }));

    const unique = this.uniqueById(movies);
    unique.sort((a, b) => +new Date(this.dateStr(b)) - +new Date(this.dateStr(a)));
    return unique;
  }

  private buildSeries(p: PersonAllDetails): MediaItemCompat[] {
    const cast = p.combined_credits?.cast ?? [];
    const series: MediaItemCompat[] = cast
      .filter(it => it.media_type === 'tv')
      .map(it => ({
        id: it.id,
        poster_path: it.poster_path ?? null,
        name: it.name || it.original_name,
        vote_average: it.vote_average ?? undefined,     // ⬅️ sin null
        first_air_date: it.first_air_date || undefined  // ⬅️ sin null
      }));

    const unique = this.uniqueById(series);
    unique.sort((a, b) => +new Date(this.dateStr(b)) - +new Date(this.dateStr(a)));
    return unique;
  }

  // =================== UI helpers ===================
  toggleBio(): void {
    this.showFullBio = !this.showFullBio;
  }

  profileUrl(p: PersonAllDetails): string {
    return p.profile_path
      ? `https://image.tmdb.org/t/p/w500${p.profile_path}`
      : 'assets/images/poster-placeholder.png';
  }

  heroBg(p: PersonAllDetails): string {
    return p.profile_path
      ? `url(https://image.tmdb.org/t/p/original${p.profile_path})`
      : 'none';
  }
}
