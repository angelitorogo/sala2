// src/app/shared/services/ads.service.ts
import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { CookiePreferencesService } from './cookie-preferences.service';
import { environment } from '../../../environments/environment';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

@Injectable({ providedIn: 'root' })
export class AdsService {
  private scriptId = 'adsense-script';
  private initialized = false;

  // Pon aquí TU client de AdSense en environment.prod.ts
  private readonly clientId = environment.ADSCLIENTID; // ej: "ca-pub-XXXXXXXXXXXX"

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private cookiePrefs: CookiePreferencesService,
  ) {}

  /** Llamar una vez (por ejemplo en AppComponent) */
  init(): void {
    if (!environment.PRODUCTION) {
      console.log('[Ads] Desactivado en entorno no producción');
      return;
    }

    if (!this.cookiePrefs.hasConsent('ads')) {
      console.log('[Ads] Sin consentimiento de Ads, no se carga AdSense');
      return;
    }

    if (this.initialized || !this.clientId) {
      return;
    }

    this.loadScript();
    this.initialized = true;
  }

  /** Script global de AdSense (sirve para Auto Ads y manuales) */
  private loadScript(): void {
    if (this.document.getElementById(this.scriptId)) {
      return;
    }

    const script = this.document.createElement('script');
    script.id = this.scriptId;
    script.async = true;
    script.src =
      `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${this.clientId}`;
    script.setAttribute('crossorigin', 'anonymous');
    this.document.head.appendChild(script);

    console.log('[Ads] Script de AdSense inyectado');
  }

  /** Para banners manuales: empuja un nuevo anuncio en un <ins> */
  pushManualAd(): void {
    if (!environment.PRODUCTION) {
      return;
    }
    if (!this.cookiePrefs.hasConsent('ads')) {
      console.log('[Ads] Intento de mostrar anuncio manual sin consentimiento de Ads');
      return;
    }

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.warn('[Ads] Error en adsbygoogle.push', e);
    }
  }

  /** Llamar cuando cambien las preferencias de cookies */
  onPreferencesChanged(): void {
    if (!environment.PRODUCTION) return;

    const prefs = this.cookiePrefs.getSnapshot();
    if (prefs.ads && !this.initialized) {
      // Antes sin Ads, ahora con Ads → inicializamos
      this.init();
    }

    if (!prefs.ads && this.initialized) {
      // Aquí podrías, si quieres ser muy purista:
      // - dejar de mostrar banners (no llamar más a pushManualAd)
      // - sugerir recargar la página para limpiar cookies de AdSense
      console.warn('[Ads] Se ha retirado el consentimiento de Ads. Para limpiar cookies de AdSense puede ser necesario recargar la página.');
    }
  }
}
