
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AppData, Category, MenuItem, Restaurant, Order } from '../types';
import { storage } from '../services/storage';

interface AdminProps {
  data: AppData;
  onDataChange: () => void;
}

const Admin: React.FC<AdminProps> = ({ data, onDataChange }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<string>('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [activeTab, setActiveTab] = useState<'status' | 'items' | 'orders'>('status');
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  const [newItem, setNewItem] = useState({
    name: '',
    price: '',
    category: Category.FAST_FOOD,
    inStock: true,
    image: ''
  });

  useEffect(() => {
    const auth = sessionStorage.getItem('manafood_admin_auth');
    const user = sessionStorage.getItem('manafood_admin_user');
    if (auth === 'true' && user) {
      setIsLoggedIn(true);
      setCurrentUser(user);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'Ganesh143' && password === 'Ganesh123@') {
      setIsLoggedIn(true);
      setCurrentUser('admin');
      setLoginError('');
      sessionStorage.setItem('manafood_admin_auth', 'true');
      sessionStorage.setItem('manafood_admin_user', 'admin');
      return;
    }
    const restaurantAdmin = data.restaurants.find(r => r.adminUser === username && r.adminPass === password);
    if (restaurantAdmin) {
      setIsLoggedIn(true);
      setCurrentUser(restaurantAdmin.id);
      setLoginError('');
      sessionStorage.setItem('manafood_admin_auth', 'true');
      sessionStorage.setItem('manafood_admin_user', restaurantAdmin.id);
    } else {
      setLoginError('Invalid username or password');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser('');
    sessionStorage.removeItem('manafood_admin_auth');
    sessionStorage.removeItem('manafood_admin_user');
  };

  const filteredRestaurants = useMemo(() => {
    if (currentUser === 'admin') return data.restaurants;
    return data.restaurants.filter(r => r.id === currentUser);
  }, [data.restaurants, currentUser]);

  const filteredMenuItems = useMemo(() => {
    if (currentUser === 'admin') return data.menuItems;
    return data.menuItems.filter(m => m.restaurantId === currentUser);
  }, [data.menuItems, currentUser]);

  const filteredOrders = useMemo(() => {
    if (currentUser === 'admin') return data.orders;
    return data.orders.filter(o => o.restaurantId === currentUser);
  }, [data.orders, currentUser]);

  const handleStatusToggle = (resId: string, current: boolean) => {
    storage.updateRestaurantStatus(resId, { isOpen: !current });
    onDataChange();
  };

  const handleTimeChange = (resId: string, field: 'openTime' | 'closeTime', value: string) => {
    storage.updateRestaurantStatus(resId, { [field]: value });
    onDataChange();
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    const resId = currentUser === 'admin' ? data.restaurants[0].id : currentUser;
    const item: MenuItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: newItem.name,
      price: Number(newItem.price),
      category: newItem.category,
      inStock: newItem.inStock,
      restaurantId: resId,
      image: newItem.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=300&fit=crop'
    };
    storage.addMenuItem(item);
    setIsAddingItem(false);
    setNewItem({ name: '', price: '', category: Category.FAST_FOOD, inStock: true, image: '' });
    onDataChange();
  };

  const handleEditItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    storage.updateMenuItem(editingItem.id, editingItem);
    setEditingItem(null);
    onDataChange();
  };

  const toggleItemStock = (itemId: string, current: boolean) => {
    storage.updateMenuItem(itemId, { inStock: !current });
    onDataChange();
  };

  const handleDeleteItem = (id: string) => {
    if (confirm('Delete this item permanently?')) {
      storage.deleteMenuItem(id);
      onDataChange();
    }
  };

  const toggleOrderStatus = (orderId: string, currentStatus: Order['status']) => {
    storage.updateOrderStatus(orderId, currentStatus === 'Pending' ? 'Delivered' : 'Pending');
    onDataChange();
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white p-8 rounded-3xl border border-gray-100 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-black text-green-600 tracking-tight">ManaFood Admin</h1>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Management Panel</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              required
              type="text" 
              placeholder="Username"
              className="w-full border border-gray-100 bg-gray-50 rounded-2xl px-5 py-4 font-bold"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
            <input 
              required
              type="password" 
              placeholder="Password"
              className="w-full border border-gray-100 bg-gray-50 rounded-2xl px-5 py-4 font-bold"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            {loginError && <p className="text-red-500 text-[10px] font-black uppercase text-center tracking-widest">{loginError}</p>}
            <button 
              type="submit"
              className="w-full bg-green-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-green-100"
            >
              Secure Login
            </button>
          </form>
          <div className="text-center">
            <Link to="/" className="text-[10px] text-green-600 font-black uppercase tracking-widest hover:underline">← Exit to Store</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 pb-12">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div className="space-y-0.5">
            <h2 className="text-xl font-black uppercase tracking-tight">Dashboard</h2>
            <div className="flex gap-4">
              <Link to="/" className="text-[10px] text-green-600 font-black uppercase tracking-widest hover:underline">User View</Link>
              <button onClick={handleLogout} className="text-[10px] text-red-500 font-black uppercase tracking-widest hover:underline">Logout</button>
            </div>
          </div>
          <div className="flex bg-gray-100 p-1 rounded-xl shadow-inner">
            {['status', 'items', 'orders'].map((t) => (
              <button 
                key={t}
                onClick={() => setActiveTab(t as any)}
                className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${activeTab === t ? 'bg-white shadow-sm text-green-600' : 'text-gray-400'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="bg-green-50 px-3 py-1.5 rounded-lg inline-block self-start border border-green-100">
          <p className="text-[9px] text-green-700 font-black uppercase tracking-widest">
            {currentUser === 'admin' ? '🔥 Global Admin Access' : `🏪 Store: ${filteredRestaurants[0]?.name}`}
          </p>
        </div>
      </div>

      {activeTab === 'status' && (
        <div className="space-y-4">
          {filteredRestaurants.map(res => (
            <div key={res.id} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-lg text-gray-900 uppercase tracking-tight">{res.name}</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Store Visibility</p>
                </div>
                <button 
                  onClick={() => handleStatusToggle(res.id, res.isOpen)}
                  className={`px-5 py-2 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all ${res.isOpen ? 'bg-green-600 text-white shadow-lg' : 'bg-red-500 text-white shadow-lg'}`}
                >
                  {res.isOpen ? 'Open' : 'Closed'}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
                <div>
                  <label className="block text-[9px] uppercase font-black text-gray-400 mb-2 tracking-widest">Open Time</label>
                  <input type="time" value={res.openTime} onChange={(e) => handleTimeChange(res.id, 'openTime', e.target.value)} className="w-full border-gray-100 border p-3 rounded-xl text-xs font-bold bg-gray-50"/>
                </div>
                <div>
                  <label className="block text-[9px] uppercase font-black text-gray-400 mb-2 tracking-widest">Close Time</label>
                  <input type="time" value={res.closeTime} onChange={(e) => handleTimeChange(res.id, 'closeTime', e.target.value)} className="w-full border-gray-100 border p-3 rounded-xl text-xs font-bold bg-gray-50"/>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'items' && (
        <div className="space-y-4">
          <button 
            onClick={() => setIsAddingItem(true)}
            className="w-full bg-green-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-green-100"
          >
            Add New Menu Item
          </button>

          {(isAddingItem || editingItem) && (
            <div className="fixed inset-0 bg-black/60 z-[100] p-4 flex items-center justify-center backdrop-blur-sm">
              <div className="bg-white w-full max-w-sm rounded-3xl p-7 space-y-5 shadow-2xl">
                <h3 className="text-lg font-black uppercase tracking-tight">{editingItem ? 'Edit Item' : 'New Menu Item'}</h3>
                <form onSubmit={editingItem ? handleEditItem : handleAddItem} className="space-y-4">
                  <input required placeholder="Item Name" className="w-full border border-gray-100 bg-gray-50 p-3 rounded-xl font-bold" value={editingItem ? editingItem.name : newItem.name} onChange={e => editingItem ? setEditingItem({...editingItem, name: e.target.value}) : setNewItem({...newItem, name: e.target.value})}/>
                  <div className="grid grid-cols-2 gap-3">
                    <input required type="number" placeholder="Price" className="w-full border border-gray-100 bg-gray-50 p-3 rounded-xl font-bold" value={editingItem ? editingItem.price : newItem.price} onChange={e => editingItem ? setEditingItem({...editingItem, price: Number(e.target.value)}) : setNewItem({...newItem, price: e.target.value})}/>
                    <select className="w-full border border-gray-100 bg-gray-50 p-3 rounded-xl font-bold" value={editingItem ? editingItem.category : newItem.category} onChange={e => editingItem ? setEditingItem({...editingItem, category: e.target.value as Category}) : setNewItem({...newItem, category: e.target.value as Category})}>
                      {Object.values(Category).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <input placeholder="Image URL" className="w-full border border-gray-100 bg-gray-50 p-3 rounded-xl font-bold text-xs" value={editingItem ? editingItem.image : newItem.image} onChange={e => editingItem ? setEditingItem({...editingItem, image: e.target.value}) : setNewItem({...newItem, image: e.target.value})}/>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <input type="checkbox" id="inStock" className="w-5 h-5 accent-green-600" checked={editingItem ? editingItem.inStock : newItem.inStock} onChange={e => editingItem ? setEditingItem({...editingItem, inStock: e.target.checked}) : setNewItem({...newItem, inStock: e.target.checked})}/>
                    <label htmlFor="inStock" className="text-xs font-black uppercase tracking-widest text-gray-600">In Stock</label>
                  </div>
                  <div className="flex gap-3 pt-3">
                    <button type="button" onClick={() => { setIsAddingItem(false); setEditingItem(null); }} className="flex-1 bg-gray-100 text-gray-500 py-3 rounded-xl font-black uppercase tracking-widest text-[10px]">Cancel</button>
                    <button type="submit" className="flex-1 bg-green-600 text-white py-3 rounded-xl font-black uppercase tracking-widest text-[10px]">Save</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="grid gap-3">
            {filteredMenuItems.map(item => (
              <div key={item.id} className="bg-white p-3 rounded-2xl border border-gray-100 flex items-center gap-4 shadow-sm">
                <img src={item.image} className="w-12 h-12 rounded-xl object-cover bg-gray-50" alt={item.name} />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{item.name}</p>
                  <p className="text-[9px] text-green-600 font-black uppercase tracking-wider">₹{item.price} • {item.category}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleItemStock(item.id, item.inStock)} className={`p-2 rounded-xl border ${item.inStock ? 'text-green-600 bg-green-50' : 'text-red-500 bg-red-50'}`}><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg></button>
                  <button onClick={() => setEditingItem(item)} className="p-2 rounded-xl border text-blue-500 bg-blue-50"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg></button>
                  <button onClick={() => handleDeleteItem(item.id)} className="p-2 rounded-xl border text-red-400 bg-red-50/30"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">No active orders</p>
            </div>
          ) : (
            filteredOrders.map(order => (
              <div key={order.id} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-black text-xl text-gray-900 tracking-tighter">{order.id}</h4>
                    <p className="text-[8px] text-gray-400 uppercase font-black tracking-widest">{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                  <button onClick={() => toggleOrderStatus(order.id, order.status)} className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${order.status === 'Delivered' ? 'bg-green-600 text-white' : 'bg-orange-500 text-white'}`}>{order.status}</button>
                </div>
                <div className="text-[11px] text-gray-600 space-y-2 p-3 bg-gray-50 rounded-2xl">
                  <p><strong>Customer:</strong> {order.customerName}</p>
                  <p><strong>Phone:</strong> {order.customerPhone}</p>
                  <p><strong>Address:</strong> <span className="text-gray-400">{order.address}</span></p>
                </div>
                <div className="space-y-1">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-[10px] font-bold text-gray-700">
                      <span>{item.name} x{item.quantity}</span>
                      <span>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                  <div className="border-t border-gray-100 mt-2 pt-2 flex justify-between font-black text-sm text-gray-900">
                    <span>Amount Due</span>
                    <span className="text-green-600">₹{order.total}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Admin;
