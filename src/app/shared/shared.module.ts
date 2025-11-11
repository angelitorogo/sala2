import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MediaCardComponent } from './components/media-card/media-card.component';
import { MediaRowComponent } from './components/media-row/media-row.component';
import { TvDetailComponent } from './components/tv-detail/tv-detail.component';
import { MovieDetailComponent } from './components/movie-detail/movie-detail.component';
import { UniqueIdPipe } from './pipes/unique-id.pipe';

@NgModule({
  declarations: [MediaCardComponent, MediaRowComponent, MovieDetailComponent, TvDetailComponent, UniqueIdPipe],
  imports: [CommonModule],
  exports: [MediaCardComponent, MediaRowComponent, MovieDetailComponent, TvDetailComponent, UniqueIdPipe],
})
export class SharedModule {}
