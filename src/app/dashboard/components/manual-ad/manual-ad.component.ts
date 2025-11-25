// src/app/shared/components/manual-ad/manual-ad.component.ts
import { AfterViewInit, Component } from '@angular/core';
import { AdsService } from '../../services/ads.service';
import { CookiePreferencesService } from '../../services/cookie-preferences.service';

@Component({
  selector: 'app-manual-ad',
  templateUrl: './manual-ad.component.html',
})
export class ManualAdComponent implements AfterViewInit {

  // Slot que definas en AdSense para este hueco concreto
  adSlot = '1234567890'; // cambia por tu slot real

  constructor(
    public adsService: AdsService,
    public cookiePrefs: CookiePreferencesService,
  ) {}

  ngAfterViewInit(): void {
    // Solo empujamos el anuncio si la cookie de Ads está aceptada
    if (this.cookiePrefs.hasConsent('ads')) {
      this.adsService.pushManualAd();
    } 
  }
}
