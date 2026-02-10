
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Order } from '../types';

interface TrackingProps {
  orders: Order[];
}

const Tracking: React.FC<TrackingProps> = ({ orders }) => {
  const { id } = useParams();
  const order = orders.find(o => o.id === id);

  if (!order) return <div className="p-8 text-center font-bold">Booking not found.</div>;

  const steps = ['Placed', 'Confirmed', 'Preparing', 'Delivered'];
  const currentIndex = steps.indexOf(order.status === 'Cancelled' ? 'Cancelled' : order.status);

  return (
    <div className="p-4 space-y-6 animate-slide-up pb-24">
      <div className="flex items-center justify-between">
        <Link to="/" className="text-green-600 font-black text-xs uppercase tracking-widest flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"/></svg>
          Back Home
        </Link>
      </div>

      <div className="bg-white p-6 rounded-[40px] border border-gray-100 shadow-xl space-y-8">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-gray-900 leading-none mb-1">#{order.id}</h2>
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">{order.restaurantName} Booking</p>
        </div>

        <div className="flex gap-1.5 h-1.5">
          {steps.map((_, idx) => (
            <div 
              key={idx} 
              className={`flex-1 rounded-full transition-all duration-500 ${idx <= currentIndex ? (order.status === 'Cancelled' ? 'bg-red-500' : 'bg-green-500') : 'bg-gray-100'}`}
            />
          ))}
        </div>

        <div className="space-y-6">
          {steps.map((step, idx) => {
            const isActive = idx <= currentIndex;
            return (
              <div key={step} className="flex items-center gap-4">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isActive ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-300'}`}>
                  {isActive && <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"/></svg>}
                </div>
                <p className={`text-[11px] font-black uppercase tracking-widest ${isActive ? 'text-gray-900' : 'text-gray-300'}`}>{step}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-gray-900 p-8 rounded-[40px] text-white space-y-4">
        <div className="space-y-1">
          <h4 className="text-[9px] font-black uppercase text-gray-500 tracking-[0.3em]">Destination</h4>
          <p className="text-sm font-bold text-gray-100">{order.address}</p>
        </div>
        <a 
          href={order.locationUrl} 
          target="_blank" 
          rel="noreferrer" 
          className="flex items-center justify-between w-full bg-white/10 p-4 rounded-2xl border border-white/5"
        >
          <span className="text-[10px] font-black uppercase tracking-widest">Pinpoint Location</span>
          <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>
        </a>
      </div>
    </div>
  );
};

export default Tracking;
