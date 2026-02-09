
import React, { useState, useMemo, useEffect } from 'react';
import { AppData, Category, MenuItem, Restaurant, Order, User } from '../types';
import { storage } from '../services/storage';
import { MERCHANT_UPI_ID } from '../constants';

interface AdminProps {
  data: AppData;
  onDataChange: () => void;
  currentUser: User;
}

const Admin: React.FC<AdminProps> = ({ data, onDataChange, currentUser }) => {
  const isSuperAdmin = currentUser.role === 'Admin' && currentUser.name.includes('Ganesh');
  const restaurantId = currentUser.restaurantId;
  const restaurant = data.restaurants.find(r => r.id === restaurantId);
  
  const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'finances' | 'partners'>(isSuperAdmin ? 'finances' : 'orders');
  const [filterCategory, setFilterCategory] = useState<Category | 'All'>('All');

  useEffect(() => {
    return storage.subscribe(() => {
      onDataChange();
    });
  }, [onDataChange]);

  const filteredOrders = useMemo(() => {
    if (isSuperAdmin) return data.orders;
    return data.orders.filter(o => o.restaurantId === restaurantId);
  }, [data.orders, isSuperAdmin, restaurantId]);

  const filteredMenu = useMemo(() => {
    if (isSuperAdmin) return data.menuItems;
    const items = data.menuItems.filter(m => m.restaurantId === restaurantId);
    if (filterCategory === 'All') return items;
    return items.filter(i => i.category === filterCategory);
  }, [data.menuItems, isSuperAdmin, restaurantId, filterCategory]);

  const stats = useMemo(() => {
    const totalSales = filteredOrders.reduce((s, o) => s + o.total, 0);
    const prepaidVolume = filteredOrders.filter(o => o.paymentStatus === 'Paid').reduce((s, o) => s + o.total, 0);
    const activeOrdersCount = filteredOrders.filter(o => !['Delivered', 'Cancelled'].includes(o.status)).length;
    const platformRevenue = filteredOrders.reduce((s, o) => s + o.platformFee, 0);
    const partnerPayout = totalSales - platformRevenue;

    return { totalSales, activeOrdersCount, prepaidVolume, platformRevenue, partnerPayout };
  }, [filteredOrders]);

  const handleUpdateStatus = (id: string, status: Order['status']) => {
    storage.updateOrderStatus(id, status);
    onDataChange();
  };

  const handleToggleStock = (itemId: string, currentStatus: boolean) => {
    storage.updateMenuItem(itemId, { inStock: !currentStatus });
    onDataChange();
  };

  return (
    <div className="p-4 space-y-6 pb-24 bg-gray-50 min-h-screen max-w-md mx-auto">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">
            {isSuperAdmin ? 'Platform Control' : 'Restaurant Management'}
          </p>
          <h2 className="text-2xl font-black text-gray-900 tracking-tighter">
            {isSuperAdmin ? 'SUPER ADMIN' : restaurant?.name}
          </h2>
        </div>
        <div className="bg-white px-4 py-2 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-2">
           <div className={`w-2 h-2 rounded-full animate-pulse ${isSuperAdmin ? 'bg-green-500' : 'bg-purple-500'}`}></div>
           <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
             {isSuperAdmin ? 'System Live' : 'Partner Live'}
           </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">
            {isSuperAdmin ? 'Total Platform Sales' : 'Your Sales'}
          </p>
          <p className="text-xl font-black text-gray-900">₹{stats.totalSales.toFixed(0)}</p>
        </div>
        <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">
            {isSuperAdmin ? 'Platform Earnings' : 'Your Payout'}
          </p>
          <p className={`text-xl font-black ${isSuperAdmin ? 'text-green-600' : 'text-purple-600'}`}>
            ₹{(isSuperAdmin ? stats.platformRevenue : stats.partnerPayout).toFixed(0)}
          </p>
        </div>
      </div>

      <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm sticky top-2 z-40 overflow-x-auto no-scrollbar">
        {[
          { id: 'orders', label: 'Orders', icon: '📦' },
          { id: 'menu', label: 'Stock', icon: '🍱' },
          { id: 'finances', label: 'Revenue', icon: '💰' },
          isSuperAdmin && { id: 'partners', label: 'Vendors', icon: '🏪' }
        ].filter(Boolean).map((t: any) => (
          <button 
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === t.id ? 'bg-black text-white shadow-lg' : 'text-gray-400'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'orders' && (
        <div className="space-y-4 animate-slide-up">
          {filteredOrders.length === 0 ? (
            <p className="text-center py-10 text-gray-400 text-xs font-bold uppercase">No orders yet</p>
          ) : (
            filteredOrders.map(order => (
              <div key={order.id} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-black text-lg text-gray-900">#{order.id}</h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">{order.customerName}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <div className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase ${order.paymentStatus === 'Paid' ? 'bg-purple-600 text-white' : 'bg-orange-100 text-orange-600'}`}>
                      {order.paymentStatus === 'Paid' ? 'PhonePe UPI' : 'Cash on Delivery'}
                    </div>
                    <div className="text-[11px] font-black text-gray-900">₹{order.total}</div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-2xl text-[10px] font-bold text-gray-600">
                  {order.items.map(item => `${item.name} x ${item.quantity}`).join(', ')}
                </div>

                {!isSuperAdmin && order.status === 'Placed' && (
                  <button 
                    onClick={() => handleUpdateStatus(order.id, 'Confirmed')}
                    className="w-full bg-green-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-green-100"
                  >
                    Accept Order
                  </button>
                )}
                
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <span>Status: <span className="text-gray-900">{order.status}</span></span>
                  {order.status !== 'Delivered' && order.status !== 'Cancelled' && !isSuperAdmin && (
                    <button 
                      onClick={() => handleUpdateStatus(order.id, 'Delivered')}
                      className="text-green-600 hover:underline"
                    >
                      Mark Delivered
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'menu' && (
        <div className="space-y-4 animate-slide-up">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {['All', ...Array.from(new Set(filteredMenu.map(m => m.category)))].map((cat: any) => (
              <button 
                key={cat} 
                onClick={() => setFilterCategory(cat)}
                className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest whitespace-nowrap border transition-all ${filterCategory === cat ? 'bg-black text-white' : 'bg-white text-gray-400 border-gray-100'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid gap-3">
            {filteredMenu.map(item => (
              <div key={item.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden">
                    <img src={item.image} className={`w-full h-full object-cover ${!item.inStock && 'grayscale opacity-50'}`} />
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-gray-900 uppercase truncate w-32">{item.name}</h5>
                    <p className="text-[10px] font-bold text-gray-400 tracking-tight">₹{item.price}</p>
                  </div>
                </div>
                
                <button 
                  onClick={() => handleToggleStock(item.id, item.inStock)}
                  className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${item.inStock ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}
                >
                  {item.inStock ? 'In Stock' : 'Sold Out'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'finances' && (
        <div className="space-y-4 animate-slide-up">
          <div className="bg-black p-8 rounded-[40px] text-white space-y-8">
            <div className="space-y-1">
               <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                 {isSuperAdmin ? 'Total Platform Fees Collected' : 'Settlement Payout (Pending)'}
               </p>
               <h3 className="text-4xl font-black tracking-tighter text-green-400">
                 ₹{(isSuperAdmin ? stats.platformRevenue : stats.partnerPayout).toFixed(2)}
               </h3>
            </div>
            
            <div className="grid grid-cols-2 gap-8 border-t border-white/10 pt-8">
              <div>
                <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Gross Sales</p>
                <p className="text-lg font-black">₹{stats.totalSales.toFixed(0)}</p>
              </div>
              <div>
                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Orders Count</p>
                <p className="text-lg font-black">{filteredOrders.length}</p>
              </div>
            </div>

            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest pt-4 border-t border-white/10">
              {isSuperAdmin ? `Merchant Account: ${MERCHANT_UPI_ID}` : `Payout method: PhonePe UPI to ${restaurant?.phone}`}
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-3xl border border-gray-100">
             <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Financial Summary</h4>
             <div className="space-y-4 text-xs font-bold text-gray-600">
                <div className="flex justify-between">
                  <span>Gross Sales</span>
                  <span className="text-gray-900">₹{stats.totalSales}</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform Service Fee (5%)</span>
                  <span className="text-red-500">- ₹{stats.platformRevenue}</span>
                </div>
                <div className="h-[1px] bg-gray-100"></div>
                <div className="flex justify-between font-black text-gray-900 text-sm">
                  <span>Net Payout</span>
                  <span className="text-green-600">₹{stats.partnerPayout}</span>
                </div>
             </div>
          </div>
        </div>
      )}

      {activeTab === 'partners' && isSuperAdmin && (
        <div className="space-y-4 animate-slide-up">
          {data.restaurants.map(res => (
            <div key={res.id} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
               <div className="flex items-center gap-3">
                 <img src={res.image} className="w-12 h-12 rounded-xl object-cover" />
                 <div>
                   <h5 className="font-black text-gray-900 uppercase text-xs">{res.name}</h5>
                   <p className="text-[10px] font-bold text-gray-400">{res.openTime} - {res.closeTime}</p>
                 </div>
               </div>
               <div className="text-right">
                 <p className="text-[10px] font-black uppercase text-green-600">Active</p>
                 <p className="text-[9px] font-bold text-gray-400 uppercase">{res.adminUser}</p>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Admin;
