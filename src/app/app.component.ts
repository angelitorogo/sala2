import { Component, OnInit } from '@angular/core';
import { AuthService } from './auth/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit{
  title = 'Sala2';

  constructor(private _authService: AuthService) {

  }

  ngOnInit(): void {
    this.initializeCsrfToken();
  }

  // Método para obtener el CSRF Token al iniciar la app
  private initializeCsrfToken(): void {
    this._authService.getCsrfToken().subscribe({
      next: (response) => {
        console.log(response)
        this._authService.setCsrfToken(response.csrfToken);
      },
      error: (err) => {
        console.error('Error al obtener el CSRF Token:', err);
      },
    });
  }

}
