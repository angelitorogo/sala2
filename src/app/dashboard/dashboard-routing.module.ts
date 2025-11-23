import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { HomeComponent } from './components/home/home.component';
import { AuthGuard } from '../guards/auth.guard';
import { EnCinesComponent } from './components/en-cines/en-cines.component';
import { ProximosEstrenosComponent } from './components/proximos-estrenos/proximos-estrenos.component';
import { EnEmisionComponent } from './components/en-emision/en-emision.component';
import { EnEmisionHoyComponent } from './components/en-emision-hoy/en-emision-hoy.component';
import { MovieDetailComponent } from '../shared/components/movie-detail/movie-detail.component';
import { TvDetailComponent } from '../shared/components/tv-detail/tv-detail.component';
import { ActorDetailComponent } from '../shared/components/actor-detail/actor-detail.component';
import { SeasonDetailComponent } from '../shared/components/season-detail/season-detail.component';
import { PopularesComponent } from './components/populares/populares.component';
import { TopRatedComponent } from './components/top-rated/top-rated.component';
import { SeriesPopularesComponent } from './components/series-populares/series-populares.component';
import { FavoritesComponent } from './components/favorites/favorites.component';


const routes: Routes = [

  {
    path: '',
    component: DashboardComponent,
    children: [
      {
        path: 'home',
        component: HomeComponent,
        data: { navbarGrande: true }
      },
      {
        path: 'en-cines',
        component: EnCinesComponent
      },
      {
        path: 'proximos-estrenos',
        component: ProximosEstrenosComponent
      },
      {
        path: 'en-emision',
        component: EnEmisionComponent
      },
      {
        path: 'hoy',
        component: EnEmisionHoyComponent
      },
      {
        path: 'populares',
        component: PopularesComponent
      },
      {
        path: 'series-populares',
        component: SeriesPopularesComponent
      },
      {
        path: 'top-rated',
        component: TopRatedComponent
      },
      {
        path: 'cine/:id',
        component: MovieDetailComponent,
      },
      {
        path: 'series/:id',
        component: TvDetailComponent,
      },
      {
        path: 'person/:id',
        component: ActorDetailComponent
      },
      {
        path: 'series/:id/season/:season',
        component: SeasonDetailComponent
      },
      {
        path: 'favorites',
        component: FavoritesComponent
      },
      /*
      {
        path: 'home2',
        canActivate: [AuthGuard], // Protege la ruta con el AuthGuard
      },
      */
      {
        path: '**',
        redirectTo: 'home'
      }
    ]
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
