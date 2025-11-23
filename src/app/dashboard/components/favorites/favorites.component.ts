// src/app/features/user/pages/favorites/favorites.component.ts
import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnInit,
  inject,
} from '@angular/core';
import { Router } from '@angular/router';
import { UserCollectionsService } from '../../services/user-collections.service';
import { MovieSummary, TvSummary } from '../../../shared/models/user-collections/user-collections.model';



@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FavoritesComponent implements OnInit {
  private collectionsService = inject(UserCollectionsService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  loading = true;
  movies: MovieSummary[] = [];
  series: TvSummary[] = [];

  ngOnInit(): void {
    this.loadCollections();
  }

  private loadCollections(): void {
    this.loading = true;
    this.cdr.markForCheck();

    this.collectionsService.loadCollections().subscribe({
      next: (res) => {
        //console.log(res)
        this.movies = res.movies || [];
        this.series = res.tv || [];
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('[Favorites] Error cargando colecciones', err);
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  // ========== Helpers de UI ==========

  posterUrl(path: string | null | undefined): string {
    if (!path) {
      return 'assets/images/poster-placeholder.png';
    }
    return `https://image.tmdb.org/t/p/w500${path}`;
  }

  trackByMovie(_idx: number, m: MovieSummary): number {
    return m.id;
  }

  trackBySerie(_idx: number, s: TvSummary): number {
    return s.id;
  }

  openMovie(id: number): void {
    this.router.navigate(['/dashboard/cine', id])
  }

  openSerie(id: number): void {
    this.router.navigate(['/dashboard/series', id]);
  }
}
