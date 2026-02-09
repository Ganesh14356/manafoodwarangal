
import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { storage } from './services/storage';
import { AppData, CartItem, Restaurant, MenuItem, User } from './types';
import Home from './views/Home';
import RestaurantMenu from './views/RestaurantMenu';
import Checkout from './views/Checkout';
import Admin from './views/Admin';
import Login from './views/Login';
import Tracking from './views/Tracking';

const App: React.FC = () => {
  const [data, setData] = useState<AppData>(storage.getData());
  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('manafood_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const refreshData = useCallback(() => {
    setData(storage.getData());
  }, []);

  const handleLogin = (user: User) => {
    const updated = { ...data, currentUser: user };
    storage.saveData(updated);
    setData(updated);
  };

  const handleLogout = () => {
    const updated = { ...data, currentUser: null };
    storage.saveData(updated);
    setData(updated);
    localStorage.removeItem('manafood_cart');
  };

  const addToCart = (item: MenuItem) => {
    if (cart.length > 0 && cart[0].restaurantId !== item.restaurantId) {
      if (confirm('Ordering from a different restaurant will clear your current cart.')) {
        setCart([{ ...item, quantity: 1 }]);
      }
      return;
    }
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  if (!data.currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col max-w-md mx-auto bg-white shadow-xl relative overflow-x-hidden">
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 px-4 py-3 flex items-center justify-between border-b border-gray-100">
           <Link to="/" className="flex flex-col">
             <h1 className="text-xl font-black text-green-600 italic tracking-tighter">ManaFood</h1>
             <span className="text-[8px] uppercase font-black text-gray-300 tracking-[0.2em] -mt-1">Warangal</span>
           </Link>
           <div className="flex items-center gap-3">
             <Link to="/admin" className="text-[10px] font-black uppercase text-gray-400">Admin</Link>
             <button onClick={handleLogout} className="text-[10px] font-black uppercase text-red-400">Exit</button>
             <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center border border-green-100">
               <span className="text-[10px] font-black text-green-700">{data.currentUser.name[0]}</span>
             </div>
           </div>
        </header>

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home restaurants={data.restaurants} />} />
            <Route path="/restaurant/:id" element={<RestaurantMenu restaurants={data.restaurants} items={data.menuItems} cart={cart} onAddToCart={addToCart} onUpdateCart={(id, delta) => {/* Implemented in RestaurantMenu */}} onRemoveFromCart={() => {/* Implemented in RestaurantMenu */}} />} />
            <Route path="/checkout" element={<Checkout cart={cart} restaurants={data.restaurants} lastOrderId={data.lastOrderId} currentUser={data.currentUser} onOrderPlaced={() => setCart([])} refreshAppData={refreshData} />} />
            <Route path="/tracking/:id" element={<Tracking orders={data.orders} />} />
            <Route path="/admin" element={<Admin data={data} onDataChange={refreshData} currentUser={data.currentUser} />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;
