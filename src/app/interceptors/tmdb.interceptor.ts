import { Injectable, inject } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpParams, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable()
export class TmdbInterceptor implements HttpInterceptor {
  private readonly apiKey = environment.tmdbApiKey ?? '';
  private readonly language = 'es-ES';
  private readonly region = 'ES';

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Solo toca peticiones que vayan a api.themoviedb.org
    if (!req.url.includes('api.themoviedb.org/3/')) {
      return next.handle(req);
    }

    let params = req.params || new HttpParams();
    if (!params.has('api_key')) params = params.set('api_key', this.apiKey);
    if (!params.has('language')) params = params.set('language', this.language);
    if (!params.has('region')) params = params.set('region', this.region);

    const cloned = req.clone({ params });
    return next.handle(cloned);
  }
}
