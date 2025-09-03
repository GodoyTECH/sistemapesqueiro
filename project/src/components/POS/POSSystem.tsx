import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, Calculator, CreditCard } from 'lucide-react';
import { useDataStore } from '../../stores/dataStore';
import { Product, Dish, TicketItem } from '../../types';

export function POSSystem() {
  const { products, dishes, createTicket, updateTicket } = useDataStore();
  const [currentTicket, setCurrentTicket] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState<TicketItem[]>([]);

  useEffect(() => {
    setCurrentTicket(createTicket());
  }, []);

  if (!currentTicket) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Calculator className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600">Carregando PDV...</p>
          </div>
        </div>
      </div>
    );
  }

  const activeProducts = products.filter(p => p.active);
  const activeDishes = dishes.filter(d => d.active);

  const allItems = [
    ...activeProducts.map(p => ({ ...p, type: 'product' as const })),
    ...activeDishes.map(d => ({ ...d, type: 'dish' as const, unit: 'un' as const }))
  ];

  const filteredItems = allItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
      (item.type === 'product' && (item as Product).category === selectedCategory) ||
      (item.type === 'dish' && selectedCategory === 'dish');
    return matchesSearch && matchesCategory;
  });

  const addToCart = (item: Product | Dish, type: 'product' | 'dish') => {
    const existingItem = cart.find(cartItem => cartItem.refId === item.id && cartItem.type === type);
    
    if (existingItem) {
      setCart(cart.map(cartItem => 
        cartItem.id === existingItem.id 
          ? { ...cartItem, quantity: cartItem.quantity + 1, total: cartItem.unitPrice * (cartItem.quantity + 1) }
          : cartItem
      ));
    } else {
      const newItem: TicketItem = {
        id: `${Date.now()}-${Math.random()}`,
        type,
        refId: item.id,
        name: item.name,
        quantity: 1,
        unitPrice: item.price,
        discount: 0,
        total: item.price,
      };
      setCart([...cart, newItem]);
    }
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart(cart.filter(item => item.id !== itemId));
    } else {
      setCart(cart.map(item => 
        item.id === itemId 
          ? { ...item, quantity: newQuantity, total: item.unitPrice * newQuantity - item.discount }
          : item
      ));
    }
  };

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.total, 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;

    const updatedTicket = {
      ...currentTicket,
      items: cart,
      total: cartTotal,
      status: 'consuming' as const,
    };

    updateTicket(currentTicket.id, updatedTicket);
    setCart([]);
    setCurrentTicket(createTicket());
    
    alert('Comanda registrada com sucesso!');
  };

  const categories = [
    { value: 'all', label: 'Todos' },
    { value: 'dish', label: 'Cardápio' },
    { value: 'beverage', label: 'Bebidas' },
    { value: 'food', label: 'Alimentos' },
    { value: 'bait', label: 'Iscas' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">PDV - Ponto de Venda</h1>
        <p className="text-gray-600">Comanda: {currentTicket.number}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products/Dishes Section */}
        <div className="lg:col-span-2">
          {/* Search and Filters */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Buscar item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredItems.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => addToCart(item, item.type)}
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-gray-900 flex-1">{item.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ml-2 ${
                    item.type === 'dish' ? 'bg-purple-100 text-purple-800' :
                    (item as Product).category === 'beverage' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {item.type === 'dish' ? 'Cardápio' : categories.find(c => c.value === (item as Product).category)?.label}
                  </span>
                </div>
                
                {item.type === 'dish' && (item as Dish).description && (
                  <p className="text-sm text-gray-600 mb-3">{(item as Dish).description}</p>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-green-600">
                    R$ {item.price.toFixed(2)}
                  </span>
                  <button className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cart Section */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Carrinho</h2>
            <ShoppingCart className="w-6 h-6 text-gray-400" />
          </div>

          {cart.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Carrinho vazio</p>
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900 flex-1">{item.name}</h4>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700 ml-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-sm text-gray-600">R$ {item.unitPrice.toFixed(2)} cada</p>
                        <p className="font-semibold text-green-600">R$ {item.total.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xl font-semibold text-gray-900">Total:</span>
                  <span className="text-2xl font-bold text-green-600">R$ {cartTotal.toFixed(2)}</span>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <CreditCard className="w-5 h-5" />
                  <span>Finalizar Venda</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}