import { create } from 'zustand';
import { Product, Dish, Lake, FishSpecies, Ticket, CashRegister, StockMovement } from '../types';

interface DataState {
  products: Product[];
  dishes: Dish[];
  lakes: Lake[];
  fishSpecies: FishSpecies[];
  tickets: Ticket[];
  cashRegister: CashRegister | null;
  stockMovements: StockMovement[];
  
  // Products
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  
  // Dishes
  addDish: (dish: Omit<Dish, 'id'>) => void;
  updateDish: (id: string, dish: Partial<Dish>) => void;
  deleteDish: (id: string) => void;
  
  // Lakes
  addLake: (lake: Omit<Lake, 'id'>) => void;
  updateLake: (id: string, lake: Partial<Lake>) => void;
  
  // Fish Species
  addFishSpecies: (species: Omit<FishSpecies, 'id'>) => void;
  updateFishSpecies: (id: string, species: Partial<FishSpecies>) => void;
  
  // Tickets
  createTicket: () => Ticket;
  updateTicket: (id: string, ticket: Partial<Ticket>) => void;
  closeTicket: (id: string) => void;
  
  // Cash Register
  openCashRegister: (userId: string, amount: number) => void;
  closeCashRegister: (amount: number) => void;
  
  // Stock
  addStockMovement: (movement: Omit<StockMovement, 'id' | 'createdAt'>) => void;
  updateStock: (productId: string, quantity: number, type: 'in' | 'out') => void;
}

// Mock initial data
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Cerveja Brahma 350ml',
    unit: 'un',
    cost: 2.50,
    price: 5.00,
    stock: 120,
    minStock: 20,
    active: true,
    category: 'beverage',
  },
  {
    id: '2',
    name: 'Refrigerante Coca-Cola 350ml',
    unit: 'un',
    cost: 1.80,
    price: 4.00,
    stock: 80,
    minStock: 15,
    active: true,
    category: 'beverage',
  },
  {
    id: '3',
    name: 'Massa para Peixe',
    unit: 'kg',
    cost: 8.00,
    price: 15.00,
    stock: 25,
    minStock: 5,
    active: true,
    category: 'bait',
  },
  {
    id: '4',
    name: 'Minhoca',
    unit: 'portion',
    cost: 3.00,
    price: 8.00,
    stock: 40,
    minStock: 10,
    active: true,
    category: 'bait',
  },
];

const mockDishes: Dish[] = [
  {
    id: '1',
    name: 'Peixe Frito Completo',
    description: 'Peixe frito com fritas, arroz, feijão, vinagrete e farofa',
    price: 35.00,
    active: true,
    ingredients: [
      { productId: '3', quantity: 0.2 }, // Massa para peixe
    ],
  },
  {
    id: '2',
    name: 'Tilápia Assada',
    description: 'Tilápia assada com legumes e arroz',
    price: 42.00,
    active: true,
    ingredients: [],
  },
];

const mockLakes: Lake[] = [
  { id: '1', name: 'Lago Principal', active: true },
  { id: '2', name: 'Lago dos Peixes Grandes', active: true },
  { id: '3', name: 'Lago Infantil', active: true },
];

const mockFishSpecies: FishSpecies[] = [
  { id: '1', name: 'Tilápia', pricePerKg: 12.00 },
  { id: '2', name: 'Pacu', pricePerKg: 15.00 },
  { id: '3', name: 'Carpa', pricePerKg: 10.00 },
  { id: '4', name: 'Pintado', pricePerKg: 25.00 },
];

