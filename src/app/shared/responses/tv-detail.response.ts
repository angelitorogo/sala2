export interface TvDetailResponse {
    adult:                boolean;
    backdrop_path:        string;
    created_by:           CreatedBy[];
    episode_run_time:     any[];
    first_air_date:       Date;
    genres:               Genre[];
    homepage:             string;
    id:                   number;
    in_production:        boolean;
    languages:            string[];
    last_air_date:        Date;
    last_episode_to_air:  TEpisodeToAir;
    name:                 string;
    next_episode_to_air:  TEpisodeToAir;
    networks:             Network[];
    number_of_episodes:   number;
    number_of_seasons:    number;
    origin_country:       string[];
    original_language:    string;
    original_name:        string;
    overview:             string;
    popularity:           number;
    poster_path:          string;
    production_companies: Network[];
    production_countries: ProductionCountry[];
    seasons:              Season[];
    spoken_languages:     SpokenLanguage[];
    status:               string;
    tagline:              string;
    type:                 string;
    vote_average:         number;
    vote_count:           number;
    aggregate_credits:    AggregateCredits;
    videos:               Videos;
    images:               Images;
    "watch/providers":    WatchProviders;
    content_ratings:      ContentRatings;
    recommendations:      Recommendations;
    similar:              Recommendations;
    keywords:             Keywords;
    external_ids:         ExternalIDS;
    translations:         Translations;
}

export interface AggregateCredits {
    cast: Cast[];
    crew: Cast[];
}

export interface Cast {
    adult:                boolean;
    gender:               number;
    id:                   number;
    known_for_department: Department;
    name:                 string;
    original_name:        string;
    popularity:           number;
    profile_path:         null | string;
    roles?:               Role[];
    total_episode_count:  number;
    order?:               number;
    jobs?:                Job[];
    department?:          Department;
}

export enum Department {
    Acting = "Acting",
    Art = "Art",
    Camera = "Camera",
    CostumeMakeUp = "Costume & Make-Up",
    Crew = "Crew",
    Directing = "Directing",
    Editing = "Editing",
    Production = "Production",
    Sound = "Sound",
    VisualEffects = "Visual Effects",
    Writing = "Writing",
}

export interface Job {
    credit_id:     string;
    job:           string;
    episode_count: number;
}

export interface Role {
    credit_id:     string;
    character:     string;
    episode_count: number;
}

export interface ContentRatings {
    results: ContentRatingsResult[];
}

export interface ContentRatingsResult {
    descriptors: any[];
    iso_3166_1:  string;
    rating:      string;
}

export interface CreatedBy {
    id:            number;
    credit_id:     string;
    name:          string;
    original_name: string;
    gender:        number;
    profile_path:  string;
}

export interface ExternalIDS {
    imdb_id:      string;
    freebase_mid: string;
    freebase_id:  null;
    tvdb_id:      number;
    tvrage_id:    number;
    wikidata_id:  string;
    facebook_id:  string;
    instagram_id: string;
    twitter_id:   string;
}

export interface Genre {
    id:   number;
    name: string;
}

export interface Images {
    backdrops: any[];
    logos:     any[];
    posters:   Poster[];
}

export interface Poster {
    aspect_ratio: number;
    height:       number;
    iso_3166_1:   string;
    iso_639_1:    string;
    file_path:    string;
    vote_average: number;
    vote_count:   number;
    width:        number;
}

export interface Keywords {
    results: Genre[];
}

export interface TEpisodeToAir {
    id:              number;
    name:            string;
    overview:        string;
    vote_average:    number;
    vote_count:      number;
    air_date:        Date;
    episode_number:  number;
    episode_type:    string;
    production_code: string;
    runtime:         number;
    season_number:   number;
    show_id:         number;
    still_path:      string;
}

export interface Network {
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
    backdrop_path:     string;
    id:                number;
    name:              string;
    original_name:     string;
    overview:          string;
    poster_path:       string;
    media_type?:       MediaType;
    original_language: string;
    genre_ids:         number[];
    popularity:        number;
    first_air_date:    string;
    vote_average:      number;
    vote_count:        number;
    origin_country:    string[];
}

export enum MediaType {
    Tv = "tv",
}

export interface Season {
    air_date:      Date;
    episode_count: number;
    id:            number;
    name:          string;
    overview:      string;
    poster_path:   string;
    season_number: number;
    vote_average:  number;
}

export interface SpokenLanguage {
    english_name: string;
    iso_639_1:    string;
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
    name:     string;
    overview: string;
    homepage: string;
    tagline:  string;
}

export interface Videos {
    results: VideosResult[];
}

export interface VideosResult {
    iso_639_1:    string;
    iso_3166_1:   string;
    name:         string;
    key:          string;
    site:         string;
    size:         number;
    type:         string;
    official:     boolean;
    published_at: Date;
    id:           string;
}

export interface WatchProviders {
    results: { [key: string]: ResultValue };
}

export interface ResultValue {
    buy: any;
    link:     string;
    flatrate: Flatrate[];
}

export interface Flatrate {
    logo_path:        LogoPath;
    provider_id:      number;
    provider_name:    ProviderName;
    display_priority: number;
}

export enum LogoPath {
    DPR8R13ZWDeUR0QkzWidrdMxa56Jpg = "/dpR8r13zWDeUR0QkzWidrdMxa56.jpg",
    PbpMk2JmcoNnQwx5JGpXngfoWtpJpg = "/pbpMk2JmcoNnQwx5JGpXngfoWtp.jpg",
    QqTyjCCJuuARytrY7RNRAKka1VFJpg = "/qqTyjCCJuuARytrY7rNRAKka1VF.jpg",
}

export enum ProviderName {
    MagentaTV = "Magenta TV+",
    Netflix = "Netflix",
    NetflixStandardWithAds = "Netflix Standard with Ads",
}
