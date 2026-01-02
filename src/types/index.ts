export type UserRole = 'admin' | 'customer';

export type StoreConfig = {
  storeId: string;
  storeName: string;
  accentColor: string; // hex
  whatsappNumber: string;
  createdAt?: any;
  updatedAt?: any;
};

export type Product = {
  id: string;
  storeId: string;
  name: string;
  price: number;
  stock: number;
  description: string;
  imageUrl: string;
  active: boolean;
  createdAt?: any;
  updatedAt?: any;
};

export type Branch = {
  id: string;
  storeId: string;
  name: string;
  address: string;
  hours: string;
  phone: string;
  location?: { lat: number; lng: number };
  createdAt?: any;
  updatedAt?: any;
};
