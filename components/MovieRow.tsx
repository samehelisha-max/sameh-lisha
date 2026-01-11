
import React, { useState, useEffect } from 'react';
import { Movie } from '../types';
import { Trash2, RefreshCw, Sparkles } from 'lucide-react';

interface MovieRowProps {
  movie: Movie;
  onDelete: (id: string) => void;
  onRefreshPoster: (id: string, title: string) => void;
  onFindSimilar: (title: string) => void;
}

const MovieRow: React.FC<MovieRowProps> = ({ movie, onDelete, onRefreshPoster, onFindSimilar }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [imageSrc, setImageSrc] = useState(movie.posterUrl);

  // تحديث الصورة عند تغير الرابط (مثلاً عند التحديث)
  useEffect(() => {
    setImageSrc(movie.posterUrl);
  }, [movie.posterUrl]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefreshPoster(movie.id, movie.title);
    setIsRefreshing(false);
  };

  const handleImageError = () => {
    // إذا فشل الرابط الأصلي، نستخدم مولد صور Placeholder احترافي يحمل اسم الفيلم
    setImageSrc(`https://placehold.co/600x900/0f172a/6366f1?text=${encodeURIComponent(movie.title)}`);
  };

  return (
    <tr className="border-b border-slate-800 hover:bg-slate-900/30 transition-colors group">
      <td className="px-6 py-8 align-top">
        <div className="flex gap-8 flex-col sm:flex-row">
          <div className="relative flex-shrink-0 mx-auto sm:mx-0">
            <div className="overflow-hidden rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-slate-700 bg-slate-800 w-44 h-64 sm:w-52 sm:h-72">
              <img 
                className={`h-full w-full object-cover transition-all duration-700 group-hover:scale-105 ${isRefreshing ? 'opacity-30 blur-sm' : 'opacity-100'}`} 
                src={imageSrc} 
                alt={movie.title} 
                loading="lazy"
                onError={handleImageError}
              />
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="absolute -top-3 -right-3 p-3 bg-indigo-600 rounded-full shadow-xl hover:bg-indigo-500 disabled:bg-slate-700 transition-all hover:scale-110 active:scale-90 z-10 text-white"
              title="تحديث البوستر"
            >
              <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
            </button>
          </div>
          
          <div className="flex flex-col justify-between py-2 text-center sm:text-right flex-grow">
            <div>
              <div className="flex items-center justify-center sm:justify-start flex-row-reverse gap-4 mb-3">
                <h3 className="text-2xl font-black text-white">{movie.title}</h3>
                <span className="px-3 py-1 rounded-full bg-slate-800 text-xs font-bold text-indigo-400 border border-slate-700">
                  {movie.year}
                </span>
              </div>
              <div className="text-md text-indigo-300 font-medium mb-4">{movie.genre}</div>
              <p className="text-slate-400 text-lg leading-relaxed mb-6 max-w-2xl" dir="rtl">
                {movie.description}
              </p>
            </div>
            
            <div className="flex justify-center sm:justify-start gap-4">
              <button 
                onClick={() => onFindSimilar(movie.title)}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white rounded-xl text-sm font-bold transition-all border border-indigo-500/20"
              >
                <Sparkles size={18} />
                اقترح أفلام مشابهة
              </button>
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-8 align-top whitespace-nowrap text-center">
        <div className="inline-flex flex-col items-center p-4 bg-slate-950/50 rounded-2xl border border-slate-800 min-w-[100px]">
          <div className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-1">IMDb RATING</div>
          <div className="text-2xl font-black text-amber-400">
            {movie.rating && movie.rating.includes('/') ? movie.rating.split('/')[0] : (movie.rating || 'N/A')}
            <span className="text-sm text-slate-600 ml-1">/10</span>
          </div>
        </div>
      </td>
      <td className="px-6 py-8 align-top whitespace-nowrap text-left">
        <button
          onClick={() => onDelete(movie.id)}
          className="text-slate-700 hover:text-red-500 transition-all p-3 hover:bg-red-500/10 rounded-full"
          aria-label="Delete"
        >
          <Trash2 size={24} />
        </button>
      </td>
    </tr>
  );
};

export default MovieRow;
