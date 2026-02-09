
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CartItem, Restaurant, Order } from '../types';
import { storage } from '../services/storage';
import { WHATSAPP_NUMBER } from '../constants';

interface CheckoutProps {
  cart: CartItem[];
  restaurants: Restaurant[];
  lastOrderId: number;
  onOrderPlaced: () => void;
  refreshAppData: () => void;
}

const Checkout: React.FC<CheckoutProps> = ({ cart, restaurants, lastOrderId, onOrderPlaced, refreshAppData }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: ''
  });
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const restaurant = restaurants.find(r => r.id === cart[0]?.restaurantId);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
        setIsLocating(false);
      },
      () => {
        alert("Unable to retrieve your location");
        setIsLocating(false);
      }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant) return;
    
    const orderId = `MF${lastOrderId + 1}`;
    const mapsLink = coords ? `https://www.google.com/maps?q=${coords.lat},${coords.lng}` : 'Not provided';

    const order: Order = {
      id: orderId,
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      items: cart,
      total: cartTotal,
      customerName: formData.name,
      customerPhone: formData.phone,
      address: formData.address,
      locationUrl: mapsLink,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    storage.addOrder(order);
    refreshAppData();

    const itemString = cart.map(i => `${i.name} (${i.quantity} x ₹${i.price})`).join('%0A');
    const message = `*NEW ORDER - ${orderId}*%0A%0A*Restaurant:* ${restaurant.name}%0A*Items:*%0A${itemString}%0A%0A*Total Amount:* ₹${cartTotal}%0A%0A*Customer Details:*%0AName: ${formData.name}%0APhone: ${formData.phone}%0AAddress: ${formData.address}%0A%0A*Live Location:*%0A${mapsLink}`;
    
    const whatsappUrl = `https://wa.me/91${WHATSAPP_NUMBER}?text=${message}`;
    
    window.location.href = whatsappUrl;
    onOrderPlaced();
    navigate('/');
  };

  if (cart.length === 0) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-gray-500 font-bold">Your cart is empty.</p>
        <Link to="/" className="inline-block px-8 py-4 bg-green-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-green-100">Browse Menu</Link>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center gap-2">
        <Link to={`/restaurant/${cart[0].restaurantId}`} className="p-2 -ml-2 text-gray-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"/></svg>
        </Link>
        <h2 className="text-xl font-black uppercase tracking-tight">Checkout</h2>
      </div>

      <div className="bg-green-50 p-5 rounded-3xl border border-green-100 flex items-center justify-between">
        <div className="text-sm">
          <p className="text-green-800 font-black uppercase tracking-tight">{restaurant?.name}</p>
          <p className="text-green-600 font-bold text-xs uppercase tracking-widest">{cart.length} items selected</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-green-600 uppercase font-black tracking-widest mb-1">Due Amount</p>
          <p className="text-2xl font-black text-green-800 tracking-tighter">₹{cartTotal}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase mb-2 ml-1 tracking-widest">Full Name</label>
            <input 
              required
              type="text" 
              placeholder="Enter your name"
              className="w-full border border-gray-100 bg-gray-50 rounded-2xl px-5 py-4 font-bold focus:outline-none focus:ring-4 focus:ring-green-500/10 transition-all"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase mb-2 ml-1 tracking-widest">Phone Number</label>
            <input 
              required
              type="tel" 
              placeholder="10 digit number"
              className="w-full border border-gray-100 bg-gray-50 rounded-2xl px-5 py-4 font-bold focus:outline-none focus:ring-4 focus:ring-green-500/10 transition-all"
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase mb-2 ml-1 tracking-widest">Full Address</label>
            <textarea 
              required
              rows={3}
              placeholder="House no, Area, Landmark..."
              className="w-full border border-gray-100 bg-gray-50 rounded-2xl px-5 py-4 font-bold focus:outline-none focus:ring-4 focus:ring-green-500/10 transition-all"
              value={formData.address}
              onChange={e => setFormData({...formData, address: e.target.value})}
            />
          </div>
          <div>
            <button 
              type="button"
              onClick={handleDetectLocation}
              disabled={isLocating}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border shadow-sm ${
                coords 
                  ? 'bg-green-50 text-green-700 border-green-200' 
                  : 'bg-white text-gray-600 border-gray-200 hover:border-green-300'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              {isLocating ? 'Detecting...' : coords ? 'Location Ready ✓' : 'Add GPS Location'}
            </button>
          </div>
        </div>

        <button 
          type="submit"
          className="w-full bg-green-600 text-white py-5 rounded-3xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-green-200 flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
        >
          Confirm via WhatsApp
        </button>
      </form>
    </div>
  );
};

export default Checkout;
