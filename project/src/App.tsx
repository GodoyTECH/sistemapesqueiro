import React, { useState } from 'react';
import { useAuthStore } from './stores/authStore';
import { LoginForm } from './components/Auth/LoginForm';
import { Header } from './components/Layout/Header';
import { Sidebar } from './components/Layout/Sidebar';
import { Dashboard } from './components/Dashboard/Dashboard';
import { ProductsManager } from './components/Products/ProductsManager';
import { POSSystem } from './components/POS/POSSystem';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  const handleMenuClick = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'pos':
        return <POSSystem />;
      case 'products':
        return <ProductsManager />;
      case 'tickets':
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Comandas</h1>
            <p className="text-gray-600">Sistema de comandas em desenvolvimento...</p>
          </div>
        );
      case 'dishes':
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Cardápio</h1>
            <p className="text-gray-600">Gestão de pratos em desenvolvimento...</p>
          </div>
        );
      case 'lakes':
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Lagos</h1>
            <p className="text-gray-600">Gestão de lagos em desenvolvimento...</p>
          </div>
        );
      case 'fish':
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Espécies de Peixe</h1>
            <p className="text-gray-600">Gestão de espécies em desenvolvimento...</p>
          </div>
        );
      case 'stock':
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Estoque</h1>
            <p className="text-gray-600">Controle de estoque em desenvolvimento...</p>
          </div>
        );
      case 'reports':
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Relatórios</h1>
            <p className="text-gray-600">Sistema de relatórios em desenvolvimento...</p>
          </div>
        );
      case 'users':
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Usuários</h1>
            <p className="text-gray-600">Gestão de usuários em desenvolvimento...</p>
          </div>
        );
      case 'settings':
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Configurações</h1>
            <p className="text-gray-600">Configurações do sistema em desenvolvimento...</p>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onMenuClick={handleMenuClick} />
      
      <div className="flex">
        <Sidebar 
          isOpen={sidebarOpen} 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />
        
        {/* Main Content */}
        <main className="flex-1 md:ml-64 min-h-[calc(100vh-4rem)]">
          {/* Overlay for mobile when sidebar is open */}
          {sidebarOpen && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
          
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;