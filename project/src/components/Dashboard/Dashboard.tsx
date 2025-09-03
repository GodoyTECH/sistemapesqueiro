import React from 'react';
import { 
  TrendingUp, 
  Users, 
  Fish, 
  DollarSign, 
  ShoppingCart, 
  AlertTriangle,
  Clock,
  Target
} from 'lucide-react';
import { useDataStore } from '../../stores/dataStore';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function Dashboard() {
  const { products, tickets, cashRegister } = useDataStore();
  
  // Calcular métricas
  const lowStockProducts = products.filter(p => p.stock <= p.minStock && p.active);
  const todayTickets = tickets.filter(t => {
    const today = new Date();
    const ticketDate = new Date(t.openedAt);
    return ticketDate.toDateString() === today.toDateString();
  });
  const openTickets = tickets.filter(t => t.status === 'open' || t.status === 'consuming');
  const todayRevenue = todayTickets
    .filter(t => t.status === 'closed')
    .reduce((sum, t) => sum + t.total, 0);

  const stats = [
    {
      title: 'Faturamento Hoje',
      value: `R$ ${todayRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-gradient-to-r from-green-500 to-emerald-500',
      change: '+12%',
    },
    {
      title: 'Comandas Abertas',
      value: openTickets.length.toString(),
      icon: Clock,
      color: 'bg-gradient-to-r from-blue-500 to-cyan-500',
      change: `${todayTickets.length} hoje`,
    },
    {
      title: 'Produtos em Falta',
      value: lowStockProducts.length.toString(),
      icon: AlertTriangle,
      color: 'bg-gradient-to-r from-orange-500 to-red-500',
      change: 'Requer atenção',
    },
    {
      title: 'Caixa',
      value: cashRegister?.status === 'open' ? 'Aberto' : 'Fechado',
      icon: Target,
      color: 'bg-gradient-to-r from-purple-500 to-pink-500',
      change: cashRegister ? format(new Date(cashRegister.openedAt), 'HH:mm', { locale: ptBR }) : '--',
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Visão geral do seu pesqueiro</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm text-gray-500">{stat.change}</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tickets */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Comandas Recentes</h2>
          </div>
          <div className="p-6">
            {todayTickets.slice(0, 5).length > 0 ? (
              <div className="space-y-4">
                {todayTickets.slice(0, 5).map((ticket) => (
                  <div key={ticket.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        ticket.status === 'open' ? 'bg-blue-500' :
                        ticket.status === 'consuming' ? 'bg-yellow-500' :
                        ticket.status === 'awaiting_weighing' ? 'bg-orange-500' :
                        'bg-green-500'
                      }`} />
                      <div>
                        <p className="font-medium text-gray-900">{ticket.number}</p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(ticket.openedAt), 'HH:mm', { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">R$ {ticket.total.toFixed(2)}</p>
                      <p className="text-sm text-gray-500 capitalize">{ticket.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhuma comanda hoje</p>
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Products */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Estoque Baixo</h2>
          </div>
          <div className="p-6">
            {lowStockProducts.length > 0 ? (
              <div className="space-y-4">
                {lowStockProducts.slice(0, 5).map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600">{product.stock} {product.unit}</p>
                      <p className="text-sm text-gray-500">Min: {product.minStock}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Estoque em níveis normais</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Nova Comanda', color: 'bg-blue-500 hover:bg-blue-600' },
          { label: 'Abrir Caixa', color: 'bg-green-500 hover:bg-green-600' },
          { label: 'Pesar Peixe', color: 'bg-teal-500 hover:bg-teal-600' },
          { label: 'Relatório', color: 'bg-purple-500 hover:bg-purple-600' },
        ].map((action, index) => (
          <button
            key={index}
            className={`p-4 rounded-lg text-white font-medium transition-colors ${action.color}`}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}