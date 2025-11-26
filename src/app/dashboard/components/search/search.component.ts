import { Component, OnDestroy, OnInit } from '@angular/core';
import { SearchService, TmdbSearchResult } from '../../services/search.service';
import { ActivatedRoute } from '@angular/router';
import { distinctUntilChanged, map, Subscription } from 'rxjs';
import { MediaItem } from '../../../shared/models/media-item/media-item.component';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrl: './search.component.css'
})
export class SearchComponent implements OnInit, OnDestroy{

  public results?: TmdbSearchResult[];
  public query: string = '';
  public movies: TmdbSearchResult[] = [];
  public moviesFinal: MediaItem[] = [];
  public series: TmdbSearchResult[] = [];
  public seriesFinal: MediaItem[] = [];
  public persons: TmdbSearchResult[] = [];
  public personsFinal: MediaItem[] = [];
  private subParams?: Subscription;

  loading: boolean = true;

  constructor( private searchService: SearchService, private route: ActivatedRoute) {}
  

  ngOnInit(): void {


    this.subParams = this.route.paramMap
      .pipe(
        map(params => (params.get('query') ?? '').trim()),
        distinctUntilChanged()
      )
      .subscribe(query => {
        this.query = query;

        // 1) Recuperar del servicio los 40 resultados del Dashboard
        this.searchService.fetch180ByType(query).subscribe({
          next: ({ movies, tv, persons }) => {
            //console.log('🎬 Pelis (40 máx):', movies);
            //console.log('📺 Series (40 máx):', tv);
            //console.log('👤 Personas (40 máx):', persons);

            this.loading = true;
            
            this.searchService.setResults([...movies, ...tv, ...persons], query);


            

          }
        });


        setTimeout(() => {

          this.results = this.searchService.results.resultados;
          this.query = this.searchService.results.query;

          // 2) Clasificarlos en las 3 listas
          if (this.results) this.classifyResults(this.results);

          if(this.results?.length == 0) {

            setTimeout(() => {
              this.loading = false;
            }, 400);
            
              
            }
          
          
        }, 200);

        // 3) (Opcional) Scroll al inicio
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });

  }

  ngOnDestroy(): void {
    this.subParams?.unsubscribe();
  }

  toMediaItem(r: TmdbSearchResult): MediaItem {
    return {
      id: r.id,
      poster_path: r.poster_path ?? null,
      vote_average: r.vote_average,
      title: r.title,
      name: r.name,
      release_date: r.release_date?.toString() ?? undefined,
      first_air_date: undefined,
      profile_path: r.profile_path,
      popularity: r.popularity
    };
  }

  toMediaItems(list: TmdbSearchResult[]): MediaItem[] {
    const filtered = list
      // excluir personas con voto < 1 (aunque no deberían entrar aquí)
      .filter(r => !(r.media_type == 'person' && r.profile_path == null));

    const converted = filtered.map(r => this.toMediaItem(r));

    const sorted = converted.sort(
      (a, b) => (b.popularity ?? 0) - (a.popularity ?? 0)
    );

    return sorted;
  }

  /** Separa los resultados según media_type */
  private classifyResults(results: TmdbSearchResult[]): void {
    this.movies  = results.filter(r => r.media_type === 'movie');
    this.series      = results.filter(r => r.media_type === 'tv');
    this.persons = results.filter(r => r.media_type === 'person');

    this.moviesFinal = this.toMediaItems(this.movies);
    this.seriesFinal = this.toMediaItems(this.series);
    this.personsFinal = this.toMediaItems(this.persons);

    //console.log(this.movies, this.series, this.persons);

    //console.log(this.moviesFinal, this.seriesFinal, this.personsFinal);

  }





}
