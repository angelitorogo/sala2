import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { HomeComponent } from './components/home/home.component';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { SharedModule } from '../shared/shared.module';
import { EnCinesComponent } from './components/en-cines/en-cines.component';
import { ProximosEstrenosComponent } from './components/proximos-estrenos/proximos-estrenos.component';



@NgModule({
  declarations: [
    DashboardComponent,
    HomeComponent,
    EnCinesComponent,
    ProximosEstrenosComponent,

  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    SharedModule
  ]
})
export class DashboardModule { }
