
export interface Movie {
  id: string;
  title: string;
  rating: string; // IMDb rating
  posterUrl: string;
  year: string;
  genre: string;
  description: string;
  addedAt: number;
}

export interface GeminiMovieData {
  posterUrl: string;
  year: string;
  genre: string;
  imdbRating: string;
  description: string;
}
