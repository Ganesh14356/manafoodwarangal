
import React, { useState } from 'react';
import { User } from '../types';
import { storage } from '../services/storage';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const data = storage.getData();
    
    // Simulate slight delay for professional feel
    setTimeout(() => {
      // Super Admin check
      if (adminUser === 'Ganesh143' && adminPass === 'Ganesh123@') {
        onLogin({ id: 'admin_ganesh', name: 'Ganesh (Super Admin)', phone: '', role: 'Admin' });
        setLoading(false);
        return;
      }

      // Restaurant Partner check
      const restaurant = data.restaurants.find(r => r.adminUser === adminUser && r.adminPass === adminPass);
      if (restaurant) {
        onLogin({ 
          id: `admin_${restaurant.id}`, 
          name: `${restaurant.name} Partner`, 
          phone: restaurant.phone, 
          role: 'Restaurant',
          restaurantId: restaurant.id
        });
        setLoading(false);
        return;
      }

      setLoading(false);
      alert("Authentication Failed. Please check your partner credentials.");
    }, 1000);
  };

  return (
    <div className="p-8 min-h-[80vh] flex flex-col justify-center items-center bg-white">
      <div className="w-full max-w-sm space-y-10">
        <div className="text-center space-y-3">
          <div className="inline-block bg-black text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest mb-1">Partner Access Only</div>
          <h2 className="text-5xl font-black text-gray-900 italic tracking-tighter leading-none">Mana<span className="text-green-600">Food</span></h2>
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.4em]">Warangal Dashboard</p>
        </div>

        <form onSubmit={handleAdminLogin} className="space-y-6 animate-slide-up">
          <div className="text-center space-y-1">
            <h3 className="font-black uppercase tracking-widest text-gray-900 text-xs">Partner Login</h3>
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight">Access your restaurant dashboard</p>
          </div>
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-gray-400 ml-1">Username / ID</label>
              <input 
                type="text" placeholder="e.g. 303055" required
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 py-4 font-bold focus:border-black outline-none transition-all placeholder:text-gray-300"
                value={adminUser} onChange={e => setAdminUser(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-gray-400 ml-1">Password</label>
              <input 
                type="password" placeholder="••••••••" required
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 py-4 font-bold focus:border-black outline-none transition-all placeholder:text-gray-300"
                value={adminPass} onChange={e => setAdminPass(e.target.value)}
              />
            </div>
          </div>
          <button 
            disabled={loading}
            className="w-full bg-black text-white py-5 rounded-[25px] font-black uppercase tracking-widest text-[11px] active:scale-[0.97] transition-all shadow-xl disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Launch Dashboard'}
          </button>
          
          <div className="text-center">
            <a href={`https://wa.me/919346499631?text=Hi, I need help with my ManaFood partner login.`} target="_blank" className="text-[9px] font-black uppercase text-gray-300 tracking-widest hover:text-green-600 transition-all">Forgot Credentials? Contact Support</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
