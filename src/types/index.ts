export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'operator';
  active: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  unit: 'kg' | 'un' | 'portion';
  cost: number;
  price: number;
  stock: number;
  minStock: number;
  active: boolean;
  category: 'beverage' | 'food' | 'bait' | 'equipment';
}

export interface Dish {
  id: string;
  name: string;
  description: string;
  price: number;
  photoUrl?: string;
  active: boolean;
  ingredients: DishIngredient[];
}

export interface DishIngredient {
  productId: string;
  quantity: number;
}

export interface Lake {
  id: string;
  name: string;
  active: boolean;
}

export interface FishSpecies {
  id: string;
  name: string;
  pricePerKg: number;
}

export interface Ticket {
  id: string;
  number: string;
  status: 'open' | 'consuming' | 'awaiting_weighing' | 'closed';
  openedAt: string;
  closedAt?: string;
  userId: string;
  items: TicketItem[];
  fishWeighings: FishWeighing[];
  payments: Payment[];
  total: number;
  discount: number;
}

export interface TicketItem {
  id: string;
  type: 'product' | 'dish';
  refId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

export interface FishWeighing {
  id: string;
  lakeId: string;
  speciesId: string;
  weightKg: number;
  pricePerKg: number;
  total: number;
}

export interface Payment {
  id: string;
  method: 'pix' | 'card' | 'cash';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  reference?: string;
}

export interface CashRegister {
  id: string;
  openedBy: string;
  openedAt: string;
  closedAt?: string;
  openingAmount: number;
  closingAmount?: number;
  status: 'open' | 'closed';
}

export interface StockMovement {
  id: string;
  productId: string;
  type: 'in' | 'out';
  quantity: number;
  note: string;
  userId: string;
  createdAt: string;
}

export interface Report {
  id: string;
  type: 'sales' | 'stock' | 'fish' | 'cash';
  period: {
    start: string;
    end: string;
  };
  data: any;
  generatedAt: string;
}