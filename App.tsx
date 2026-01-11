
import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Clapperboard, Loader2, X } from 'lucide-react';
import { Movie } from './types';
import { fetchMoviePosterAndDetails, getSimilarMovies } from './services/geminiService';
import MovieRow from './components/MovieRow';

const STORAGE_KEY = 'cinematique_watchlist_v2';

const App: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [similarMovies, setSimilarMovies] = useState<{title: string, list: string[]} | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setMovies(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved movies");
      }
    }
    setIsInitializing(false);
  }, []);

  useEffect(() => {
    if (!isInitializing) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(movies));
    }
  }, [movies, isInitializing]);

  const handleAddMovie = async (e?: React.FormEvent, customTitle?: string) => {
    if (e) e.preventDefault();
    const movieTitle = customTitle || title;
    if (!movieTitle.trim()) return;

    setIsLoading(true);
    try {
      const details = await fetchMoviePosterAndDetails(movieTitle);
      
      const newMessage: Movie = {
        id: crypto.randomUUID(),
        title: movieTitle.trim(),
        rating: details.imdbRating,
        posterUrl: details.posterUrl,
        year: details.year,
        genre: details.genre,
        description: details.description,
        addedAt: Date.now(),
      };

      setMovies(prev => [newMessage, ...prev]);
      if (!customTitle) setTitle('');
      setSimilarMovies(null);
    } catch (error) {
      alert("حدث خطأ أثناء جلب بيانات الفيلم.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshPoster = async (id: string, movieTitle: string) => {
    try {
      const details = await fetchMoviePosterAndDetails(movieTitle + " official poster");
      setMovies(prev => prev.map(m => m.id === id ? { ...m, posterUrl: details.posterUrl } : m));
    } catch (e) {
      console.error("Error refreshing poster");
    }
  };

  const handleFindSimilar = async (movieTitle: string) => {
    setIsLoading(true);
    try {
      const list = await getSimilarMovies(movieTitle);
      setSimilarMovies({ title: movieTitle, list });
    } catch (e) {
      alert("خطأ في جلب الأفلام المشابهة");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMovie = useCallback((id: string) => {
    setMovies(prev => prev.filter(m => m.id !== id));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-16">
      <header className="mb-16">
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="p-4 bg-indigo-600 rounded-3xl shadow-2xl shadow-indigo-500/40 transform -rotate-6">
            <Clapperboard className="text-white" size={40} />
          </div>
          <div>
            <h1 className="text-5xl font-black tracking-tight text-white mb-1">سينماتك</h1>
            <p className="text-slate-500 text-lg font-medium">قائمة مشاهدتك الذكية</p>
          </div>
        </div>

        <form onSubmit={(e) => handleAddMovie(e)} className="relative max-w-2xl mx-auto group">
          <div className="flex flex-col sm:flex-row gap-4 p-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl focus-within:border-indigo-500/50 transition-all">
            <div className="relative flex-grow flex items-center px-4">
              <Search className="text-slate-500" size={24} />
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="ابحث عن فيلم لإضافته..."
                className="w-full px-4 py-3 bg-transparent text-white outline-none placeholder:text-slate-600 text-lg text-right"
                dir="rtl"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/20 active:scale-95 whitespace-nowrap"
            >
              {isLoading ? <Loader2 className="animate-spin" size={24} /> : <Plus size={24} />}
              <span>إضافة للقائمة</span>
            </button>
          </div>
        </form>
      </header>

      {similarMovies && (
        <div className="mb-12 p-6 bg-indigo-950/30 border border-indigo-500/20 rounded-3xl animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-indigo-300 flex items-center gap-2">
              أفلام مشابهة لـ "{similarMovies.title}"
            </h2>
            <button onClick={() => setSimilarMovies(null)} className="text-slate-500 hover:text-white">
              <X size={20} />
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
            {similarMovies.list.map((m, i) => (
              <button
                key={i}
                onClick={() => handleAddMovie(undefined, m)}
                className="px-4 py-2 bg-indigo-900/40 hover:bg-indigo-600 text-indigo-100 rounded-full text-sm border border-indigo-500/30 transition-all flex items-center gap-2"
              >
                <Plus size={14} />
                {m}
              </button>
            ))}
          </div>
        </div>
      )}

      <main className="bg-slate-900/40 border border-slate-800/60 rounded-[2.5rem] overflow-hidden backdrop-blur-xl shadow-inner">
        {movies.length === 0 ? (
          <div className="py-32 text-center">
            <div className="inline-flex items-center justify-center p-10 bg-slate-900/80 rounded-[3rem] mb-8 border border-slate-800 shadow-2xl">
              <Clapperboard className="text-slate-800" size={64} />
            </div>
            <h3 className="text-2xl font-bold text-slate-300 mb-2">لا توجد أفلام حالياً</h3>
            <p className="text-slate-500 max-w-xs mx-auto">ابدأ بإضافة أول فيلم لمشاهدته الليلة!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse" dir="rtl">
              <thead>
                <tr className="bg-slate-950/50 border-b border-slate-800">
                  <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-slate-500 text-right">معلومات الفيلم</th>
                  <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-slate-500 text-center">التقييم</th>
                  <th className="px-6 py-5"></th>
                </tr>
              </thead>
              <tbody>
                {movies.map((movie) => (
                  <MovieRow 
                    key={movie.id} 
                    movie={movie} 
                    onDelete={handleDeleteMovie} 
                    onRefreshPoster={handleRefreshPoster}
                    onFindSimilar={handleFindSimilar}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <footer className="mt-16 text-center text-slate-600 text-sm font-medium">
        بيانات التقييم مستمدة من IMDb • الذكاء الاصطناعي بواسطة Gemini
      </footer>
    </div>
  );
};

export default App;