export const useDataStore = create<DataState>((set, get) => ({
  products: mockProducts,
  dishes: mockDishes,
  lakes: mockLakes,
  fishSpecies: mockFishSpecies,
  tickets: [],
  cashRegister: null,
  stockMovements: [],

  // Products
  addProduct: (product) => {
    const newProduct = {
      ...product,
      id: Date.now().toString(),
    };
    set(state => ({
      products: [...state.products, newProduct],
    }));
  },

  updateProduct: (id, productData) => {
    set(state => ({
      products: state.products.map(p => 
        p.id === id ? { ...p, ...productData } : p
      ),
    }));
  },

  deleteProduct: (id) => {
    set(state => ({
      products: state.products.filter(p => p.id !== id),
    }));
  },

  // Dishes
  addDish: (dish) => {
    const newDish = {
      ...dish,
      id: Date.now().toString(),
    };
    set(state => ({
      dishes: [...state.dishes, newDish],
    }));
  },

  updateDish: (id, dishData) => {
    set(state => ({
      dishes: state.dishes.map(d => 
        d.id === id ? { ...d, ...dishData } : d
      ),
    }));
  },

  deleteDish: (id) => {
    set(state => ({
      dishes: state.dishes.filter(d => d.id !== id),
    }));
  },

  // Lakes
  addLake: (lake) => {
    const newLake = {
      ...lake,
      id: Date.now().toString(),
    };
    set(state => ({
      lakes: [...state.lakes, newLake],
    }));
  },

  updateLake: (id, lakeData) => {
    set(state => ({
      lakes: state.lakes.map(l => 
        l.id === id ? { ...l, ...lakeData } : l
      ),
    }));
  },

  // Fish Species
  addFishSpecies: (species) => {
    const newSpecies = {
      ...species,
      id: Date.now().toString(),
    };
    set(state => ({
      fishSpecies: [...state.fishSpecies, newSpecies],
    }));
  },

  updateFishSpecies: (id, speciesData) => {
    set(state => ({
      fishSpecies: state.fishSpecies.map(s => 
        s.id === id ? { ...s, ...speciesData } : s
      ),
    }));
  },

  // Tickets
  createTicket: () => {
    const ticket: Ticket = {
      id: Date.now().toString(),
      number: `#${String(Date.now()).slice(-6)}`,
      status: 'open',
      openedAt: new Date().toISOString(),
      userId: '1',
      items: [],
      fishWeighings: [],
      payments: [],
      total: 0,
      discount: 0,
    };
    
    set(state => ({
      tickets: [...state.tickets, ticket],
    }));
    
    return ticket;
  },

  updateTicket: (id, ticketData) => {
    set(state => ({
      tickets: state.tickets.map(t => 
        t.id === id ? { ...t, ...ticketData } : t
      ),
    }));
  },

  closeTicket: (id) => {
    set(state => ({
      tickets: state.tickets.map(t => 
        t.id === id 
          ? { ...t, status: 'closed' as const, closedAt: new Date().toISOString() }
          : t
      ),
    }));
  },

  // Cash Register
  openCashRegister: (userId, amount) => {
    const cashRegister: CashRegister = {
      id: Date.now().toString(),
      openedBy: userId,
      openedAt: new Date().toISOString(),
      openingAmount: amount,
      status: 'open',
    };
    set({ cashRegister });
  },

  closeCashRegister: (amount) => {
    set(state => ({
      cashRegister: state.cashRegister 
        ? {
            ...state.cashRegister,
            closedAt: new Date().toISOString(),
            closingAmount: amount,
            status: 'closed' as const,
          }
        : null,
    }));
  },

  // Stock
  addStockMovement: (movement) => {
    const stockMovement: StockMovement = {
      ...movement,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    
    set(state => ({
      stockMovements: [...state.stockMovements, stockMovement],
    }));
    
    // Update product stock
    get().updateStock(movement.productId, movement.quantity, movement.type);
  },

  updateStock: (productId, quantity, type) => {
    set(state => ({
      products: state.products.map(p => 
        p.id === productId 
          ? { 
              ...p, 
              stock: type === 'in' 
                ? p.stock + quantity 
                : Math.max(0, p.stock - quantity)
            }
          : p
      ),
    }));
  },
}));