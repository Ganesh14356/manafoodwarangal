
import { Category, AppData } from './types';

export const WHATSAPP_NUMBER = '9346499631';

export const INITIAL_DATA: AppData = {
  restaurants: [
    {
      id: 'baarista',
      name: 'Baarista - Fast Food & Chat',
      image: 'https://images.unsplash.com/photo-1512152272829-e3139592d56f?w=600&h=400&fit=crop',
      isOpen: true,
      openTime: '10:00',
      closeTime: '22:30',
      adminUser: 'Ganesh143',
      adminPass: 'Ganesh123@'
    },
    {
      id: 'madhurirams',
      name: "Madhuriram's Tiffins",
      image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&h=400&fit=crop',
      isOpen: true,
      openTime: '07:00',
      closeTime: '22:00',
      adminUser: 'madhu143',
      adminPass: 'madhu123@'
    }
  ],
  menuItems: [
    // --- BAARISTA FRIED RICE & NOODLES ---
    { id: 'b1', name: 'Veg Fried Rice', price: 90, category: Category.FRIED_RICE, inStock: true, restaurantId: 'baarista', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300&h=300&fit=crop' },
    { id: 'b2', name: 'Schezwan Fried Rice', price: 110, category: Category.FRIED_RICE, inStock: true, restaurantId: 'baarista', image: 'https://images.unsplash.com/photo-1512058560366-cd2429598632?w=300&h=300&fit=crop' },
    { id: 'b3', name: 'Paneer Fried Rice', price: 130, category: Category.FRIED_RICE, inStock: true, restaurantId: 'baarista', image: 'https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?w=300&h=300&fit=crop' },
    { id: 'b4', name: 'Mushroom Fried Rice', price: 130, category: Category.FRIED_RICE, inStock: true, restaurantId: 'baarista', image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=300&h=300&fit=crop' },
    { id: 'b5', name: 'Veg Noodles', price: 70, category: Category.FRIED_RICE, inStock: true, restaurantId: 'baarista', image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=300&h=300&fit=crop' },
    
    // --- BAARISTA BIRYANI ---
    { id: 'b10', name: 'Veg Biryani', price: 100, category: Category.BIRYANI, inStock: true, restaurantId: 'baarista', image: 'https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?w=300&h=300&fit=crop' },
    { id: 'b11', name: 'Paneer Biryani', price: 150, category: Category.BIRYANI, inStock: true, restaurantId: 'baarista', image: 'https://images.unsplash.com/photo-1631515233349-55cd29bfc65d?w=300&h=300&fit=crop' },

    // --- BAARISTA STARTERS ---
    { id: 'b20', name: 'Paneer Manchurian', price: 140, category: Category.STARTERS, inStock: true, restaurantId: 'baarista', image: 'https://images.unsplash.com/photo-1512058560366-cd2429598632?w=300&h=300&fit=crop' },
    { id: 'b21', name: 'Gobi Manchurian', price: 130, category: Category.STARTERS, inStock: true, restaurantId: 'baarista', image: 'https://images.unsplash.com/photo-1601050690597-df056fb01793?w=300&h=300&fit=crop' },

    // --- BAARISTA JUICES ---
    { id: 'b30', name: 'Mosambi Juice', price: 50, category: Category.JUICES, inStock: true, restaurantId: 'baarista', image: 'https://images.unsplash.com/photo-1613478223719-2ab80260f00c?w=300&h=300&fit=crop' },
    { id: 'b31', name: 'Pomegranate Juice', price: 70, category: Category.JUICES, inStock: true, restaurantId: 'baarista', image: 'https://images.unsplash.com/photo-1541345023926-55d6e08bb369?w=300&h=300&fit=crop' },
    { id: 'b32', name: 'Orange Juice', price: 70, category: Category.JUICES, inStock: true, restaurantId: 'baarista', image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=300&h=300&fit=crop' },

    // --- BAARISTA CHAT ---
    { id: 'c1', name: 'Pani Puri (8 pcs)', price: 30, category: Category.CHAT, inStock: true, restaurantId: 'baarista', image: 'https://images.unsplash.com/photo-1589647363585-f4a7d3877b10?w=300&h=300&fit=crop' },
    { id: 'c2', name: 'Pav Bhaji', price: 80, category: Category.CHAT, inStock: true, restaurantId: 'baarista', image: 'https://images.unsplash.com/photo-1626132647523-66f5bf380ee2?w=300&h=300&fit=crop' },

    // --- MADHURIRAM TIFFINS ---
    { id: 'm1', name: 'Single Idli', price: 25, category: Category.TIFFINS, inStock: true, restaurantId: 'madhurirams', image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=300&h=300&fit=crop' },
    { id: 'm2', name: 'Masala Dosa', price: 50, category: Category.TIFFINS, inStock: true, restaurantId: 'madhurirams', image: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=300&h=300&fit=crop' }
  ],
  orders: [],
  lastOrderId: 1000
};
