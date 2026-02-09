
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Restaurant } from '../types';
import { getSmartFoodAdvice } from '../services/gemini';

interface HomeProps {
  restaurants: Restaurant[];
}

const Home: React.FC<HomeProps> = ({ restaurants }) => {
  const [aiQuery, setAiQuery] = useState('');
  const [aiResult, setAiResult] = useState<{ text: string, links: any[] } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAiSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;
    setLoading(true);
    try {
      // Get current location if possible
      let location = undefined;
      try {
        const pos = await new Promise<GeolocationPosition>((res, rej) => 
          navigator.geolocation.getCurrentPosition(res, rej)
        );
        location = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
      } catch (e) {
        console.log("Location not available for AI search context");
      }

      const result = await getSmartFoodAdvice(aiQuery, location);
      setAiResult(result);
    } catch (err) {
      console.error(err);
      alert("AI Search encountered an error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isCurrentlyOpen = (res: Restaurant) => {
    if (!res.isOpen) return false;
    const now = new Date();
    const [openH, openM] = res.openTime.split(':').map(Number);
    const [closeH, closeM] = res.closeTime.split(':').map(Number);
    const openTime = new Date();
    openTime.setHours(openH, openM, 0);
    const closeTime = new Date();
    closeTime.setHours(closeH, closeM, 0);
    return now >= openTime && now <= closeTime;
  };

  return (
    <div className="p-4 space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Explore Food</h2>
        <p className="text-gray-500 text-sm">Warangal's smartest delivery platform.</p>
      </div>

      {/* AI Smart Search Section */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-3xl border border-green-100 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <div className="bg-green-600 p-1.5 rounded-lg text-white">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          </div>
          <h3 className="text-xs font-black uppercase tracking-widest text-green-800">ManaAI Smart Finder</h3>
        </div>
        <form onSubmit={handleAiSearch} className="relative">
          <input 
            type="text" 
            placeholder="Ask AI: Best Biryani near me?"
            className="w-full bg-white border border-green-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-green-500/10 transition-all pr-12"
            value={aiQuery}
            onChange={(e) => setAiQuery(e.target.value)}
          />
          <button 
            type="submit"
            disabled={loading}
            className="absolute right-2 top-2 bottom-2 bg-green-600 text-white px-3 rounded-xl hover:bg-green-700 transition-colors"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            )}
          </button>
        </form>

        {aiResult && (
          <div className="mt-4 bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-green-100 animate-slide-up">
            <p className="text-xs text-gray-700 leading-relaxed mb-3 whitespace-pre-wrap">{aiResult.text}</p>
            {aiResult.links.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {aiResult.links.map((link, i) => (
                  <a 
                    key={i} 
                    href={link.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-[10px] font-bold border border-green-100 hover:bg-green-100 transition-colors"
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                    {link.title}
                  </a>
                ))}
              </div>
            )}
            <button 
              onClick={() => setAiResult(null)}
              className="mt-3 text-[10px] font-black uppercase text-gray-400 hover:text-gray-600"
            >
              Clear Results
            </button>
          </div>
        )}
      </div>

      <div className="grid gap-6">
        {restaurants.map(res => {
          const open = isCurrentlyOpen(res);
          return (
            <div key={res.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 group transition-all active:scale-[0.98]">
              <div className="relative h-48">
                <img src={res.image} alt={res.name} className={`w-full h-full object-cover ${!open && 'grayscale opacity-80'}`} />
                <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${open ? 'bg-green-600 text-white shadow-lg' : 'bg-red-500 text-white'}`}>
                  {open ? 'Open Now' : 'Closed'}
                </div>
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">{res.name}</h3>
                </div>
                <div className="flex items-center text-[10px] text-gray-400 font-bold mb-5">
                  <span className="bg-gray-100 px-2 py-1 rounded-md uppercase tracking-widest">{res.openTime} - {res.closeTime}</span>
                </div>
                <Link 
                  to={open ? `/restaurant/${res.id}` : '#'} 
                  className={`block w-full text-center py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-md transition-all ${open ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'}`}
                  onClick={(e) => !open && e.preventDefault()}
                >
                  {open ? 'View Menu' : 'Currently Closed'}
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Home;
