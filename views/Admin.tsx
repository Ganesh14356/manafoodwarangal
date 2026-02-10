
import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AppData, Restaurant, Order, User, MenuItem, Category } from '../types';
import { storage } from '../services/storage';

interface AdminProps {
  data: AppData;
  onDataChange: () => void;
  currentUser: User;
}

const Admin: React.FC<AdminProps> = ({ data, onDataChange, currentUser }) => {
  const isSuperAdmin = currentUser.role === 'Admin' && currentUser.name.includes('Ganesh');
  const restaurantId = currentUser.restaurantId;
  const restaurant = data.restaurants.find(r => r.id === restaurantId);
  
  const [activeTab, setActiveTab] = useState<'bookings' | 'menu' | 'partners'>('bookings');
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editingPartner, setEditingPartner] = useState<Restaurant | null>(null);
  
  const [editTimes, setEditTimes] = useState({ 
    openTime: restaurant?.openTime || '10:00', 
    closeTime: restaurant?.closeTime || '22:00' 
  });

  const [menuForm, setMenuForm] = useState({
    name: '',
    price: '',
    category: Category.FRIED_RICE,
    image: '',
    inStock: true
  });

  const [partnerForm, setPartnerForm] = useState({
    id: '',
    name: '',
    image: '',
    adminUser: '',
    adminPass: '',
    phone: '',
    address: '',
    openTime: '10:00',
    closeTime: '22:00'
  });

  useEffect(() => {
    return storage.subscribe(() => {
      onDataChange();
    });
  }, [onDataChange]);

  const liveStatus = useMemo(() => {
    if (!restaurant) return null;
    if (!restaurant.isOpen) return { label: 'OFFLINE', reason: 'Manually hidden', color: 'text-red-500', bg: 'bg-red-50' };
    
    const now = new Date();
    const currentM = now.getHours() * 60 + now.getMinutes();
    const [oH, oM] = restaurant.openTime.split(':').map(Number);
    const [cH, cM] = restaurant.closeTime.split(':').map(Number);
    const openM = oH * 60 + oM;
    const closeM = cH * 60 + cM;

    let open = false;
    if (closeM >= openM) open = currentM >= openM && currentM <= closeM;
    else open = currentM >= openM || currentM <= closeM;

    if (open) return { label: 'LIVE', reason: 'Taking bookings now', color: 'text-green-600', bg: 'bg-green-50' };
    return { label: 'CLOSED', reason: `Business hours: ${restaurant.openTime}-${restaurant.closeTime}`, color: 'text-gray-500', bg: 'bg-gray-100' };
  }, [restaurant]);

  const filteredOrders = useMemo(() => {
    if (isSuperAdmin) return data.orders;
    return data.orders.filter(o => o.restaurantId === restaurantId);
  }, [data.orders, isSuperAdmin, restaurantId]);

  const displayedMenuItems = useMemo(() => {
    const targetId = isSuperAdmin ? selectedPartnerId : restaurantId;
    if (!targetId) return [];
    return data.menuItems.filter(item => item.restaurantId === targetId);
  }, [data.menuItems, isSuperAdmin, selectedPartnerId, restaurantId]);

  const handleUpdateStatus = (id: string, status: Order['status']) => {
    storage.updateOrderStatus(id, status);
    onDataChange();
  };

  const toggleManualStatus = (id?: string) => {
    const targetId = id || restaurantId;
    if (!targetId) return;
    const targetRes = data.restaurants.find(r => r.id === targetId);
    storage.updateRestaurantStatus(targetId, { isOpen: !targetRes?.isOpen });
    onDataChange();
  };

  const handleSaveMenuItem = (e: React.FormEvent) => {
    e.preventDefault();
    const targetId = isSuperAdmin ? selectedPartnerId : restaurantId;
    if (!targetId) return;

    const itemData = {
      ...menuForm,
      price: Number(menuForm.price),
      restaurantId: targetId,
    };

    if (editingItem) {
      storage.updateMenuItem(editingItem.id, itemData);
    } else {
      storage.addMenuItem({
        ...itemData,
        id: `m${Date.now()}`,
        inStock: true
      } as MenuItem);
    }

    setShowMenuModal(false);
    setEditingItem(null);
    setMenuForm({ name: '', price: '', category: Category.FRIED_RICE, image: '', inStock: true });
    onDataChange();
  };

  const handleSavePartner = (e: React.FormEvent) => {
    e.preventDefault();
    const pData: Restaurant = {
      ...partnerForm,
      id: partnerForm.id || `res_${Date.now()}`,
      isOpen: true,
      location: { lat: 18.0116, lng: 79.5805 }
    };

    if (editingPartner) {
        storage.updateRestaurantStatus(editingPartner.id, pData);
    } else {
        storage.addRestaurant(pData);
    }

    setShowPartnerModal(false);
    setEditingPartner(null);
    setPartnerForm({ id: '', name: '', image: '', adminUser: '', adminPass: '', phone: '', address: '', openTime: '10:00', closeTime: '22:00' });
    onDataChange();
  };

  const handleEditPartner = (p: Restaurant) => {
    setEditingPartner(p);
    setPartnerForm({
        id: p.id,
        name: p.name,
        image: p.image,
        adminUser: p.adminUser,
        adminPass: p.adminPass,
        phone: p.phone,
        address: p.address || '',
        openTime: p.openTime,
        closeTime: p.closeTime
    });
    setShowPartnerModal(true);
  };

  const handleDeletePartner = (id: string) => {
    if (confirm('Delete this restaurant and all its items? This cannot be undone.')) {
        storage.deleteRestaurant(id);
        onDataChange();
    }
  };

  const managePartnerMenu = (id: string) => {
    setSelectedPartnerId(id);
    setActiveTab('menu');
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setMenuForm({
      name: item.name,
      price: item.price.toString(),
      category: item.category,
      image: item.image,
      inStock: item.inStock
    });
    setShowMenuModal(true);
  };

  const handleDeleteItem = (id: string) => {
    if (confirm('Are you sure you want to remove this item?')) {
      storage.deleteMenuItem(id);
      onDataChange();
    }
  };

  const toggleStock = (id: string, current: boolean) => {
    storage.updateMenuItem(id, { inStock: !current });
    onDataChange();
  };

  return (
    <div className="p-4 space-y-6 pb-24 bg-gray-50 min-h-screen max-w-md mx-auto relative">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <Link to="/" className="text-[10px] font-black text-gray-400 uppercase tracking-widest">← Back to App</Link>
          <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">
            {isSuperAdmin ? 'Master Control' : 'Partner Dashboard'}
          </p>
          <h2 className="text-2xl font-black text-gray-900 tracking-tighter">
            {isSuperAdmin ? 'MANAFOOD HQ' : restaurant?.name}
          </h2>
        </div>
        {!isSuperAdmin && (
          <button onClick={() => setShowSettingsModal(true)} className="p-3 bg-white rounded-2xl border border-gray-100 shadow-sm active:scale-95 transition-all">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>
          </button>
        )}
      </div>

      {!isSuperAdmin && restaurant && liveStatus && (
        <div className={`p-5 rounded-[35px] border border-gray-100 shadow-sm ${liveStatus.bg} flex justify-between items-center`}>
           <div>
              <p className={`text-[10px] font-black uppercase tracking-widest ${liveStatus.color}`}>{liveStatus.label}</p>
              <p className="text-[9px] font-bold text-gray-500 uppercase">{liveStatus.reason}</p>
           </div>
           <button 
             onClick={() => toggleManualStatus()}
             className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
               restaurant.isOpen ? 'bg-red-100 text-red-600' : 'bg-green-600 text-white'
             }`}
           >
             {restaurant.isOpen ? 'Go Offline' : 'Go Online'}
           </button>
        </div>
      )}

      <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm sticky top-2 z-40">
        {['bookings', 'partners', 'menu'].filter(t => isSuperAdmin || t !== 'partners').map((t: any) => (
          <button key={t} onClick={() => setActiveTab(t as any)} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === t ? 'bg-black text-white shadow-lg' : 'text-gray-400'}`}>
            {t}
          </button>
        ))}
      </div>

      {activeTab === 'bookings' && (
        <div className="space-y-4 animate-slide-up">
          {filteredOrders.length === 0 ? (
            <p className="text-center py-20 text-[10px] font-black text-gray-300 uppercase tracking-widest">No active bookings</p>
          ) : (
            filteredOrders.map(order => (
              <div key={order.id} className="bg-white p-5 rounded-[35px] border border-gray-100 shadow-sm space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-black text-xl tracking-tighter">#{order.id}</h4>
                    <p className="text-[10px] text-gray-400 font-black uppercase">{order.customerName} • {order.customerPhone}</p>
                    {isSuperAdmin && <p className="text-[8px] font-bold text-green-600 uppercase">{order.restaurantName}</p>}
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black text-green-600">₹{order.total}</div>
                    <div className={`text-[8px] font-black uppercase px-2 py-1 rounded bg-blue-50 text-blue-600`}>
                      {order.status}
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-2">
                   <div className="flex justify-between items-center text-[9px] font-black uppercase text-gray-400">
                     <span>Items</span>
                     <a href={order.locationUrl} target="_blank" className="text-blue-500 font-black">Open GPS</a>
                   </div>
                   <div className="text-[10px] font-bold text-gray-600">
                     {order.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}
                   </div>
                </div>
                <div className="flex gap-2">
                  {order.status === 'Placed' && (
                    <button onClick={() => handleUpdateStatus(order.id, 'Confirmed')} className="flex-1 bg-green-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg">Confirm</button>
                  )}
                  {order.status !== 'Cancelled' && order.status !== 'Delivered' && (
                    <button onClick={() => handleUpdateStatus(order.id, 'Cancelled')} className="bg-red-50 text-red-500 py-4 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest">Reject</button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'menu' && (
        <div className="space-y-4 animate-slide-up">
          {isSuperAdmin && (
            <div className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between">
               <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                 Managing: <span className="text-black">{data.restaurants.find(r => r.id === selectedPartnerId)?.name || 'Select a Partner'}</span>
               </p>
               <button onClick={() => setActiveTab('partners')} className="text-[10px] font-black uppercase text-blue-500">Change Partner</button>
            </div>
          )}

          {(isSuperAdmin ? selectedPartnerId : true) && (
            <button 
              onClick={() => { setEditingItem(null); setMenuForm({ name: '', price: '', category: Category.FRIED_RICE, image: '', inStock: true }); setShowMenuModal(true); }}
              className="w-full bg-black text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"/></svg>
              Add New Item
            </button>
          )}
          
          <div className="grid gap-3">
            {displayedMenuItems.length === 0 ? (
                <p className="text-center py-20 text-[10px] font-black text-gray-300 uppercase">No menu items found</p>
            ) : (
                displayedMenuItems.map(item => (
                    <div key={item.id} className="bg-white p-3 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <img src={item.image} className={`w-14 h-14 rounded-xl object-cover ${!item.inStock && 'grayscale opacity-50'}`} />
                        <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 text-sm truncate uppercase">{item.name}</h4>
                        <p className="text-[10px] font-black text-green-600">₹{item.price}</p>
                        </div>
                        <div className="flex items-center gap-2">
                        <button onClick={() => toggleStock(item.id, item.inStock)} title="Toggle Stock" className={`p-2 rounded-xl ${item.inStock ? 'text-green-600 bg-green-50' : 'text-gray-400 bg-gray-100'}`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/></svg>
                        </button>
                        <button onClick={() => handleEditItem(item)} className="p-2 text-blue-600 bg-blue-50 rounded-xl">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                        </button>
                        <button onClick={() => handleDeleteItem(item.id)} className="p-2 text-red-500 bg-red-50 rounded-xl">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                        </div>
                    </div>
                ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'partners' && isSuperAdmin && (
        <div className="space-y-4 animate-slide-up">
           <button 
             onClick={() => { setEditingPartner(null); setPartnerForm({ id: '', name: '', image: '', adminUser: '', adminPass: '', phone: '', address: '', openTime: '10:00', closeTime: '22:00' }); setShowPartnerModal(true); }}
             className="w-full bg-green-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2"
           >
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"/></svg>
             Add New Partner
           </button>

           <div className="grid gap-4">
             {data.restaurants.map(p => (
               <div key={p.id} className="bg-white p-5 rounded-[35px] border border-gray-100 shadow-sm space-y-4">
                  <div className="flex items-center gap-4">
                    <img src={p.image} className="w-16 h-16 rounded-2xl object-cover" />
                    <div className="flex-1">
                        <h4 className="font-black text-gray-900 uppercase tracking-tight">{p.name}</h4>
                        <p className="text-[9px] font-bold text-gray-400">{p.phone}</p>
                    </div>
                    <div className="flex gap-1">
                        <button onClick={() => handleEditPartner(p)} title="Edit Partner" className="p-2 bg-gray-50 text-gray-400 rounded-xl"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg></button>
                        <button onClick={() => handleDeletePartner(p.id)} title="Delete Partner" className="p-2 bg-red-50 text-red-400 rounded-xl"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
                    </div>
                  </div>

                  <div className="bg-gray-900 p-4 rounded-3xl space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-[8px] font-black uppercase text-gray-500 tracking-widest">Sub-Admin Access</span>
                        <button 
                            onClick={() => toggleManualStatus(p.id)}
                            className={`text-[8px] font-black uppercase px-2 py-1 rounded transition-colors ${p.isOpen ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}
                        >
                            {p.isOpen ? 'LIVE • TAP TO STOP' : 'OFFLINE • TAP TO GO LIVE'}
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 p-3 rounded-2xl">
                            <p className="text-[7px] font-black text-gray-500 uppercase mb-0.5">Partner ID</p>
                            <p className="text-[11px] font-mono font-bold text-white tracking-wider select-all">{p.adminUser}</p>
                        </div>
                        <div className="bg-white/5 p-3 rounded-2xl">
                            <p className="text-[7px] font-black text-gray-500 uppercase mb-0.5">Password</p>
                            <p className="text-[11px] font-mono font-bold text-white tracking-wider select-all">{p.adminPass}</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => managePartnerMenu(p.id)}
                        className="w-full bg-white text-black py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest"
                    >
                        Manage Items & Menu
                    </button>
                  </div>
               </div>
             ))}
           </div>
        </div>
      )}

      {/* Partner Modal */}
      {showPartnerModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-[40px] p-8 space-y-6 animate-slide-up max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">{editingPartner ? 'Update Partner' : 'New Partner'}</h3>
            <form onSubmit={handleSavePartner} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-gray-400 ml-1">Restaurant Name</label>
                <input required className="w-full bg-gray-50 p-4 rounded-2xl font-bold text-sm outline-none" placeholder="e.g. Baarista" value={partnerForm.name} onChange={e => setPartnerForm({...partnerForm, name: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-gray-400 ml-1">Image URL</label>
                <input required className="w-full bg-gray-50 p-4 rounded-2xl font-bold text-sm outline-none" placeholder="https://..." value={partnerForm.image} onChange={e => setPartnerForm({...partnerForm, image: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-gray-400 ml-1">Admin Username</label>
                  <input required className="w-full bg-gray-50 p-4 rounded-2xl font-bold text-sm outline-none" placeholder="User ID" value={partnerForm.adminUser} onChange={e => setPartnerForm({...partnerForm, adminUser: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-gray-400 ml-1">Admin Password</label>
                  <input required className="w-full bg-gray-50 p-4 rounded-2xl font-bold text-sm outline-none" placeholder="Pass123" value={partnerForm.adminPass} onChange={e => setPartnerForm({...partnerForm, adminPass: e.target.value})} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-gray-400 ml-1">Phone</label>
                <input required className="w-full bg-gray-50 p-4 rounded-2xl font-bold text-sm outline-none" placeholder="9876543210" value={partnerForm.phone} onChange={e => setPartnerForm({...partnerForm, phone: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-gray-400 ml-1">Full Address</label>
                <textarea rows={2} className="w-full bg-gray-50 p-4 rounded-2xl font-bold text-sm outline-none" placeholder="Shop address..." value={partnerForm.address} onChange={e => setPartnerForm({...partnerForm, address: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                   <label className="text-[9px] font-black uppercase text-gray-400 ml-1">Open Time</label>
                   <input type="time" className="w-full bg-gray-50 p-4 rounded-2xl font-bold text-sm outline-none" value={partnerForm.openTime} onChange={e => setPartnerForm({...partnerForm, openTime: e.target.value})} />
                 </div>
                 <div className="space-y-1">
                   <label className="text-[9px] font-black uppercase text-gray-400 ml-1">Close Time</label>
                   <input type="time" className="w-full bg-gray-50 p-4 rounded-2xl font-bold text-sm outline-none" value={partnerForm.closeTime} onChange={e => setPartnerForm({...partnerForm, closeTime: e.target.value})} />
                 </div>
              </div>
              <div className="flex gap-2 pt-4">
                <button type="button" onClick={() => setShowPartnerModal(false)} className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Cancel</button>
                <button type="submit" className="flex-[2] bg-black text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">
                    {editingPartner ? 'Update Partner' : 'Create Partner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Item Modal */}
      {showMenuModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-[40px] p-8 space-y-6 animate-slide-up">
            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">{editingItem ? 'Edit Item' : 'New Dish'}</h3>
            <form onSubmit={handleSaveMenuItem} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-gray-400 ml-1">Item Name</label>
                <input required className="w-full bg-gray-50 p-4 rounded-2xl font-bold text-sm outline-none" placeholder="e.g. Special Dosa" value={menuForm.name} onChange={e => setMenuForm({...menuForm, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-gray-400 ml-1">Price (₹)</label>
                  <input required type="number" className="w-full bg-gray-50 p-4 rounded-2xl font-bold text-sm outline-none" placeholder="90" value={menuForm.price} onChange={e => setMenuForm({...menuForm, price: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-gray-400 ml-1">Category</label>
                  <select className="w-full bg-gray-50 p-4 rounded-2xl font-bold text-sm outline-none" value={menuForm.category} onChange={e => setMenuForm({...menuForm, category: e.target.value as Category})}>
                    {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-gray-400 ml-1">Image URL</label>
                <input required className="w-full bg-gray-50 p-4 rounded-2xl font-bold text-sm outline-none" placeholder="https://..." value={menuForm.image} onChange={e => setMenuForm({...menuForm, image: e.target.value})} />
              </div>
              <div className="flex gap-2 pt-4">
                <button type="button" onClick={() => setShowMenuModal(false)} className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Cancel</button>
                <button type="submit" className="flex-[2] bg-black text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">Save Item</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSettingsModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-[40px] p-8 space-y-6 animate-slide-up">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Booking Hours</h3>
              <button onClick={() => setShowSettingsModal(false)} className="p-2 bg-gray-100 rounded-full"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input type="time" className="w-full bg-gray-50 p-4 rounded-2xl font-black text-sm" value={editTimes.openTime} onChange={e => setEditTimes({...editTimes, openTime: e.target.value})} />
              <input type="time" className="w-full bg-gray-50 p-4 rounded-2xl font-black text-sm" value={editTimes.closeTime} onChange={e => setEditTimes({...editTimes, closeTime: e.target.value})} />
            </div>
            <button 
              onClick={() => {
                storage.updateRestaurantStatus(restaurantId!, { openTime: editTimes.openTime, closeTime: editTimes.closeTime });
                setShowSettingsModal(false);
                onDataChange();
              }} 
              className="w-full bg-black text-white py-5 rounded-[25px] font-black uppercase text-[11px] shadow-xl"
            >
              Update Hours
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
