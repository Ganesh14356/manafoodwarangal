
import { AppData, Order, MenuItem, Restaurant, Review } from '../types';
import { INITIAL_DATA } from '../constants';

const STORAGE_KEY = 'manafood_data';
const channel = new BroadcastChannel('manafood_network');

export const storage = {
  getData: (): AppData => {
    const data = localStorage.getItem(STORAGE_KEY);
    const parsed = data ? JSON.parse(data) : INITIAL_DATA;
    if (!parsed.reviews) parsed.reviews = [];
    return parsed;
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

  addRestaurant: (restaurant: Restaurant) => {
    const data = storage.getData();
    data.restaurants.push(restaurant);
    storage.saveData(data);
  },

  deleteRestaurant: (id: string) => {
    const data = storage.getData();
    data.restaurants = data.restaurants.filter(r => r.id !== id);
    // Also clean up menu items for this restaurant
    data.menuItems = data.menuItems.filter(m => m.restaurantId !== id);
    storage.saveData(data);
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

  deleteMenuItem: (id: string) => {
    const data = storage.getData();
    data.menuItems = data.menuItems.filter(m => m.id !== id);
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
  },

  updateOrderLogistics: (id: string, deliveryFee: number) => {
    const data = storage.getData();
    data.orders = data.orders.map(o => {
      if (o.id === id) {
        const newTotal = o.subtotal + o.platformFee + deliveryFee;
        return { 
          ...o, 
          deliveryFee, 
          total: newTotal,
          logistics: o.logistics ? { ...o.logistics, isFeeConfirmed: true } : undefined
        };
      }
      return o;
    });
    storage.saveData(data);
  },

  addReview: (review: Review) => {
    const data = storage.getData();
    data.reviews.unshift(review);
    data.orders = data.orders.map(o => o.id === review.orderId ? { ...o, isReviewed: true } : o);
    storage.saveData(data);
  }
};
