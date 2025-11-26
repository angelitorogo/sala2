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
import { RecaptchaModule, RecaptchaFormsModule } from 'ng-recaptcha';
import { TermsPrivacyComponent } from './components/terms-privacy/terms-privacy.component';
import { CookiesSettingsComponent } from './components/cookies-settings/cookies-settings.component';
import { CookieBannerComponent } from './components/cookie-banner/cookie-banner.component';
import { ManualAdComponent } from './components/manual-ad/manual-ad.component';
import { SearchComponent } from './components/search/search.component';


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
    TermsPrivacyComponent,
    CookiesSettingsComponent,
    ManualAdComponent,
    SearchComponent,

  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    RecaptchaModule,
    RecaptchaFormsModule,
  ],

})
export class DashboardModule { }
