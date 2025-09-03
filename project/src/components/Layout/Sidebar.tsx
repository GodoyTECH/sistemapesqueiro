import { 
  Home, 
  Package, 
  ChefHat, 
  Receipt, 
  Calculator, 
  Fish, 
  BarChart3, 
  Users, 
  Settings,
  Waves,
  ShoppingCart
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

interface SidebarProps {
  isOpen: boolean;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Sidebar({ isOpen, activeTab, onTabChange }: SidebarProps) {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, adminOnly: false },
    { id: 'pos', label: 'PDV', icon: Calculator, adminOnly: false },
    { id: 'tickets', label: 'Comandas', icon: Receipt, adminOnly: false },
    { id: 'products', label: 'Produtos', icon: Package, adminOnly: true },
    { id: 'dishes', label: 'Cardápio', icon: ChefHat, adminOnly: true },
    { id: 'lakes', label: 'Lagos', icon: Waves, adminOnly: true },
    { id: 'fish', label: 'Espécies', icon: Fish, adminOnly: true },
    { id: 'stock', label: 'Estoque', icon: ShoppingCart, adminOnly: true },
    { id: 'reports', label: 'Relatórios', icon: BarChart3, adminOnly: false },
    { id: 'users', label: 'Usuários', icon: Users, adminOnly: true },
    { id: 'settings', label: 'Configurações', icon: Settings, adminOnly: true },
  ];

  const visibleItems = menuItems.filter(item => !item.adminOnly || isAdmin);

  return (
    <aside 
      className={`
        fixed top-16 left-0 z-40 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:top-0 md:h-screen
        w-64
      `}
    >
      <nav className="p-4 space-y-2">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`
                w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-left
                ${isActive 
                  ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white shadow-md' 
                  : 'text-gray-600 hover:bg-gray-100'
                }
              `}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}