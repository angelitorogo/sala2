export interface MovieDetailResponse {
    adult:                 boolean;
    backdrop_path:         string;
    belongs_to_collection: BelongsToCollection;
    budget:                number;
    genres:                Genre[];
    homepage:              string;
    id:                    number;
    imdb_id:               string;
    origin_country:        string[];
    original_language:     OriginalLanguage;
    original_title:        string;
    overview:              string;
    popularity:            number;
    poster_path:           string;
    production_companies:  ProductionCompany[];
    production_countries:  ProductionCountry[];
    release_date:          Date;
    revenue:               number;
    runtime:               number;
    spoken_languages:      SpokenLanguage[];
    status:                string;
    tagline:               string;
    title:                 string;
    video:                 boolean;
    vote_average:          number;
    vote_count:            number;
    credits:               Credits;
    videos:                Videos;
    images:                Images;
    "watch/providers":     WatchProviders;
    release_dates:         ReleaseDates;
    recommendations:       Recommendations;
    similar:               Recommendations;
    keywords:              Keywords;
    external_ids:          ExternalIDS;
    translations:          Translations;
}

export interface BelongsToCollection {
    id:            number;
    name:          string;
    poster_path:   string;
    backdrop_path: string;
}

export interface Credits {
    cast: Cast[];
    crew: Cast[];
}

export interface Cast {
    adult:                boolean;
    gender:               number;
    id:                   number;
    known_for_department: string;
    name:                 string;
    original_name:        string;
    popularity:           number;
    profile_path:         null | string;
    cast_id?:             number;
    character?:           string;
    credit_id:            string;
    order?:               number;
    department?:          string;
    job?:                 string;
}

export interface ExternalIDS {
    imdb_id:      string;
    wikidata_id:  string;
    facebook_id:  null;
    instagram_id: null;
    twitter_id:   null;
}

export interface Genre {
    id:   number;
    name: string;
}

export interface Images {
    backdrops: any[];
    logos:     Logo[];
    posters:   Logo[];
}

export interface Logo {
    aspect_ratio: number;
    height:       number;
    iso_3166_1:   ISO3166_1;
    iso_639_1:    ISO639_1;
    file_path:    string;
    vote_average: number;
    vote_count:   number;
    width:        number;
}

export enum ISO3166_1 {
    Es = "ES",
}

export enum ISO639_1 {
    Es = "es",
}

export interface Keywords {
    keywords: Genre[];
}

export enum OriginalLanguage {
    De = "de",
    Empty = "",
    En = "en",
}

export interface ProductionCompany {
    id:             number;
    logo_path:      null | string;
    name:           string;
    origin_country: string;
}

export interface ProductionCountry {
    iso_3166_1: string;
    name:       string;
}

export interface Recommendations {
    page:          number;
    results:       RecommendationsResult[];
    total_pages:   number;
    total_results: number;
}

export interface RecommendationsResult {
    adult:             boolean;
    backdrop_path:     null | string;
    id:                number;
    title:             string;
    original_title:    string;
    overview:          string;
    poster_path:       string;
    media_type?:       MediaType;
    original_language: string;
    genre_ids:         number[];
    popularity:        number;
    release_date:      Date;
    video:             boolean;
    vote_average:      number;
    vote_count:        number;
}

export enum MediaType {
    Movie = "movie",
}

export interface ReleaseDates {
    results: ReleaseDatesResult[];
}

export interface ReleaseDatesResult {
    iso_3166_1:    string;
    release_dates: ReleaseDate[];
}

export interface ReleaseDate {
    certification: string;
    descriptors:   string[];
    iso_639_1:     OriginalLanguage;
    note:          string;
    release_date:  Date;
    type:          number;
}

export interface SpokenLanguage {
    english_name: string;
    iso_639_1:    OriginalLanguage;
    name:         string;
}

export interface Translations {
    translations: Translation[];
}

export interface Translation {
    iso_3166_1:   string;
    iso_639_1:    string;
    name:         string;
    english_name: string;
    data:         Data;
}

export interface Data {
    homepage: string;
    overview: string;
    runtime:  number;
    tagline:  string;
    title:    string;
}

export interface Videos {
    results: VideosResult[];
}

export interface VideosResult {
    iso_639_1:    ISO639_1;
    iso_3166_1:   ISO3166_1;
    name:         string;
    key:          string;
    site:         Site;
    size:         number;
    type:         string;
    official:     boolean;
    published_at: Date;
    id:           string;
}

export enum Site {
    YouTube = "YouTube",
}

export interface WatchProvider {
  display_priority: number;
  logo_path: string;
  provider_id: number;
  provider_name: string;
}

// Tipo por país (ES, US, etc.)
export interface CountryWatchProviders {
  link: string;
  flatrate?: WatchProvider[];
  rent?: WatchProvider[];
  buy?: WatchProvider[];
  // A veces TMDB añade más campos (ads, free, etc.), los dejamos abiertos:
  [key: string]: any;
}

// results: índice por código de país (ES, US, FR, ...)
export interface WatchProviderResults {
  [countryCode: string]: CountryWatchProviders;
}

// Objeto raíz "watch/providers"
export interface WatchProviders {
  results: WatchProviderResults;
}