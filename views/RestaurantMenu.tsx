
import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Restaurant, MenuItem, CartItem, Category } from '../types';

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
  const [showPolicy, setShowPolicy] = useState(false);

  const restaurant = restaurants.find(r => r.id === id);
  const restaurantItems = useMemo(() => items.filter(i => i.restaurantId === id), [items, id]);

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

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (!restaurant) return <div className="p-8 text-center">Restaurant not found.</div>;

  return (
    <div className="flex flex-col min-h-screen">
      <div className="bg-white sticky top-[60px] z-40 px-4 py-3 border-b border-gray-100 shadow-sm">
        <input 
          type="text" 
          placeholder="Search for items..."
          className="w-full bg-gray-100 rounded-xl px-4 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {activeCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all ${
                selectedCategory === cat 
                  ? 'bg-green-600 text-white shadow-md' 
                  : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-8 flex-1">
        <div className="space-y-10">
          {(selectedCategory === 'All' ? activeCategories.filter(c => c !== 'All') : [selectedCategory]).map(cat => {
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
                        <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-50 border border-gray-100">
                          <img src={item.image} alt={item.name} className={`w-full h-full object-cover ${!item.inStock && 'grayscale opacity-50'}`} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col mb-1">
                            <h4 className="font-bold text-gray-900 truncate">{item.name}</h4>
                            <p className="text-green-700 font-black text-sm">₹{item.price}</p>
                          </div>
                          {!item.inStock && <span className="text-[9px] bg-red-50 text-red-500 font-black px-1.5 py-0.5 rounded border border-red-100 uppercase">Out of Stock</span>}
                        </div>
                        
                        <div className="flex items-center">
                          {cartItem ? (
                            <div className="flex items-center bg-green-600 rounded-xl overflow-hidden shadow-lg shadow-green-100">
                              <button
                                onClick={() => onUpdateCart(item.id, -1)}
                                className="w-8 h-10 flex items-center justify-center text-white hover:bg-green-700"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 12H4"/></svg>
                              </button>
                              <span className="w-7 text-center text-xs font-black text-white">{cartItem.quantity}</span>
                              <button
                                onClick={() => onUpdateCart(item.id, 1)}
                                className="w-8 h-10 flex items-center justify-center text-white hover:bg-green-700"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                              </button>
                            </div>
                          ) : (
                            <button 
                              disabled={!item.inStock}
                              onClick={() => onAddToCart(item)}
                              className={`w-10 h-10 flex items-center justify-center rounded-xl shadow-md transition-all active:scale-90 ${
                                item.inStock ? 'bg-white border border-green-500 text-green-600 hover:bg-green-50' : 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                              }`}
                            >
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
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

        <div className="pt-10 pb-20 border-t border-gray-100">
          <button 
            onClick={() => setShowPolicy(true)}
            className="w-full bg-gray-50 p-4 rounded-2xl border border-dashed border-gray-200 text-left space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-widest text-gray-400">Cancellation Policy</span>
              <svg className="w-4 h-4 text-gray-300 group-hover:text-green-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <p className="text-[10px] text-gray-500 font-medium leading-relaxed">
              🟢 Orders can be cancelled only before food preparation starts. Once food is prepared or rider is booked, cancellation is not allowed. 
              <span className="text-green-600 font-bold ml-1">Read full policy →</span>
            </p>
          </button>
        </div>
      </div>

      {showPolicy && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-end sm:items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Cancellation Policy</h3>
                <button onClick={() => setShowPolicy(false)} className="p-2 bg-gray-100 rounded-full"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
              </div>
              <div className="space-y-4 text-sm text-gray-600 max-h-[60vh] overflow-y-auto pr-2 no-scrollbar">
                <section>
                  <p className="font-bold text-gray-800 mb-1">1. Cancellation Window</p>
                  <p className="text-xs">Orders can be cancelled ONLY before the restaurant starts preparing food. Once preparation begins, cancellation is not possible and no refunds will be issued.</p>
                </section>
                <section>
                  <p className="font-bold text-gray-800 mb-1">2. Rider Bookings</p>
                  <p className="text-xs">If a rider (Rapido/Own) is already assigned, the order cannot be cancelled. Any rider charges incurred must be paid by the customer.</p>
                </section>
                <section>
                  <p className="font-bold text-gray-800 mb-1">3. Wrong Orders</p>
                  <p className="text-xs">Report incorrect items within 10 minutes of delivery for replacement or partial refund. No refunds for taste preferences.</p>
                </section>
                <section>
                  <p className="font-bold text-gray-800 mb-1">4. Delivery Issues</p>
                  <p className="text-xs">ManaFood is not responsible for delays caused by incorrect addresses or unreachable phone numbers.</p>
                </section>
                <p className="text-[10px] font-bold text-orange-500 py-2 border-y border-orange-50">By placing an order, you agree to these terms.</p>
              </div>
              <button onClick={() => setShowPolicy(false)} className="w-full bg-green-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-green-100">Got it</button>
            </div>
          </div>
        </div>
      )}

      {cart.length > 0 && (
        <div className="bg-white border-t border-gray-200 p-4 space-y-4 pb-28">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold uppercase tracking-tight">Your Selection</h3>
            <button onClick={() => onRemoveFromCart('all')} className="text-[10px] font-black text-red-500 uppercase tracking-widest">Clear All</button>
          </div>
          <div className="space-y-3">
            {cart.map(item => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <div className="flex-1">
                  <p className="font-bold text-gray-800">{item.name}</p>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">₹{item.price} × {item.quantity}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-gray-50 border rounded-xl overflow-hidden">
                    <button onClick={() => onUpdateCart(item.id, -1)} className="w-7 h-8 flex items-center justify-center text-gray-400"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 12H4"/></svg></button>
                    <span className="w-6 text-center font-black text-[11px] text-gray-700">{item.quantity}</span>
                    <button onClick={() => onUpdateCart(item.id, 1)} className="w-7 h-8 flex items-center justify-center text-gray-400"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between font-black text-xl pt-3 border-t border-gray-100">
            <span className="text-gray-900">Total</span>
            <span className="text-green-600 font-black">₹{cartTotal}</span>
          </div>
        </div>
      )}

      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-white/90 backdrop-blur-md z-50">
          <Link 
            to="/checkout" 
            className="flex items-center justify-between w-full bg-green-600 text-white px-6 py-4 rounded-2xl font-black shadow-2xl shadow-green-200 active:scale-[0.98] transition-all"
          >
            <div className="flex flex-col items-start leading-none">
              <span className="text-[9px] uppercase tracking-widest opacity-70 mb-1">Confirm Order</span>
              <span className="text-sm">{cart.reduce((a, b) => a + b.quantity, 0)} Items Added</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-lg">₹{cartTotal}</span>
              <div className="bg-white/20 p-1 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
              </div>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
};

export default RestaurantMenu;
