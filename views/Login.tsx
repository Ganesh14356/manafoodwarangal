
import React, { useState, useEffect } from 'react';
import { User, AppData } from '../types';
import { storage } from '../services/storage';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp' | 'admin'>('phone');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');

  useEffect(() => {
    let interval: any;
    if (step === 'otp' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  const handleGoogleLogin = () => {
    setLoading(true);
    // Real OAuth flow would trigger here
    setTimeout(() => {
      const mockUser: User = {
        id: 'g' + Math.random().toString(36).substr(2, 5),
        phone: '',
        name: 'Guest User',
        role: 'Customer'
      };
      onLogin(mockUser);
      setLoading(false);
    }, 1200);
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length !== 10) return alert("Please enter a valid 10-digit mobile number");
    setLoading(true);
    // API call to SMS Gateway would go here
    setTimeout(() => {
      setStep('otp');
      setLoading(false);
      setResendTimer(30);
    }, 1000);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // API call to verify OTP
    setTimeout(() => {
      const mockUser: User = {
        id: 'u' + Math.random().toString(36).substr(2, 5),
        phone: phone,
        name: 'Valued Customer',
        role: 'Customer'
      };
      onLogin(mockUser);
      setLoading(false);
    }, 800);
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const data = storage.getData();
    
    // Super Admin check
    if (adminUser === 'Ganesh143' && adminPass === 'Ganesh123@') {
      onLogin({ id: 'admin_ganesh', name: 'Ganesh (Super Admin)', phone: '', role: 'Admin' });
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
      return;
    }

    alert("Authentication Failed. Please check your partner credentials.");
  };

  return (
    <div className="p-8 min-h-screen flex flex-col justify-center items-center bg-white">
      <div className="w-full max-w-sm space-y-10">
        <div className="text-center space-y-3">
          <div className="inline-block bg-green-500 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest mb-1 shadow-lg shadow-green-100">Official Release</div>
          <h2 className="text-5xl font-black text-gray-900 italic tracking-tighter leading-none">Mana<span className="text-green-600">Food</span></h2>
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.4em]">Warangal Gateway</p>
        </div>

        {step === 'phone' && (
          <div className="space-y-8 animate-slide-up">
            <button 
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full border-2 border-gray-100 py-5 rounded-[25px] flex items-center justify-center gap-4 font-black text-gray-700 hover:bg-gray-50 transition-all active:scale-[0.97] shadow-sm relative overflow-hidden"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5.04c1.65 0 3.14.57 4.31 1.69L19.43 3.6C17.45 1.84 14.88 1 12 1 7.62 1 3.96 3.44 2.15 7l3.6 2.8C6.6 7.4 9.1 5.04 12 5.04z"/>
                <path fill="#4285F4" d="M23.49 12.27c0-.8-.07-1.57-.2-2.31H12v4.38h6.44c-.28 1.46-1.1 2.7-2.34 3.53l3.64 2.83c2.13-1.97 3.36-4.87 3.36-8.13z"/>
                <path fill="#FBBC05" d="M5.75 14.45C5.52 13.73 5.39 12.98 5.39 12s.13-1.73.36-2.45L2.15 6.75c-.8 1.6-1.25 3.4-1.25 5.25s.45 3.65 1.25 5.25l3.6-2.8z"/>
                <path fill="#34A853" d="M12 23c3.15 0 5.8-1.05 7.73-2.84l-3.64-2.83c-1.03.7-2.36 1.12-4.09 1.12-2.9 0-5.4-2.36-6.25-5.55l-3.6 2.8C3.96 20.56 7.62 23 12 23z"/>
              </svg>
              <span className="text-xs uppercase tracking-widest">Continue with Google</span>
            </button>
            
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-gray-100"></div>
              <span className="flex-shrink mx-4 text-gray-300 text-[10px] font-black uppercase tracking-widest">Secure Mobile Login</span>
              <div className="flex-grow border-t border-gray-100"></div>
            </div>

            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-3 tracking-widest">Phone Number</label>
                <div className="flex bg-gray-50 rounded-[25px] border-2 border-gray-100 overflow-hidden focus-within:border-green-500 transition-all p-1">
                  <span className="px-5 py-4 text-gray-400 font-black border-r border-gray-100 tracking-tighter">+91</span>
                  <input 
                    type="tel" maxLength={10} placeholder="Enter 10 Digits"
                    className="flex-1 bg-transparent px-5 py-4 font-black text-xl text-gray-900 focus:outline-none placeholder:text-gray-200"
                    value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
              </div>
              <button 
                disabled={loading || phone.length < 10}
                className="w-full bg-green-600 text-white py-5 rounded-[25px] font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-green-100 active:scale-[0.97] transition-all disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Send Verification Code'}
              </button>
            </form>
            
            <button onClick={() => setStep('admin')} className="w-full text-[10px] font-black uppercase text-gray-300 py-2 hover:text-green-600 transition-colors tracking-widest">Partner Portal Access →</button>
          </div>
        )}

        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-8 animate-slide-up">
            <div className="text-center space-y-2">
               <h3 className="font-black text-gray-900 uppercase text-xs tracking-widest">Enter Code</h3>
               <p className="text-[10px] text-gray-400 font-bold uppercase">Sent to +91 {phone}</p>
            </div>
            <div className="space-y-1">
              <input 
                autoFocus type="text" maxLength={6} placeholder="••••••"
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-[25px] px-6 py-6 font-black text-center text-4xl tracking-[0.5em] focus:outline-none focus:border-green-500 transition-all placeholder:text-gray-200"
                value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
              />
            </div>
            <button className="w-full bg-green-600 text-white py-5 rounded-[25px] font-black uppercase tracking-widest text-[11px] shadow-xl">Verify & Enter App</button>
            <div className="text-center">
               <button type="button" onClick={() => setStep('phone')} className="text-[10px] font-black uppercase text-gray-400 tracking-widest border-b border-gray-100">Change Phone Number</button>
            </div>
          </form>
        )}

        {step === 'admin' && (
          <form onSubmit={handleAdminLogin} className="space-y-6 animate-slide-up">
            <div className="text-center space-y-1">
              <h3 className="font-black uppercase tracking-widest text-gray-900 text-xs">Partner Login</h3>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight">Access your restaurant dashboard</p>
            </div>
            <div className="space-y-3">
              <input 
                type="text" placeholder="Partner ID" required
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 py-4 font-bold focus:border-black outline-none transition-all placeholder:text-gray-300"
                value={adminUser} onChange={e => setAdminUser(e.target.value)}
              />
              <input 
                type="password" placeholder="Dashboard Passcode" required
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 py-4 font-bold focus:border-black outline-none transition-all placeholder:text-gray-300"
                value={adminPass} onChange={e => setAdminPass(e.target.value)}
              />
            </div>
            <button className="w-full bg-black text-white py-5 rounded-[25px] font-black uppercase tracking-widest text-[11px] active:scale-[0.97] transition-all shadow-xl">Launch Dashboard</button>
            <button type="button" onClick={() => setStep('phone')} className="w-full text-[10px] font-black uppercase text-gray-400 tracking-widest">Return to Marketplace</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
