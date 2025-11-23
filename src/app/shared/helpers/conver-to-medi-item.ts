import { MediaItem } from "../models/media-item/media-item.component";
import { RecommendationsResult } from "../responses/movie-detail.response";

export class convert {
    toMediaItem(r: RecommendationsResult): MediaItem {
        return {
            id: r.id,
            poster_path: r.poster_path ?? null,
            backdrop_path: r.backdrop_path ?? null,
            vote_average: r.vote_average,
            title: r.title,                // es una película, así que title sí existe
            name: undefined,               // solo para series, aquí vacío
            release_date: r.release_date?.toString() ?? undefined,
            first_air_date: undefined      // solo para series
        };
    }
}