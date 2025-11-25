// src/app/shared/components/cookie-banner/cookie-banner.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  CookiePreferencesService,
  CookiePrefs
} from '../../services/cookie-preferences.service';

@Component({
  selector: 'app-cookie-banner',
  templateUrl: './cookie-banner.component.html',
  styleUrl: './cookie-banner.component.css'
})
export class CookieBannerComponent implements OnInit {

  visible = false;

  constructor(
    private cookiePrefs: CookiePreferencesService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    // Si YA hay prefs guardadas, no mostramos el banner
    this.visible = !this.cookiePrefs.hasStoredPrefs;
  }

  acceptEssential(): void {
    const prefs: CookiePrefs = {
      functional: true,
      analytics: false,
      ads: false,
    };
    this.cookiePrefs.setPrefs(prefs);
    this.visible = false;
  }

  acceptAll(): void {
    const prefs: CookiePrefs = {
      functional: true,
      analytics: true,
      ads: true,
    };
    this.cookiePrefs.setPrefs(prefs);
    this.visible = false;
  }

  openSettings(): void {
    this.cookiePrefs.updatePrefs({ functional: true }); // asumimos funcional como imprescindible
    this.visible = false;
    this.router.navigate(['/dashboard/cookies']);
  }

}
