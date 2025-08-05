import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LoginForm } from './components/Auth/LoginForm';
import { Header } from './components/Layout/Header';
import { Sidebar } from './components/Layout/Sidebar';
import { MobileSidebar } from './components/Layout/MobileSidebar';
import { WholesalerDashboard } from './components/Dashboards/WholesalerDashboard';
import { RetailerDashboard } from './components/Dashboards/RetailerDashboard';
import { AdminDashboard } from './components/Dashboards/AdminDashboard';
import { SupportDashboard } from './components/Dashboards/SupportDashboard';

function AppContent() {
  const { state } = useApp();
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  if (!state.currentUser) {
    return <LoginForm />;
  }

  const renderDashboard = () => {
    switch (state.currentUser.role) {
      case 'wholesaler':
        return <WholesalerDashboard activeTab={activeTab} />;
      case 'retailer':
        return <RetailerDashboard activeTab={activeTab} />;
      case 'admin':
        return <AdminDashboard activeTab={activeTab} />;
      case 'support':
        return <SupportDashboard activeTab={activeTab} />;
      default:
        return <div>Invalid user role</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 overflow-x-hidden">
      <Header 
        onMobileMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        isMobileSidebarOpen={isMobileSidebarOpen}
      />
      <div className="flex min-h-0">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
        
        {/* Mobile Sidebar */}
        <MobileSidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
        />
        
        <main className="flex-1 p-3 sm:p-4 lg:p-8 min-w-0 overflow-x-hidden">
          {renderDashboard()}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;