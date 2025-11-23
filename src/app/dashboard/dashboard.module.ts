import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { HomeComponent } from './components/home/home.component';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { SharedModule } from '../shared/shared.module';
import { EnCinesComponent } from './components/en-cines/en-cines.component';
import { ProximosEstrenosComponent } from './components/proximos-estrenos/proximos-estrenos.component';
import { FormsModule } from '@angular/forms';
import { EnEmisionComponent } from './components/en-emision/en-emision.component';
import { EnEmisionHoyComponent } from './components/en-emision-hoy/en-emision-hoy.component';
import { PopularesComponent } from './components/populares/populares.component';
import { TopRatedComponent } from './components/top-rated/top-rated.component';
import { SeriesPopularesComponent } from './components/series-populares/series-populares.component';
import { FavoritesComponent } from './components/favorites/favorites.component';



@NgModule({
  declarations: [
    DashboardComponent,
    HomeComponent,
    EnCinesComponent,
    ProximosEstrenosComponent,
    EnEmisionComponent,
    EnEmisionHoyComponent,
    PopularesComponent,
    TopRatedComponent,
    SeriesPopularesComponent,
    FavoritesComponent,

  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    SharedModule,
    FormsModule
  ]
})
export class DashboardModule { }
