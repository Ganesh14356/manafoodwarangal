
import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { storage } from './services/storage';
import { AppData, CartItem, Restaurant, MenuItem } from './types';
import Home from './views/Home';
import RestaurantMenu from './views/RestaurantMenu';
import Checkout from './views/Checkout';
import Admin from './views/Admin';

const Header: React.FC = () => {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 px-4 py-3 flex items-center justify-between shadow-sm">
      <Link to="/" className="flex flex-col">
        <h1 className="text-xl font-bold text-green-600 tracking-tight leading-none">ManaFood</h1>
        <span className="text-[10px] uppercase font-semibold text-gray-500 tracking-widest">Warangal</span>
      </Link>
      
      <div className="flex bg-gray-100 p-1 rounded-full border border-gray-200">
        <Link 
          to="/" 
          className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-full transition-all ${!isAdminPath ? 'bg-white shadow-sm text-green-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
          User
        </Link>
        <Link 
          to="/admin" 
          className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-full transition-all ${isAdminPath ? 'bg-white shadow-sm text-green-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
          Admin
        </Link>
      </div>
    </header>
  );
};

const App: React.FC = () => {
  const [data, setData] = useState<AppData>(storage.getData());
  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('manafood_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('manafood_cart', JSON.stringify(cart));
  }, [cart]);

  const refreshData = useCallback(() => {
    setData(storage.getData());
  }, []);

  const addToCart = (item: MenuItem) => {
    if (cart.length > 0 && cart[0].restaurantId !== item.restaurantId) {
      if (confirm('Ordering from a different restaurant will clear your current cart. Continue?')) {
        setCart([{ ...item, quantity: 1 }]);
      }
      return;
    }

    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateCartQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (id: string) => {
    if (id === 'all') {
      setCart([]);
    } else {
      setCart(prev => prev.filter(i => i.id !== id));
    }
  };

  const clearCart = () => setCart([]);

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col max-w-md mx-auto bg-white shadow-xl relative overflow-x-hidden">
        <Header />
        <main className="flex-1 pb-24">
          <Routes>
            <Route path="/" element={<Home restaurants={data.restaurants} />} />
            <Route 
              path="/restaurant/:id" 
              element={
                <RestaurantMenu 
                  restaurants={data.restaurants}
                  items={data.menuItems}
                  cart={cart}
                  onAddToCart={addToCart}
                  onUpdateCart={updateCartQuantity}
                  onRemoveFromCart={removeFromCart}
                />
              } 
            />
            <Route 
              path="/checkout" 
              element={
                <Checkout 
                  cart={cart} 
                  restaurants={data.restaurants}
                  lastOrderId={data.lastOrderId}
                  onOrderPlaced={clearCart}
                  refreshAppData={refreshData}
                />
              } 
            />
            <Route 
              path="/admin" 
              element={<Admin data={data} onDataChange={refreshData} />} 
            />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;
