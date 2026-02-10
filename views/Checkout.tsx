
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CartItem, Restaurant, Order, User } from '../types';
import { storage } from '../services/storage';
import { WHATSAPP_NUMBER } from '../constants';
import { getRouteSummary } from '../services/gemini';

interface CheckoutProps {
  cart: CartItem[];
  restaurants: Restaurant[];
  lastOrderId: number;
  currentUser: User | null;
  onOrderPlaced: () => void;
  refreshAppData: () => void;
}

const Checkout: React.FC<CheckoutProps> = ({ cart, restaurants, lastOrderId, currentUser, onOrderPlaced, refreshAppData }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    phone: currentUser?.phone || '',
    address: ''
  });
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const restaurant = restaurants.find(r => r.id === cart[0]?.restaurantId);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Location services not supported.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
        setIsLocating(false);
      },
      (error) => {
        console.error("Location error:", error);
        alert("Please enable GPS to provide your delivery location.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant || !coords) return;
    
    setIsProcessing(true);
    const bookingId = `BK${lastOrderId + 1}`;
    const mapsLink = `https://www.google.com/maps?q=${coords.lat},${coords.lng}`;
    
    // Get AI Route context (optional but helpful for the message)
    const routeInfo = await getRouteSummary(restaurant.address || restaurant.name, formData.address);

    const booking: Order = {
      id: bookingId,
      customerId: currentUser?.id || 'guest',
      customerName: formData.name,
      customerPhone: formData.phone,
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      items: cart,
      subtotal: 0,
      deliveryFee: 0,
      platformFee: 0,
      total: 0,
      address: formData.address,
      locationUrl: mapsLink,
      status: 'Placed',
      paymentStatus: 'Pending',
      paymentMethod: 'UPI',
      createdAt: new Date().toISOString(),
      logistics: {
        roadDistanceKm: 0,
        estimatedTimeMin: 0,
        routeSummary: routeInfo,
        isFeeConfirmed: false
      }
    };

    storage.addOrder(booking);
    refreshAppData();

    // Construct WhatsApp message with specifically requested fields
    const itemString = cart.map(i => `• ${i.name} (x${i.quantity})`).join('%0A');
    const message = `*NEW BOOKING - ${bookingId}*%0A%0A*Name:* ${formData.name}%0A*Phone:* ${formData.phone}%0A*Location:* ${mapsLink}%0A%0A*Items:*%0A${itemString}%0A%0A*Address:* ${formData.address}%0A*Route Info:* ${routeInfo}`;
    
    const whatsappUrl = `https://wa.me/91${WHATSAPP_NUMBER}?text=${message}`;
    onOrderPlaced();
    setIsProcessing(false);
    window.location.href = whatsappUrl;
    navigate('/');
  };

  if (cart.length === 0) return <div className="p-8 text-center uppercase font-black text-gray-400">No items selected</div>;

  return (
    <div className="p-4 space-y-6 pb-32 max-w-md mx-auto">
      <div className="flex items-center gap-2">
        <Link to={`/restaurant/${cart[0].restaurantId}`} className="p-2 -ml-2 text-gray-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"/></svg>
        </Link>
        <h2 className="text-xl font-black uppercase tracking-tight text-gray-900">Complete Booking</h2>
      </div>

      <div className="bg-white p-6 rounded-[35px] border border-gray-100 shadow-sm space-y-4">
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Selected Items</h3>
        <div className="space-y-2">
          {cart.map(item => (
            <div key={item.id} className="flex justify-between items-center text-sm">
              <span className="font-bold text-gray-700">{item.name} <span className="text-gray-400 ml-1">x{item.quantity}</span></span>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleConfirmBooking} className="space-y-6">
        <div className="space-y-6">
          <button 
            type="button" 
            onClick={handleDetectLocation} 
            className={`w-full py-5 rounded-2xl text-[11px] font-black uppercase tracking-widest border transition-all flex items-center justify-center gap-2 ${
              coords ? 'bg-green-50 text-green-700 border-green-200' : 'bg-black text-white border-black shadow-xl'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>
            {isLocating ? 'LOCATING...' : coords ? 'LOCATION DETECTED ✓' : 'TAP TO PINPOINT LOCATION'}
          </button>

          <div className={`space-y-4 transition-all duration-500 ${!coords ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
            <div className="grid grid-cols-2 gap-3">
               <div className="space-y-1">
                 <label className="text-[9px] font-black uppercase text-gray-400 ml-1">Name</label>
                 <input required type="text" placeholder="Your Name" className="w-full bg-gray-100 rounded-2xl px-5 py-4 font-bold text-sm outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
               </div>
               <div className="space-y-1">
                 <label className="text-[9px] font-black uppercase text-gray-400 ml-1">Phone</label>
                 <input required type="tel" maxLength={10} placeholder="Mobile Number" className="w-full bg-gray-100 rounded-2xl px-5 py-4 font-bold text-sm outline-none" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})} />
               </div>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-gray-400 ml-1">Full Address</label>
              <textarea required rows={3} placeholder="House No, Landmark, Area..." className="w-full bg-gray-100 rounded-2xl px-5 py-4 font-bold text-sm outline-none" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
            </div>
          </div>

          <button 
            disabled={!coords || isProcessing}
            className="w-full bg-green-600 text-white py-5 rounded-[25px] font-black uppercase tracking-widest text-[11px] shadow-xl disabled:bg-gray-200 flex items-center justify-center gap-2"
          >
            {isProcessing ? 'BOOKING...' : (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                CONFIRM VIA WHATSAPP
              </>
            )}
          </button>
          
          <p className="text-[9px] text-gray-400 font-bold uppercase text-center px-4 leading-relaxed">
            By confirming, your booking details will be sent to ManaFood admin for immediate processing. No payment required now.
          </p>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
