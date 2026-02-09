
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
  openTime: string; // HH:mm format
  closeTime: string; // HH:mm format
  adminUser: string;
  adminPass: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface Order {
  id: string;
  restaurantId: string;
  restaurantName: string;
  items: CartItem[];
  total: number;
  customerName: string;
  customerPhone: string;
  address: string;
  locationUrl: string;
  status: 'Pending' | 'Delivered';
  createdAt: string;
}

export interface AppData {
  restaurants: Restaurant[];
  menuItems: MenuItem[];
  orders: Order[];
  lastOrderId: number;
}
