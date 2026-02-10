
import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Restaurant, MenuItem, CartItem, Category, Review } from '../types';
import { getRestaurantLiveStats } from '../services/gemini';
import { storage } from '../services/storage';

interface MenuProps {
  restaurants: Restaurant[];
  items: MenuItem[];
  cart: CartItem[];
  onAddToCart: (item: MenuItem) => void;
  onUpdateCart: (id: string, delta: number) => void;
  onRemoveFromCart: (id: string) => void;
}

const RestaurantMenu: React.FC<MenuProps> = ({ 
  restaurants, 
  items, 
  cart, 
  onAddToCart, 
  onUpdateCart,
  onRemoveFromCart
}) => {
  const { id } = useParams<{ id: string }>();
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [search, setSearch] = useState('');
  const [liveStats, setLiveStats] = useState<{ ratingInfo: string, reviews: string, mapsUrl: string }>({
    ratingInfo: "4.8",
    reviews: "1k+",
    mapsUrl: ""
  });

  const restaurant = restaurants.find(r => r.id === id);
  const restaurantItems = useMemo(() => items.filter(i => i.restaurantId === id), [items, id]);

  useEffect(() => {
    if (restaurant) {
      getRestaurantLiveStats(restaurant.name, restaurant.address || '', restaurant.location ? { latitude: restaurant.location.lat, longitude: restaurant.location.lng } : undefined)
        .then(stats => {
          if (stats) setLiveStats(stats);
        });
    }
  }, [restaurant]);

  const activeCategories = useMemo(() => {
    const cats = new Set(restaurantItems.map(i => i.category));
    return ['All', ...Array.from(cats)] as (Category | 'All')[];
  }, [restaurantItems]);

  const filteredItems = useMemo(() => {
    return restaurantItems.filter(item => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [restaurantItems, selectedCategory, search]);

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (!restaurant) return <div className="p-8 text-center font-black uppercase text-gray-400">Not found</div>;

  return (
    <div className="flex flex-col min-h-screen">
      <div className="bg-white p-4 border-b border-gray-100">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <h2 className="text-2xl font-black text-gray-900 tracking-tighter uppercase mb-1">{restaurant.name}</h2>
            <p className="text-[10px] font-bold text-gray-400 leading-tight pr-4">{restaurant.address}</p>
          </div>
          <div className="bg-green-50 px-3 py-2 rounded-2xl text-center border border-green-100 min-w-[70px]">
            <div className="flex items-center justify-center gap-1 text-green-700 font-black text-xs">
              <span>{liveStats.ratingInfo}</span>
              <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
            </div>
            <p className="text-[7px] font-black uppercase text-green-600 tracking-tighter">Verified</p>
          </div>
        </div>
      </div>

      <div className="bg-white sticky top-[60px] z-40 px-4 py-3 border-b border-gray-100 shadow-sm">
        <input 
          type="text" placeholder="Search menu..."
          className="w-full bg-gray-100 rounded-xl px-4 py-2 text-sm mb-3 font-bold outline-none"
          value={search} onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {activeCategories.map(cat => (
            <button
              key={cat} onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-[10px] uppercase font-black tracking-widest transition-all ${
                selectedCategory === cat ? 'bg-black text-white' : 'bg-white text-gray-400 border border-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-8 flex-1 pb-32">
        {activeCategories.filter(c => selectedCategory === 'All' || c === selectedCategory).map(cat => {
          if (cat === 'All') return null;
          const itemsInCat = filteredItems.filter(i => i.category === cat);
          if (itemsInCat.length === 0) return null;
          return (
            <div key={cat} className="space-y-4">
              <h3 className="text-xl font-black text-gray-900 border-l-4 border-green-500 pl-3 uppercase tracking-tight">{cat}</h3>
              <div className="grid gap-4">
                {itemsInCat.map(item => {
                  const cartItem = cart.find(ci => ci.id === item.id);
                  return (
                    <div key={item.id} className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                      <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                        <img src={item.image} alt={item.name} className={`w-full h-full object-cover ${!item.inStock && 'grayscale opacity-50'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 truncate uppercase text-sm">{item.name}</h4>
                        <p className="text-xs font-black text-green-600 mt-1">₹{item.price}</p>
                      </div>
                      <div className="flex items-center">
                        {cartItem ? (
                          <div className="flex items-center bg-black rounded-xl overflow-hidden shadow-lg">
                            <button onClick={() => onUpdateCart(item.id, -1)} className="w-8 h-10 flex items-center justify-center text-white"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 12H4"/></svg></button>
                            <span className="w-7 text-center text-xs font-black text-white">{cartItem.quantity}</span>
                            <button onClick={() => onUpdateCart(item.id, 1)} className="w-8 h-10 flex items-center justify-center text-white"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg></button>
                          </div>
                        ) : (
                          <button 
                            disabled={!item.inStock} onClick={() => onAddToCart(item)}
                            className={`w-10 h-10 flex items-center justify-center rounded-xl shadow-md transition-all active:scale-90 ${
                              item.inStock ? 'bg-white border-2 border-green-600 text-green-600' : 'bg-gray-100 text-gray-300'
                            }`}
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-white/95 backdrop-blur-md z-50 border-t border-gray-100">
          <Link 
            to="/checkout" 
            className="flex items-center justify-between w-full bg-green-600 text-white px-6 py-4 rounded-2xl font-black shadow-xl active:scale-[0.98] transition-all"
          >
            <div className="flex flex-col items-start leading-none">
              <span className="text-[10px] uppercase tracking-widest opacity-80 mb-1">₹{cartTotal} • {itemCount} Items</span>
              <span className="text-sm">REVIEW BOOKING</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase">CONFIRM</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
};

export default RestaurantMenu;
