
import React from 'react';
import { Link } from 'react-router-dom';
import { Restaurant } from '../types';

interface HomeProps {
  restaurants: Restaurant[];
}

const Home: React.FC<HomeProps> = ({ restaurants }) => {
  const getStatus = (res: Restaurant) => {
    if (!res.isOpen) return { open: false, label: 'Shop Closed', color: 'bg-red-600' };
    
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    const [openH, openM] = res.openTime.split(':').map(Number);
    const [closeH, closeM] = res.closeTime.split(':').map(Number);
    
    const openMinutes = openH * 60 + openM;
    const closeMinutes = closeH * 60 + closeM;

    let isWithinHours = false;
    if (closeMinutes >= openMinutes) {
      isWithinHours = currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
    } else {
      isWithinHours = currentMinutes >= openMinutes || currentMinutes <= closeMinutes;
    }

    if (isWithinHours) {
      return { open: true, label: 'Open Now', color: 'bg-green-600' };
    }
    
    return { open: false, label: 'Closed', color: 'bg-gray-800' };
  };

  return (
    <div className="p-4 space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Warangal Cuisines</h2>
        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Order from local favorites</p>
      </div>

      <div className="grid gap-6">
        {restaurants.map(res => {
          const status = getStatus(res);
          const open = status.open;
          
          return (
            <div key={res.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 group transition-all active:scale-[0.98]">
              <div className="relative h-48">
                <img src={res.image} alt={res.name} className={`w-full h-full object-cover transition-all duration-700 ${!open && 'grayscale opacity-60 scale-105'}`} />
                <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg text-white ${status.color}`}>
                  {status.label}
                </div>
                {!open && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
                    <div className="bg-white/95 px-6 py-3 rounded-2xl shadow-2xl border border-gray-100">
                       <p className="text-[10px] font-black text-gray-900 uppercase tracking-[0.1em] text-center">
                         {status.label === 'Closed' ? `Opens at ${res.openTime}` : 'Currently Offline'}
                       </p>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">{res.name}</h3>
                </div>
                <div className="flex items-center text-[9px] text-gray-400 font-bold mb-5 gap-2">
                  <span className="bg-gray-100 px-2 py-1 rounded-md uppercase tracking-widest">Hours: {res.openTime} - {res.closeTime}</span>
                  <span className="text-green-600">★ 4.8 Verified</span>
                </div>
                <Link 
                  to={open ? `/restaurant/${res.id}` : '#'} 
                  className={`block w-full text-center py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-md transition-all ${open ? 'bg-green-600 text-white hover:bg-green-700 active:shadow-inner' : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'}`}
                  onClick={(e) => !open && e.preventDefault()}
                >
                  {open ? 'Browse Menu' : 'Closed Now'}
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
