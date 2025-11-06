import { AfterViewInit, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AuthService } from '../../../auth/services/auth.service';
import { Router } from '@angular/router';
import { MediaItem } from '../../../shared/models/media-item/media-item.component';
import { TvService } from '../../services/tv.service';
import { MoviesService } from '../../services/movies.service';

import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  encapsulation: ViewEncapsulation.None // Desactiva la encapsulación de estilos
})
export class HomeComponent implements OnInit, AfterViewInit{

  moviesPopular: MediaItem[] = [];
  tvPopular: MediaItem[] = [];
  moviesTrending: MediaItem[] = [];
  moviesTopRated: MediaItem[] = [];
  moviesNowPlaying: MediaItem[] = [];
  tvAiringToday: MediaItem[] = [];
  trendingMixed: MediaItem[] = [];

  loading: boolean = true;

  constructor(private _router: Router, private moviesService: MoviesService, private tvService: TvService) {

  }


  ngOnInit(): void {
    //this.comprobarUser();

    // Populares (películas)
    this.moviesService.getPopular().subscribe(r => this.moviesPopular = r.results);

    // Populares (series)
    this.tvService.getPopular().subscribe(r => this.tvPopular = r.results);

    // Tendencias de hoy (películas)
    this.moviesService.getTrendingToday().subscribe(r => this.moviesTrending = r.results);

    // Mejor valoradas (películas)
    this.moviesService.getTopRated().subscribe(r => this.moviesTopRated = r.results);

    // En cines ahora (películas)
    this.moviesService.getNowPlaying().subscribe(r => this.moviesNowPlaying = r.results);

    // En emisión hoy (series)
    this.tvService.getAiringToday().subscribe(r => this.tvAiringToday = r.results);

    // Tendencias mixtas (pelis + series)
    this.moviesService.getTrendingToday().subscribe((rMovie) => {
      const movies = rMovie.results.map(m => ({ ...m, media_type: 'movie' }));

      this.tvService.getTrendingToday().subscribe((rTv) => {
        const tv = rTv.results.map(s => ({ ...s, media_type: 'tv' }));

        this.trendingMixed = [...movies, ...tv]
          // Orden por popularidad/nota
          .sort((a, b) => (b.vote_average - a.vote_average))
          .slice(0, 20); // top 20
      });
    });


    forkJoin({
      popularTv: this.tvService.getPopular(),
      popularMovies: this.moviesService.getPopular(),
      trendingMovies: this.moviesService.getTrendingToday(),
      topMovies: this.moviesService.getTopRated(),
      nowPlaying: this.moviesService.getNowPlaying(),
      airingToday: this.tvService.getAiringToday(),
      trendingMoviesOnly: this.moviesService.getTrendingToday(),
      trendingTvOnly: this.tvService.getTrendingToday(),
    }).subscribe(({ popularTv, popularMovies, trendingMovies, topMovies, nowPlaying, airingToday, trendingMoviesOnly, trendingTvOnly }) => {
      
      this.tvPopular = popularTv.results;
      this.moviesPopular = popularMovies.results;
      this.moviesTrending = trendingMovies.results;
      this.moviesTopRated = topMovies.results;
      this.moviesNowPlaying = nowPlaying.results;
      this.tvAiringToday = airingToday.results;

      // MIX
      const movies = trendingMoviesOnly.results.map(m => ({ ...m, media_type: 'movie' }))
      const tv = trendingTvOnly.results.map(s => ({ ...s, media_type: 'tv' }))
      
      this.trendingMixed = [...movies, ...tv]
        .sort((a, b) => b.vote_average - a.vote_average)
        .slice(0, 20);

      this.loading = false;
    });

  }

  ngAfterViewInit(): void {
    const container = document.getElementById('grid-container');

    if (container) {
      for (let i = 0; i < 1600; i++) {
        const square = document.createElement('div');
        square.classList.add('grid-square'); // Cada cuadrado tendrá el estilo definido en CSS
        container.appendChild(square);
      }

  
    }

  }

  onSelect(item: MediaItem) {
    // navegar a detalle, por ejemplo
    // this.router.navigate(['/movie', item.id])
    console.log('select', item);
  }

  /*

  // Método para realizar el logout
  logout() {
    this._authService.logout().subscribe({
      next: (response) => {
        //console.log(response.message); // Mensaje de logout exitoso
        // Redirigir al usuario a la página de login
        this._authService.setUser(null);
      },
      error: (err) => {
        console.error('Error en logout:', err);
      },
    });
  }

  comprobarUser() {

    this._authService.getUserInfo().subscribe({
      next: (response) => {
        this._authService.setUser(response.user); // Guarda el usuario en el servicio
        //console.log('Usuario autenticado:', response.user);
      },
      error: (err) => {
        //console.log('No hay usuario logado o token inválido.');
        this._authService.setUser(null);
      },
    });
    
  }

  */

  

}
