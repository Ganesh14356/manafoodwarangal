
import React from 'react';
import { Link } from 'react-router-dom';
import { Order } from '../types';

interface ActiveOrderTrackerProps {
  orders: Order[];
}

const ActiveOrderTracker: React.FC<ActiveOrderTrackerProps> = ({ orders }) => {
  const activeOrder = orders.find(o => o.status !== 'Delivered' && o.status !== 'Cancelled');
  if (!activeOrder) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-[60] max-w-md mx-auto animate-slide-up">
      <Link 
        to={`/tracking/${activeOrder.id}`}
        className="block bg-gray-900 text-white p-4 rounded-[28px] shadow-2xl border border-white/10 overflow-hidden relative"
      >
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-2xl flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-green-400 mb-0.5">Active Booking</p>
              <h4 className="text-xs font-black uppercase tracking-tight truncate w-40">
                {activeOrder.status} • {activeOrder.restaurantName}
              </h4>
            </div>
          </div>
          <div className="bg-white/10 px-3 py-2 rounded-xl border border-white/5">
            <span className="text-[9px] font-black uppercase tracking-widest">Track</span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ActiveOrderTracker;
