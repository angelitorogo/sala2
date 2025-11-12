import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, filter, switchMap, shareReplay } from 'rxjs';
import { ActorsService, PersonAllDetails } from '../../../dashboard/services/actors.service';

/** Tipo compatible con app-media-row (sin nulls en vote_average/fechas) */
type MediaItemCompat = {
  id: number;
  poster_path: string | null;
  title?: string;          // películas
  name?: string;           // series
  vote_average?: number;   // sin null
  release_date?: string;   // sin null (películas)
  first_air_date?: string; // sin null (series)
};

type SplitResult = {
  current: MediaItemCompat[];   // ya estrenadas
  upcoming: MediaItemCompat[];  // futuras (próximamente)
};

@Component({
  selector: 'app-actor-detail',
  templateUrl: './actor-detail.component.html',
  styleUrls: ['./actor-detail.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActorDetailComponent {
  private route = inject(ActivatedRoute);
  private actors = inject(ActorsService);

  showFullBio = false;

  person$ = this.route.paramMap.pipe(
    map(pm => Number(pm.get('id'))),
    filter((id): id is number => Number.isFinite(id) && id > 0),
    switchMap(id => this.actors.getAllById(id)),
    map(person => {
      const movies = this.splitAndSortMovies(person);
      const series = this.splitAndSortSeries(person);

      return {
        person,
        // 2) Orden por vote_average desc (ya aplicado dentro)
        moviesCast: movies.current,
        tvCast: series.current,
        // 3) Próximamente (debajo de Series, en una sección conjunta)
        upComing: movies.upcoming.concat(series.upcoming).sort(this.sortByVoteThenDateThenName.bind(this)),
      };
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  // ========= helpers =========
  private uniqueById<T extends { id: number }>(arr: T[]): T[] {
    const m = new Map<number, T>();
    for (const it of arr) if (!m.has(it.id)) m.set(it.id, it);
    return [...m.values()];
  }

  private tsFrom(it: MediaItemCompat): number {
    const d = it.release_date || it.first_air_date;
    return d ? new Date(d).getTime() : 0;
  }

  private isFuture(it: MediaItemCompat): boolean {
    const ts = this.tsFrom(it);
    if (!ts) return false;
    const today = new Date();
    // Comparamos con “hoy” a medianoche para evitar efectos de hora
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    return ts > todayMidnight;
  }

  private sortByVoteThenDateThenName<T extends MediaItemCompat>(a: T, b: T): number {
    const va = a.vote_average ?? -1;
    const vb = b.vote_average ?? -1;
    if (vb !== va) return vb - va; // 1) nota desc

    const da = this.tsFrom(a);
    const db = this.tsFrom(b);
    if (db !== da) return db - da; // 2) fecha desc

    // 3) nombre/título asc para estabilidad
    const na = (a.title ?? a.name ?? '').toLowerCase();
    const nb = (b.title ?? b.name ?? '').toLowerCase();
    return na.localeCompare(nb);
  }

  /** Películas: separa en current/upcoming y ordena (vote desc, luego fecha desc) */
  private splitAndSortMovies(p: PersonAllDetails): SplitResult {
    const cast = p.combined_credits?.cast ?? [];
    const moviesRaw: MediaItemCompat[] = cast
      .filter(it => it.media_type === 'movie')
      .map(it => ({
        id: it.id,
        poster_path: it.poster_path ?? null,
        title: it.title || it.original_title,
        vote_average: it.vote_average ?? undefined,
        release_date: it.release_date || undefined
      }));

    const unique = this.uniqueById(moviesRaw);
    const upcoming = unique.filter(it => this.isFuture(it)).sort(this.sortByVoteThenDateThenName.bind(this));
    const current  = unique.filter(it => !this.isFuture(it)).sort(this.sortByVoteThenDateThenName.bind(this));
    return { current, upcoming };
  }

  /** Series: separa en current/upcoming y ordena (vote desc, luego fecha desc) */
  private splitAndSortSeries(p: PersonAllDetails): SplitResult {
    const cast = p.combined_credits?.cast ?? [];
    const tvRaw: MediaItemCompat[] = cast
      .filter(it => it.media_type === 'tv')
      .map(it => ({
        id: it.id,
        poster_path: it.poster_path ?? null,
        name: it.name || it.original_name,
        vote_average: it.vote_average ?? undefined,
        first_air_date: it.first_air_date || undefined
      }));

    const unique = this.uniqueById(tvRaw);
    const upcoming = unique.filter(it => this.isFuture(it)).sort(this.sortByVoteThenDateThenName.bind(this));
    const current  = unique.filter(it => !this.isFuture(it)).sort(this.sortByVoteThenDateThenName.bind(this));
    return { current, upcoming };
  }

  // UI
  toggleBio(): void { this.showFullBio = !this.showFullBio; }

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
