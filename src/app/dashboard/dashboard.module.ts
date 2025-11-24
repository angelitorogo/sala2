import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { HomeComponent } from './components/home/home.component';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { SharedModule } from '../shared/shared.module';
import { EnCinesComponent } from './components/cine/en-cines/en-cines.component';
import { ProximosEstrenosComponent } from './components/cine/proximos-estrenos/proximos-estrenos.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EnEmisionComponent } from './components/series/en-emision/en-emision.component';
import { EnEmisionHoyComponent } from './components/series/en-emision-hoy/en-emision-hoy.component';
import { PopularesComponent } from './components/cine/populares/populares.component';
import { TopRatedComponent } from './components/cine/top-rated/top-rated.component';
import { SeriesPopularesComponent } from './components/series/series-populares/series-populares.component';
import { FavoritesComponent } from './components/favorites/favorites.component';
import { ContactComponent } from './components/contact/contact.component';



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
    ContactComponent,

  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
  ]
})
export class DashboardModule { }
