
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Order } from '../types';

interface TrackingProps {
  orders: Order[];
}

const Tracking: React.FC<TrackingProps> = ({ orders }) => {
  const { id } = useParams();
  const order = orders.find(o => o.id === id);

  if (!order) return <div className="p-8 text-center font-bold">Order not found.</div>;

  const steps = ['Placed', 'Confirmed', 'Rider_Assigned', 'Delivered'];
  const currentIndex = steps.indexOf(order.status);

  return (
    <div className="p-4 space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <Link to="/" className="text-green-600 font-black text-xs uppercase tracking-widest">← Back to Menu</Link>
        <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100">{order.paymentStatus}</span>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl space-y-6">
        <div>
          <div className="flex justify-between items-start">
            <h2 className="text-3xl font-black tracking-tighter text-gray-900">#{order.id}</h2>
            <div className="bg-gray-900 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase">LIVE</div>
          </div>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">{order.restaurantName}</p>
        </div>

        <div className="relative pt-4 pb-8">
          <div className="absolute left-[15px] top-6 bottom-12 w-1 bg-gray-100 rounded-full overflow-hidden">
             <div className="bg-green-500 w-full transition-all duration-1000" style={{ height: `${(currentIndex / (steps.length - 1)) * 100}%` }}></div>
          </div>
          <div className="space-y-12 relative">
            {steps.map((step, idx) => {
              const isActive = idx <= currentIndex;
              const isFuture = idx > currentIndex;
              return (
                <div key={step} className="flex items-start gap-4">
                  <div className={`w-8 h-8 rounded-full border-4 flex items-center justify-center relative z-10 transition-all duration-500 ${
                    isActive ? 'bg-green-600 border-green-100 text-white scale-110 shadow-lg shadow-green-100' : 'bg-white border-gray-100 text-gray-300'
                  }`}>
                    {isActive ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"/></svg>
                    ) : (
                      <div className="w-1.5 h-1.5 bg-gray-200 rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1 pt-1">
                    <p className={`text-xs font-black uppercase tracking-widest ${isActive ? 'text-gray-900' : 'text-gray-300'}`}>
                      {step.replace('_', ' ')}
                    </p>
                    {idx === currentIndex && order.status !== 'Delivered' && (
                      <p className="text-[10px] text-green-600 font-bold mt-1 animate-pulse italic">Update: Just now</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 space-y-4">
        <div>
          <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2">Delivery Address</h4>
          <p className="text-sm font-bold text-gray-800 leading-snug">{order.address}</p>
        </div>
        <a 
          href={order.locationUrl} 
          target="_blank" 
          rel="noreferrer" 
          className="flex items-center justify-center gap-2 w-full bg-white py-3 rounded-2xl border border-gray-200 text-green-600 text-[10px] font-black uppercase tracking-widest hover:bg-green-50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          Open Google Maps
        </a>
      </div>
    </div>
  );
};

export default Tracking;
