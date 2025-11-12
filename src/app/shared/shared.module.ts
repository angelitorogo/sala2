import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MediaCardComponent } from './components/media-card/media-card.component';
import { MediaRowComponent } from './components/media-row/media-row.component';
import { TvDetailComponent } from './components/tv-detail/tv-detail.component';
import { MovieDetailComponent } from './components/movie-detail/movie-detail.component';
import { UniqueIdPipe } from './pipes/unique-id.pipe';
import { ActorDetailComponent } from './components/actor-detail/actor-detail.component';
import { SeasonDetailComponent } from './components/season-detail/season-detail.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [MediaCardComponent, MediaRowComponent, MovieDetailComponent, TvDetailComponent, UniqueIdPipe, ActorDetailComponent, SeasonDetailComponent],
  imports: [CommonModule, RouterModule],
  exports: [MediaCardComponent, MediaRowComponent, MovieDetailComponent, TvDetailComponent, UniqueIdPipe, ActorDetailComponent],
})
export class SharedModule {}
