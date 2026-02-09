
import { AppData, Order, MenuItem, Restaurant } from '../types';
import { INITIAL_DATA } from '../constants';

const STORAGE_KEY = 'manafood_data';

export const storage = {
  getData: (): AppData => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : INITIAL_DATA;
  },

  saveData: (data: AppData) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  updateRestaurantStatus: (id: string, updates: Partial<Restaurant>) => {
    const data = storage.getData();
    data.restaurants = data.restaurants.map(r => r.id === id ? { ...r, ...updates } : r);
    storage.saveData(data);
  },

  addMenuItem: (item: MenuItem) => {
    const data = storage.getData();
    data.menuItems.push(item);
    storage.saveData(data);
  },

  updateMenuItem: (id: string, updates: Partial<MenuItem>) => {
    const data = storage.getData();
    data.menuItems = data.menuItems.map(m => m.id === id ? { ...m, ...updates } : m);
    storage.saveData(data);
  },

  deleteMenuItem: (id: string) => {
    const data = storage.getData();
    data.menuItems = data.menuItems.filter(m => m.id !== id);
    storage.saveData(data);
  },

  addOrder: (order: Order) => {
    const data = storage.getData();
    data.orders.unshift(order);
    data.lastOrderId = data.lastOrderId + 1;
    storage.saveData(data);
  },

  updateOrderStatus: (id: string, status: Order['status']) => {
    const data = storage.getData();
    data.orders = data.orders.map(o => o.id === id ? { ...o, status } : o);
    storage.saveData(data);
  }
};
