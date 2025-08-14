import React from 'react';
import { useState, useCallback } from 'react';
import { Bell, LogOut, User, Menu, X, Settings, Wifi, WifiOff } from 'lucide-react';
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
    
    if (!currentUser) return [];
    
    // Get notifications for current user
    const userNotifications = state.notifications.filter(notification => {
      // Show notifications for current user, or role-based notifications
      return notification.userId === currentUser.id || 
             (notification.userId === 'admin' && currentUser.role === 'admin') ||
             (notification.userId === 'support' && (currentUser.role === 'support' || currentUser.role === 'admin')) ||
             (notification.userId === 'system') ||
             (notification.userId === 'all');
    });
    
    // Sort by priority and creation date
    const sortedNotifications = userNotifications.sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.priority] || 1;
      const bPriority = priorityOrder[b.priority] || 1;
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority; // Higher priority first
      }
      
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); // Newer first
    });
    
    // Convert to display format
    return sortedNotifications.map(notification => ({
      id: notification.id,
      message: notification.message,
      time: new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: notification.type,
      priority: notification.priority,
      read: notification.read,
      title: notification.title,
      data: notification.data
    }));
  };

  const handleNotificationClick = (notificationId: string) => {
    // Mark notification as read
    dispatch({ type: 'MARK_NOTIFICATION_READ', payload: notificationId });
    
    // Optional: Navigate to relevant section based on notification type
    const notification = state.notifications.find(n => n.id === notificationId);
    if (notification?.data) {
      // You could add navigation logic here based on notification type
      console.log('Notification clicked:', notification);
    }
  };

  const handleMarkAllAsRead = useCallback(() => {
    if (state.currentUser) {
      dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ', payload: state.currentUser.id });
    }
    setShowNotifications(false);
  }, [state.currentUser, dispatch]);

  const notifications = getNotifications();
  const unreadNotifications = notifications.filter(n => !n.read);

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
    <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200/50 px-3 sm:px-4 lg:px-6 xl:px-8 py-3 sm:py-4 sticky top-0 z-40 shadow-sm">
      <div className="flex items-center justify-between min-w-0">
        <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 xl:space-x-6 min-w-0 flex-1">
          {/* Mobile Menu Button */}
          <button
            onClick={onMobileMenuToggle}
            className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200 flex-shrink-0 active:scale-95"
          >
            {isMobileSidebarOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
          
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
            <span className="text-white font-bold text-base sm:text-lg lg:text-xl xl:text-2xl">N</span>
          </div>
          <div className="hidden sm:block min-w-0 flex-1">
            <h1 className="text-lg lg:text-xl xl:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent truncate">NWI B2B</h1>
            <p className="text-sm lg:text-base xl:text-lg text-gray-500 truncate font-medium">
              Connecting wholesalers to retailers digitally
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 sm:space-x-4 lg:space-x-6 xl:space-x-8 flex-shrink-0">
          {/* Connection Status Indicator */}
          <div className="flex items-center">
            {state.isConnected ? (
              <div className="flex items-center gap-2 text-green-600">
                <Wifi className="w-4 h-4" />
                <span className="text-xs font-medium hidden sm:inline">Live</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-600">
                <WifiOff className="w-4 h-4" />
                <span className="text-xs font-medium hidden sm:inline">Offline</span>
              </div>
            )}
          </div>

          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-3 lg:p-4 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl lg:rounded-2xl transition-all duration-200 hover:shadow-md active:scale-95"
            >
            <Bell className="w-5 h-5 lg:w-6 lg:h-6" />
              {unreadNotifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full w-6 h-6 lg:w-7 lg:h-7 flex items-center justify-center shadow-lg animate-pulse">
                  {unreadNotifications.length > 99 ? '99+' : unreadNotifications.length}
                </span>
              )}
            </button>
            
            {showNotifications && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowNotifications(false)}
                ></div>
                <div className="absolute right-0 top-full mt-3 w-80 sm:w-96 lg:w-[32rem] xl:w-[36rem] bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200/50 z-20 max-h-96 lg:max-h-[32rem] overflow-y-auto
                  max-sm:fixed max-sm:inset-x-3 max-sm:right-3 max-sm:left-3 max-sm:w-auto max-sm:max-w-none">
                  <div className="p-6 border-b border-gray-100/50">
                    <h3 className="font-bold text-gray-900 text-lg lg:text-xl">Notifications</h3>
                  </div>
                  
                  {unreadNotifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <Bell className="w-16 h-16 mx-auto mb-6 text-gray-300" />
                      <p className="text-lg lg:text-xl font-medium">All caught up!</p>
                      <p className="text-base text-gray-400 mt-3">No new notifications</p>
                    </div>
                  ) : (
                    <div className="py-3">
                      {unreadNotifications.map((notification, index) => (
                        <div 
                          key={notification.id} 
                          className="px-6 py-4 hover:bg-gray-50/50 border-b border-gray-50 last:border-b-0 cursor-pointer transition-all duration-200 active:bg-gray-100/50"
                          onClick={() => handleNotificationClick(notification.id)}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 shadow-sm ${
                              notification.priority === 'urgent' ? 'bg-red-500 animate-pulse' :
                              notification.priority === 'high' ? 'bg-orange-500' :
                              notification.type === 'order' ? 'bg-blue-500' :
                              notification.type === 'promotion' ? 'bg-purple-500' :
                              notification.type === 'support' ? 'bg-orange-500' :
                              notification.type === 'return' ? 'bg-yellow-500' :
                              notification.type === 'user' ? 'bg-green-500' :
                              'bg-gray-400'
                            }`}></div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm lg:text-base font-bold text-gray-900 mb-2">
                                {notification.title}
                              </p>
                              <p className="text-sm lg:text-base text-gray-900 font-medium leading-5 lg:leading-6 break-words">
                                {notification.message}
                              </p>
                              <p className="text-sm text-gray-400 mt-2 flex-shrink-0">
                                {notification.time}
                              </p>
                              {notification.priority === 'urgent' && (
                                <span className="inline-block mt-2 px-3 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full">
                                  URGENT
                                </span>
                              )}
                            </div>
                            {!notification.read && (
                              <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {unreadNotifications.length > 0 && (
                    <div className="p-4 border-t border-gray-100/50">
                      <button 
                        onClick={handleMarkAllAsRead}
                        className="w-full text-center text-base text-blue-600 hover:text-blue-800 font-semibold py-3 rounded-xl hover:bg-blue-50 transition-all duration-200 active:scale-95"
                      >
                        Mark all as read ({unreadNotifications.length})
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="flex items-center space-x-3 sm:space-x-4 lg:space-x-6">
            <div className="text-right hidden sm:block">
              <p className="text-sm lg:text-base xl:text-lg font-semibold text-gray-900 truncate max-w-32 lg:max-w-none">
                {state.currentUser.name}
              </p>
              <span className={`inline-block px-3 lg:px-4 py-1 lg:py-1.5 rounded-full text-xs lg:text-sm font-semibold ${getRoleBadgeColor(state.currentUser.role)}`}>
                {state.currentUser.role}
              </span>
            </div>
            <div className="bg-gradient-to-r from-gray-100 to-gray-200 w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-md">
              <User className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-gray-600" />
            </div>
          </div>

          <div className="flex items-center">
            <button
              onClick={handleLogout}
              className="p-3 lg:p-4 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl lg:rounded-2xl transition-all duration-200 hover:shadow-md active:scale-95"
            >
              <LogOut className="w-5 h-5 lg:w-6 lg:h-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}