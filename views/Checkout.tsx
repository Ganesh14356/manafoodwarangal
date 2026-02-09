
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CartItem, Restaurant, Order, User } from '../types';
import { storage } from '../services/storage';
import { WHATSAPP_NUMBER, DELIVERY_FEE_BASE, PLATFORM_FEE_PERCENT, MERCHANT_UPI_ID, MERCHANT_NAME } from '../constants';

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
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'COD' | 'PHONEPE'>('PHONEPE');
  const [upiRefId, setUpiRefId] = useState('');
  const [step, setStep] = useState<'details' | 'payment'>('details');
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    phone: currentUser?.phone || '',
    address: ''
  });
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const platformFee = Math.round(subtotal * PLATFORM_FEE_PERCENT);
  const deliveryFee = DELIVERY_FEE_BASE;
  const total = subtotal + platformFee + deliveryFee;
  
  const restaurant = restaurants.find(r => r.id === cart[0]?.restaurantId);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Location services not supported on this device.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
        setIsLocating(false);
      },
      () => {
        alert("Please enable GPS permissions to share your address.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handlePhonePeRedirect = () => {
    const orderId = `MF${lastOrderId + 1}`;
    const upiUrl = `upi://pay?pa=${MERCHANT_UPI_ID}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=${total}&cu=INR&tn=${encodeURIComponent('Order ' + orderId)}`;
    
    // Check if on mobile to trigger app intent
    window.location.href = upiUrl;
    setStep('payment');
  };

  const processOrder = (orderId: string, mapsLink: string, payStatus: 'Pending' | 'Paid') => {
    if (!restaurant) return;

    const order: Order = {
      id: orderId,
      customerId: currentUser?.id || 'guest',
      customerName: formData.name,
      customerPhone: formData.phone,
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      items: cart,
      subtotal: subtotal,
      deliveryFee: deliveryFee,
      platformFee: platformFee,
      total: total,
      address: formData.address,
      locationUrl: mapsLink,
      status: 'Placed',
      paymentStatus: payStatus,
      paymentMethod: paymentMethod === 'PHONEPE' ? 'UPI' : (paymentMethod as any),
      createdAt: new Date().toISOString()
    };

    storage.addOrder(order);
    refreshAppData();

    const itemString = cart.map(i => `${i.name} (${i.quantity} x ₹${i.price})`).join('%0A');
    let paymentInfo = `💵 CASH ON DELIVERY`;
    if (paymentMethod === 'PHONEPE') paymentInfo = `✅ PHONEPE UPI VERIFIED (REF: ${upiRefId})`;
    
    const message = `*NEW ORDER - ${orderId}*%0A%0A*Restaurant:* ${restaurant.name}%0A*Items:*%0A${itemString}%0A%0A*Total Amount:* ₹${total}%0A%0A*Payment:* ${paymentInfo}%0A%0A*Customer Details:*%0AName: ${formData.name}%0APhone: ${formData.phone}%0AAddress: ${formData.address}%0A%0A*Live Location:*%0A${mapsLink}`;
    
    const whatsappUrl = `https://wa.me/91${WHATSAPP_NUMBER}?text=${message}`;
    
    onOrderPlaced();
    window.location.href = whatsappUrl;
    navigate('/');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant) return;

    const orderId = `MF${lastOrderId + 1}`;
    const mapsLink = coords ? `https://www.google.com/maps?q=${coords.lat},${coords.lng}` : 'Not provided';

    if (paymentMethod === 'PHONEPE') {
      if (step === 'details') {
        handlePhonePeRedirect();
        return;
      }
      if (!upiRefId) return alert("Please enter the PhonePe Transaction ID to verify your payment.");
      processOrder(orderId, mapsLink, 'Paid');
    } else {
      processOrder(orderId, mapsLink, 'Pending');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-gray-400 font-black uppercase text-xs tracking-widest">Cart is empty</p>
        <Link to="/" className="inline-block px-8 py-4 bg-green-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-green-100">Explore Restaurants</Link>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 pb-32 max-w-md mx-auto">
      <div className="flex items-center gap-2">
        <Link to={`/restaurant/${cart[0].restaurantId}`} className="p-2 -ml-2 text-gray-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"/></svg>
        </Link>
        <h2 className="text-xl font-black uppercase tracking-tight text-gray-900">Confirm Order</h2>
      </div>

      <div className="bg-white p-6 rounded-[35px] border border-gray-100 shadow-sm space-y-4">
         <div className="flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
            <span>Bill Details</span>
            <span>{cart.length} Items</span>
         </div>
         <div className="space-y-2">
           <div className="flex justify-between text-sm font-bold text-gray-600">
             <span>Subtotal</span>
             <span>₹{subtotal}</span>
           </div>
           <div className="flex justify-between text-sm font-bold text-gray-600">
             <span>Delivery & Service</span>
             <span>₹{deliveryFee + platformFee}</span>
           </div>
         </div>
        <div className="h-[1px] bg-gray-50"></div>
        <div className="flex items-center justify-between text-xl font-black text-gray-900">
          <span className="uppercase tracking-tighter">To Pay</span>
          <span className="text-green-600">₹{total}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {step === 'details' ? (
          <div className="space-y-6 animate-slide-up">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                 <div className="space-y-1">
                   <label className="text-[10px] font-black uppercase text-gray-400 ml-1 tracking-widest">Name</label>
                   <input required type="text" placeholder="Your Name"
                     className="w-full bg-gray-100 border-0 rounded-2xl px-5 py-4 font-bold text-sm outline-none focus:ring-2 focus:ring-green-500/20"
                     value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                   />
                 </div>
                 <div className="space-y-1">
                   <label className="text-[10px] font-black uppercase text-gray-400 ml-1 tracking-widest">Phone</label>
                   <input required type="tel" maxLength={10} placeholder="10 Digits"
                     className="w-full bg-gray-100 border-0 rounded-2xl px-5 py-4 font-bold text-sm outline-none focus:ring-2 focus:ring-green-500/20"
                     value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})}
                   />
                 </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-1 tracking-widest">Full Address</label>
                <textarea required rows={3} placeholder="House No, Landmark, Area..."
                  className="w-full bg-gray-100 border-0 rounded-2xl px-5 py-4 font-bold text-sm outline-none focus:ring-2 focus:ring-green-500/20"
                  value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}
                />
              </div>
              <button type="button" onClick={handleDetectLocation} className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${coords ? 'bg-green-50 text-green-700 border-green-200' : 'bg-white border-gray-100 text-gray-400'}`}>
                {isLocating ? 'Locating...' : coords ? 'GPS Location Locked ✓' : 'Auto-Detect My Location'}
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-1 tracking-widest">Payment Method</label>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setPaymentMethod('PHONEPE')}
                  className={`p-4 rounded-3xl border-2 transition-all flex flex-col items-center gap-2 ${paymentMethod === 'PHONEPE' ? 'border-purple-600 bg-purple-50 shadow-md' : 'border-gray-100 opacity-60'}`}
                >
                  <img src="https://static.phonepe.com/web/hermes/public/images/logo_rebrand.svg" className="h-4" />
                  <span className="text-[9px] font-black uppercase">Official UPI</span>
                </button>
                <button type="button" onClick={() => setPaymentMethod('COD')}
                  className={`p-4 rounded-3xl border-2 transition-all flex flex-col items-center gap-2 ${paymentMethod === 'COD' ? 'border-gray-900 bg-gray-50 shadow-md' : 'border-gray-100 opacity-60'}`}
                >
                  <span className="text-[10px] font-black uppercase">Cash (COD)</span>
                  <span className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">Standard</span>
                </button>
              </div>
            </div>

            <button type="submit" className={`w-full text-white py-5 rounded-[25px] font-black uppercase tracking-widest text-[11px] shadow-xl active:scale-[0.98] transition-all ${paymentMethod === 'PHONEPE' ? 'bg-purple-600' : 'bg-green-600'}`}>
              {paymentMethod === 'PHONEPE' ? 'Pay Securely via PhonePe' : 'Confirm Order via COD'}
            </button>
          </div>
        ) : (
          <div className="space-y-6 animate-slide-up">
            <div className="bg-purple-50 p-6 rounded-[35px] border border-purple-100 text-center space-y-5">
               <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-purple-100">
                    <img src="https://static.phonepe.com/web/hermes/public/images/logo_rebrand.svg" className="w-8" />
                  </div>
                  <h3 className="font-black text-purple-900 uppercase text-xs">Verify Transaction</h3>
               </div>
              <p className="text-[11px] text-purple-800 font-bold leading-relaxed px-4">
                Please enter the <span className="font-black underline">Transaction ID</span> from your PhonePe app to confirm your payment with the merchant.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-1 tracking-widest">Transaction ID (PhonePe)</label>
              <input 
                required type="text" placeholder="T2XXXXXXXXXXXX"
                className="w-full bg-white border-2 border-purple-100 rounded-2xl px-5 py-5 font-black text-center text-lg uppercase focus:border-purple-600 outline-none transition-all placeholder:text-gray-200"
                value={upiRefId} onChange={e => setUpiRefId(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep('details')} className="flex-1 bg-gray-50 py-4 rounded-2xl text-[10px] font-black uppercase text-gray-400">Cancel</button>
              <button type="submit" className="flex-[2] bg-purple-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-purple-100">Verify Payment</button>
            </div>
            
            <p className="text-center text-[9px] text-gray-300 font-bold uppercase tracking-[0.2em]">Merchant: {MERCHANT_NAME}</p>
          </div>
        )}
      </form>
    </div>
  );
};

export default Checkout;
