
import { Category, AppData } from './types';

export const WHATSAPP_NUMBER = '9346499631';
export const MERCHANT_UPI_ID = 'Q328207787@ybl';
export const MERCHANT_NAME = 'ManaFood Warangal';

// Service Area Settings
export const WARANGAL_CENTER = { lat: 18.0116, lng: 79.5805 }; // Hanamkonda (Tri-City Hub)
export const MAX_RADIUS_KM = 15; // Service covers Warangal, Hanamkonda, Kazipet

// Fair Delivery Pricing (Rapido Style + Rider Protection)
export const DELIVERY_FEE_BASE = 30; // Minimum ₹30 for riders (up to 2km)
export const DELIVERY_BASE_DISTANCE = 2; // km included in base fee
export const DELIVERY_PER_KM = 10; // ₹10 per km extra (fair fuel + time coverage)
export const PLATFORM_FEE_PERCENT = 0.05; // 5% platform maintenance

export const INITIAL_DATA: AppData = {
  currentUser: null,
  restaurants: [
    {
      id: 'baarista',
      name: 'Baarista - Fast Food & Juices',
      image: 'https://images.unsplash.com/photo-1512152272829-e3139592d56f?w=600&h=400&fit=crop',
      isOpen: true,
      openTime: '10:00',
      closeTime: '22:30',
      adminUser: '303055',
      adminPass: 'Barista@123',
      phone: '9346499631',
      address: 'Advocates Colony, Nakkala Gutta, Hanamkonda, Telangana 506001',
      // Coordinates for Advocates Colony / Nakkala Gutta area
      location: { lat: 18.0125, lng: 79.5755 }
    },
    {
      id: 'madhurirams',
      name: "Madhuriram's Tiffins",
      image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&h=400&fit=crop',
      isOpen: true,
      openTime: '07:00',
      closeTime: '22:00',
      adminUser: 'madhu143',
      adminPass: 'madhu123@',
      phone: '9346499632',
      address: 'Advocates Colony, Nakkala Gutta, Hanamkonda, Telangana 506001',
      location: { lat: 18.0128, lng: 79.5878 }
    }
  ],
  menuItems: [
    { id: 'b1', name: 'Veg Fried Rice', price: 90, category: Category.FRIED_RICE, inStock: true, restaurantId: 'baarista', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300&h=300&fit=crop' },
    { id: 'b2', name: 'Egg Fried Rice', price: 110, category: Category.FRIED_RICE, inStock: true, restaurantId: 'baarista', image: 'https://images.unsplash.com/photo-1512058560366-cd24270083cd?w=300&h=300&fit=crop' },
    { id: 'b3', name: 'Egg Noodles', price: 110, category: Category.FRIED_RICE, inStock: true, restaurantId: 'baarista', image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=300&h=300&fit=crop' },
    { id: 'b4', name: 'Bhel Puri', price: 40, category: Category.CHAT, inStock: true, restaurantId: 'baarista', image: 'https://images.unsplash.com/photo-1601050690597-df056fb1779f?w=300&h=300&fit=crop' },
    { id: 'b5', name: 'Dahi Samosa', price: 60, category: Category.CHAT, inStock: true, restaurantId: 'baarista', image: 'https://images.unsplash.com/photo-1601050690597-df056fb1779f?w=300&h=300&fit=crop' },
    { id: 'b6', name: 'Schezwan Fried Rice', price: 120, category: Category.FRIED_RICE, inStock: true, restaurantId: 'baarista', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300&h=300&fit=crop' },
    { id: 'b10', name: 'Veg Biryani', price: 160, category: Category.BIRYANI, inStock: true, restaurantId: 'baarista', image: 'https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?w=300&h=300&fit=crop' },
    { id: 'm2', name: 'Masala Dosa', price: 50, category: Category.TIFFINS, inStock: true, restaurantId: 'madhurirams', image: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=300&h=300&fit=crop' }
  ],
  orders: [],
  reviews: [],
  lastOrderId: 10000
};
