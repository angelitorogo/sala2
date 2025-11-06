import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  apiUrl = environment.API_URL;
  private loggedIn = false;
  csrfToken: string = '';
  private usuario: any = null; // Almacena la información del usuario


  constructor(private http: HttpClient, private router: Router) { }

  // Método para inicializar el token
  async initializeCsrfToken(): Promise<void> {
    const response = await this.getCsrfToken().toPromise();
    this.csrfToken = response.csrfToken; // Guardar el token
    //console.log('CSRF Token obtenido:', this.csrfToken);
  }

  // Obtener CSRF-Token
  getCsrfToken(): Observable<any> {
    return this.http.get(`${this.apiUrl}/auth/csrf-token`, { withCredentials: true });
  }

  // Guardar el token CSRF en memoria
  setCsrfToken(token: string): void {
    this.csrfToken = token;
  }

  // Obtener el token CSRF actual
  getStoredCsrfToken(): string | null {
    return this.csrfToken;
  }

  // Método de login
  login(email: string, password: string): Observable<any> {

    // Ya hay un interceptor que le incluye en los header el X-SRCF-Token

    return this.http.post<any>(`${this.apiUrl}/auth/login`,
         { email, password }, 
         { withCredentials: true }
      )
      .pipe(
        tap(() => {
          //console.log('Login exitoso');
        })
      );
  }

  // Método de login
  register(fullname:string, email: string, password: string): Observable<any> {

    // Ya hay un interceptor que le incluye en los header el X-SRCF-Token

    return this.http.post<any>(`${this.apiUrl}/auth/register`,
         { fullname, email, password }, 
         { withCredentials: true }
      )
      .pipe(
        tap(() => {
          //console.log('Login exitoso');
        })
      );
  }

  // Método para realizar el logout
  logout(): Observable<{ message: string }> {


    return this.http.post<{ message: string }>(`${this.apiUrl}/auth/logout`,
      {}, // Cuerpo vacío
      { withCredentials: true } // Enviar cookies al backend
    );
  }

  // Método para verificar y obtener la información del usuario
  getUserInfo(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/auth/verify`, {
      withCredentials: true, // Necesario para enviar cookies
    });
  }

  // Método para almacenar localmente la información del usuario
  setUser(user: any) {
    this.usuario = user;
  }

  get user(): any {
    return this.usuario;
  }

  isLoggedIn(): boolean {
    return !!this.usuario; // Devuelve true si el usuario está definido
  }


}
