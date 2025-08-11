import React from 'react';
import { 
  Package, 
  ShoppingCart, 
  BarChart3, 
  Users, 
  Settings, 
  Store,
  Truck,
  MessageSquare,
  CreditCard,
  Tag,
  Clock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const { state } = useApp();

  const getMenuItems = () => {
    const role = state.currentUser?.role;
    
    switch (role) {
      case 'wholesaler':
        return [
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'products', label: 'Products', icon: Package },
          { id: 'orders', label: 'Orders', icon: ShoppingCart },
          { id: 'promotions', label: 'Promotions', icon: Tag },
          { id: 'support', label: 'Support', icon: MessageSquare },
          { id: 'profile', label: 'Profile', icon: Settings }
        ];
      case 'retailer':
        return [
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'browse', label: 'Browse Products', icon: Store },
          { id: 'orders', label: 'My Orders', icon: ShoppingCart },
          { id: 'payments', label: 'Payments', icon: CreditCard },
          { id: 'support', label: 'Support', icon: MessageSquare },
          { id: 'profile', label: 'Profile', icon: Settings }
        ];
      case 'admin':
        return [
          { id: 'overview', label: 'Dashboard', icon: BarChart3 },
          { id: 'users', label: 'Users', icon: Users },
          { id: 'pending-applications', label: 'Applications', icon: Clock },
          { id: 'orders', label: 'All Orders', icon: ShoppingCart },
          { id: 'products', label: 'All Products', icon: Package },
          { id: 'promotions', label: 'Promotions', icon: Tag },
          { id: 'analytics', label: 'Wholesaler Analytics', icon: BarChart3 },
          { id: 'settings', label: 'Settings', icon: Settings }
        ];
      case 'support':
        return [
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'tickets', label: 'Support Tickets', icon: MessageSquare },
          { id: 'returns', label: 'Return Requests', icon: Truck },
          { id: 'orders', label: 'Order Issues', icon: ShoppingCart },
          { id: 'users', label: 'User Support', icon: Users }
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <aside className="bg-white/95 backdrop-blur-sm border-r border-gray-200/50 w-64 xl:w-72 flex-shrink-0 shadow-sm">
      <nav className="p-4 xl:p-6 space-y-2 xl:space-y-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 xl:space-x-4 px-3 xl:px-5 py-3 xl:py-4 rounded-xl text-left transition-all duration-200 font-medium text-sm xl:text-base ${
                activeTab === item.id
                  ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 shadow-md transform scale-105'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm hover:transform hover:scale-102'
              }`}
            >
              <Icon className="w-5 h-5 xl:w-6 xl:h-6 flex-shrink-0" />
              <span className="font-semibold">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}