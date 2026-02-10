
export enum Category {
  JUICES = 'Juices',
  MILKSHAKES = 'Milkshakes',
  FAST_FOOD = 'Fast Food',
  CHAT = 'Chat',
  FRIED_RICE = 'Fried Rice & Noodles',
  BIRYANI = 'Veg Dum Biryani',
  STARTERS = 'Veg Starters',
  SALADS = 'Fruit Salads',
  TIFFINS = 'Tiffins'
}

export type OrderStatus = 'Placed' | 'Confirmed' | 'Preparing' | 'Rider_Assigned' | 'Picked' | 'Delivered' | 'Cancelled';
export type PaymentStatus = 'Pending' | 'Paid';

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: Category;
  inStock: boolean;
  restaurantId: string;
  image: string;
}

export interface Restaurant {
  id: string;
  name: string;
  image: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  adminUser: string;
  adminPass: string;
  phone: string;
  address?: string;
  location?: { lat: number; lng: number };
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface Review {
  id: string;
  orderId: string;
  restaurantId: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  restaurantId: string;
  restaurantName: string;
  riderId?: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  platformFee: number;
  total: number;
  address: string;
  locationUrl: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: 'UPI';
  createdAt: string;
  isReviewed?: boolean;
  // Logistics Metadata
  logistics?: {
    roadDistanceKm: number;
    estimatedTimeMin: number;
    routeSummary: string;
    isFeeConfirmed: boolean;
  };
}

export interface AppData {
  restaurants: Restaurant[];
  menuItems: MenuItem[];
  orders: Order[];
  reviews: Review[];
  lastOrderId: number;
  currentUser: User | null;
}

export interface User {
  id: string;
  phone: string;
  name: string;
  role: 'Customer' | 'Restaurant' | 'Admin';
  restaurantId?: string;
}
