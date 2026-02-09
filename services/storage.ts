
import { AppData, Order, MenuItem, Restaurant } from '../types';
import { INITIAL_DATA } from '../constants';

const STORAGE_KEY = 'manafood_data';
const channel = new BroadcastChannel('manafood_network');

export const storage = {
  getData: (): AppData => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : INITIAL_DATA;
  },

  saveData: (data: AppData) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    channel.postMessage({ type: 'DATA_UPDATED' });
  },

  subscribe: (callback: () => void) => {
    channel.onmessage = (event) => {
      if (event.data.type === 'DATA_UPDATED') {
        callback();
      }
    };
    return () => { channel.onmessage = null; };
  },

  updateRestaurantStatus: (id: string, updates: Partial<Restaurant>) => {
    const data = storage.getData();
    data.restaurants = data.restaurants.map(r => r.id === id ? { ...r, ...updates } : r);
    storage.saveData(data);
  },

  updateMenuItem: (id: string, updates: Partial<MenuItem>) => {
    const data = storage.getData();
    data.menuItems = data.menuItems.map(m => m.id === id ? { ...m, ...updates } : m);
    storage.saveData(data);
  },

  addOrder: (order: Order) => {
    const data = storage.getData();
    data.orders.unshift(order);
    data.lastOrderId = data.lastOrderId + 1;
    storage.saveData(data);
    channel.postMessage({ type: 'NEW_ORDER', orderId: order.id });
  },

  updateOrderStatus: (id: string, status: Order['status']) => {
    const data = storage.getData();
    data.orders = data.orders.map(o => o.id === id ? { ...o, status } : o);
    storage.saveData(data);
  }
};
