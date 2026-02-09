
import React from 'react';
import { Link } from 'react-router-dom';
import { Restaurant } from '../types';

interface HomeProps {
  restaurants: Restaurant[];
}

const Home: React.FC<HomeProps> = ({ restaurants }) => {
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
        <p className="text-gray-500 text-sm">Warangal's best delivery startup.</p>
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
