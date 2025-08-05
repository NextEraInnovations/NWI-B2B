import React from 'react';
import { useState, useCallback } from 'react';
import { Bell, LogOut, User, Menu, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface HeaderProps {
  onMobileMenuToggle: () => void;
  isMobileSidebarOpen: boolean;
}

export function Header({ onMobileMenuToggle, isMobileSidebarOpen }: HeaderProps) {
  const { state, dispatch } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);
  const [readNotifications, setReadNotifications] = useState<Set<string>>(new Set());

  const handleLogout = () => {
    dispatch({ type: 'SET_USER', payload: null });
  };

  const getNotifications = () => {
    const notifications = [];
    const currentUser = state.currentUser;
    
    if (currentUser?.role === 'wholesaler') {
      // Wholesaler notifications
      const pendingOrders = state.orders.filter(o => o.wholesalerId === currentUser.id && o.status === 'pending');
      const myTickets = state.tickets.filter(t => t.userId === currentUser.id && t.status !== 'closed');
      
      pendingOrders.forEach(order => {
        notifications.push({
          id: `order-${order.id}`,
          message: `New order #${order.id} received - R${order.total}`,
          time: new Date(order.createdAt).toLocaleTimeString(),
          type: 'order'
        });
      });
      
      myTickets.forEach(ticket => {
        if (ticket.status === 'in_progress') {
          notifications.push({
            id: `ticket-${ticket.id}`,
            message: `Support ticket #${ticket.id} is being processed`,
            time: new Date(ticket.updatedAt).toLocaleTimeString(),
            type: 'support'
          });
        }
      });
    } else if (currentUser?.role === 'retailer') {
      // Retailer notifications
      const myOrders = state.orders.filter(o => o.retailerId === currentUser.id);
      const readyOrders = myOrders.filter(o => o.status === 'ready');
      const acceptedOrders = myOrders.filter(o => o.status === 'accepted');
      
      readyOrders.forEach(order => {
        notifications.push({
          id: `ready-${order.id}`,
          message: `Order #${order.id} is ready for pickup!`,
          time: new Date(order.updatedAt).toLocaleTimeString(),
          type: 'order'
        });
      });
      
      acceptedOrders.forEach(order => {
        notifications.push({
          id: `accepted-${order.id}`,
          message: `Order #${order.id} has been accepted`,
          time: new Date(order.updatedAt).toLocaleTimeString(),
          type: 'order'
        });
      });
    } else if (currentUser?.role === 'admin') {
      // Admin notifications
      const pendingPromotions = state.promotions.filter(p => p.status === 'pending');
      const openTickets = state.tickets.filter(t => t.status === 'open');
      
      pendingPromotions.forEach(promo => {
        notifications.push({
          id: `promo-${promo.id}`,
          message: `New promotion "${promo.title}" awaiting approval`,
          time: new Date(promo.submittedAt).toLocaleTimeString(),
          type: 'promotion'
        });
      });
      
      if (openTickets.length > 0) {
        notifications.push({
          id: 'tickets-summary',
          message: `${openTickets.length} support tickets need attention`,
          time: 'Now',
          type: 'support'
        });
      }
    } else if (currentUser?.role === 'support') {
      // Support notifications
      const urgentTickets = state.tickets.filter(t => t.priority === 'urgent' && t.status === 'open');
      const highTickets = state.tickets.filter(t => t.priority === 'high' && t.status === 'open');
      
      urgentTickets.forEach(ticket => {
        notifications.push({
          id: `urgent-${ticket.id}`,
          message: `URGENT: ${ticket.subject} - ${ticket.userName}`,
          time: new Date(ticket.createdAt).toLocaleTimeString(),
          type: 'urgent'
        });
      });
      
      if (highTickets.length > 0) {
        notifications.push({
          id: 'high-priority',
          message: `${highTickets.length} high priority tickets pending`,
          time: 'Now',
          type: 'support'
        });
      }
    }
    
    return notifications.slice(0, 5); // Show max 5 notifications
  };

  const handleMarkAllAsRead = useCallback(() => {
    const notifications = getNotifications();
    const notificationIds = new Set(notifications.map(n => n.id));
    setReadNotifications(notificationIds);
    setShowNotifications(false);
  }, [state]);

  const notifications = getNotifications();
  const unreadNotifications = notifications.filter(n => !readNotifications.has(n.id));

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'wholesaler': return 'bg-green-100 text-green-800';
      case 'retailer': return 'bg-orange-100 text-orange-800';
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'support': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!state.currentUser) return null;

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200/50 px-3 sm:px-4 lg:px-6 py-3 sm:py-4 sticky top-0 z-40 shadow-sm">
      <div className="flex items-center justify-between min-w-0">
        <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 min-w-0 flex-1">
          {/* Mobile Menu Button */}
          <button
            onClick={onMobileMenuToggle}
            className="lg:hidden p-1.5 sm:p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 flex-shrink-0"
          >
            {isMobileSidebarOpen ? (
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            ) : (
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            )}
          </button>
          
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
            <span className="text-white font-bold text-sm sm:text-base lg:text-lg">N</span>
          </div>
          <div className="hidden sm:block min-w-0 flex-1">
            <h1 className="text-base sm:text-lg lg:text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent truncate">NWI B2B</h1>
            <p className="text-xs lg:text-sm text-gray-500 truncate">
              Connecting wholesalers to retailers digitally
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-6 flex-shrink-0">
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 sm:p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg sm:rounded-xl transition-all duration-200 hover:shadow-md"
            >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              {unreadNotifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center shadow-lg animate-pulse">
                  {unreadNotifications.length}
                </span>
              )}
            </button>
            
            {showNotifications && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowNotifications(false)}
                ></div>
                <div className="absolute right-0 top-full mt-2 sm:mt-3 w-80 sm:w-96 lg:w-[28rem] bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-2xl border border-gray-200/50 z-20 max-h-80 sm:max-h-96 overflow-y-auto
                  max-sm:fixed max-sm:inset-x-2 max-sm:right-2 max-sm:left-2 max-sm:w-auto max-sm:max-w-none">
                  <div className="p-6 border-b border-gray-100/50">
                    <h3 className="font-bold text-gray-900 text-lg">Notifications</h3>
                  </div>
                  
                  {unreadNotifications.length === 0 ? (
                    <div className="p-6 sm:p-8 text-center text-gray-500">
                      <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-base sm:text-lg font-medium">No new notifications</p>
                    </div>
                  ) : (
                    <div className="py-2 sm:py-3">
                      {unreadNotifications.map((notification, index) => (
                        <div 
                          key={notification.id} 
                          className="px-4 sm:px-6 py-3 sm:py-4 hover:bg-gray-50/50 border-b border-gray-50 last:border-b-0 cursor-pointer transition-all duration-200"
                        >
                          <div className="flex items-start gap-2 sm:gap-3">
                            <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 shadow-sm ${
                              notification.type === 'urgent' ? 'bg-red-500' :
                              notification.type === 'order' ? 'bg-blue-500' :
                              notification.type === 'promotion' ? 'bg-purple-500' :
                              notification.type === 'support' ? 'bg-orange-500' :
                              'bg-gray-400'
                            }`}></div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs sm:text-sm text-gray-900 font-semibold leading-4 sm:leading-5 break-words">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-1 flex-shrink-0">
                                {notification.time}
                              </p>
                            </div>
                            <div className="text-xs text-gray-300 font-bold bg-gray-100 rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center flex-shrink-0">
                              {index + 1}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {unreadNotifications.length > 0 && (
                    <div className="p-3 sm:p-4 border-t border-gray-100/50">
                      <button 
                        onClick={handleMarkAllAsRead}
                        className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-semibold py-2 sm:py-3 rounded-lg hover:bg-blue-50 transition-all duration-200"
                      >
                        Mark all as read
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs lg:text-sm font-semibold text-gray-900 truncate max-w-24 sm:max-w-none">
                {state.currentUser.name}
              </p>
              <span className={`inline-block px-2 lg:px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(state.currentUser.role)}`}>
                {state.currentUser.role}
              </span>
            </div>
            <div className="bg-gradient-to-r from-gray-100 to-gray-200 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl flex items-center justify-center shadow-md">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            </div>
          </div>

          <div className="flex items-center">
            <button
              onClick={handleLogout}
              className="p-2 sm:p-3 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg sm:rounded-xl transition-all duration-200 hover:shadow-md"
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}