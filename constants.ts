
import { Category, AppData } from './types';

export const WHATSAPP_NUMBER = '9346499631';
export const MERCHANT_UPI_ID = 'Q328207787@ybl';
export const MERCHANT_NAME = 'ManaFood Warangal';
export const WARANGAL_CENTER = { lat: 18.0116, lng: 79.5805 }; // Hanamkonda
export const MAX_RADIUS_KM = 15;
export const PLATFORM_FEE_PERCENT = 0.05; // 5%
export const DELIVERY_FEE_BASE = 25;

export const INITIAL_DATA: AppData = {
  currentUser: null,
  restaurants: [
    {
      id: 'baarista',
      name: 'Baarista - Fast Food',
      image: 'https://images.unsplash.com/photo-1512152272829-e3139592d56f?w=600&h=400&fit=crop',
      isOpen: true,
      openTime: '10:00',
      closeTime: '22:30',
      adminUser: '303055',
      adminPass: 'Barista@123',
      phone: '9346499631',
      location: { lat: 18.012, lng: 79.581 }
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
      location: { lat: 18.005, lng: 79.585 }
    }
  ],
  menuItems: [
    { id: 'b1', name: 'Veg Fried Rice', price: 90, category: Category.FRIED_RICE, inStock: true, restaurantId: 'baarista', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300&h=300&fit=crop' },
    { id: 'b10', name: 'Veg Biryani', price: 160, category: Category.BIRYANI, inStock: true, restaurantId: 'baarista', image: 'https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?w=300&h=300&fit=crop' },
    { id: 'm2', name: 'Masala Dosa', price: 50, category: Category.TIFFINS, inStock: true, restaurantId: 'madhurirams', image: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=300&h=300&fit=crop' }
  ],
  orders: [],
  lastOrderId: 10000
};
