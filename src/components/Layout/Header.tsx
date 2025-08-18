import React from 'react';
import { useState, useCallback } from 'react';
import { Bell, LogOut, User, Menu, X, Settings, Trash2, CheckCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NotificationService } from '../../services/notificationService';

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

  const handleDeleteNotification = (notificationId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    dispatch({ type: 'DELETE_NOTIFICATION', payload: notificationId });
  };

  const handleMarkAllAsRead = useCallback(() => {
    if (state.currentUser) {
      dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ', payload: state.currentUser.id });
    }
  }, [state.currentUser, dispatch]);

  // Handle admin broadcast notifications
  const handleBroadcastAnnouncement = useCallback(async () => {
    if (state.currentUser?.role !== 'admin') return;
    
    const title = prompt('📢 Announcement Title:');
    if (!title) return;
    
    const message = prompt('📢 Announcement Message:');
    if (!message) return;
    
    const targetAudience = prompt('🎯 Target Audience (all/wholesalers/retailers/support) or leave empty for all:') || 'all';
    
    let targetRoles: string[] = [];
    if (targetAudience !== 'all') {
      targetRoles = targetAudience.split(',').map(role => role.trim());
    }
    
    // Dispatch broadcast notification
    dispatch({
      type: 'BROADCAST_NOTIFICATION',
      payload: {
        title: `📢 ${title}`,
        message,
        type: 'system',
        priority: 'high',
        targetRoles: targetRoles.length > 0 ? targetRoles : undefined
      }
    });
    
    // Send push notification
    await NotificationService.sendBroadcastNotification(title, message, targetRoles.length > 0 ? targetRoles : undefined);
    
    alert('📢 Announcement sent successfully!');
  }, [state.currentUser, dispatch]);
  const notifications = getNotifications();
  const unreadNotifications = notifications.filter(n => !n.read).slice(0, 10); // Limit to 10 most recent
  const allNotifications = notifications.slice(0, 20); // Show up to 20 total notifications

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
          {/* Admin Broadcast Button */}
          {state.currentUser?.role === 'admin' && (
            <button
              onClick={handleBroadcastAnnouncement}
              className="p-3 lg:p-4 text-purple-600 hover:text-purple-900 hover:bg-purple-50 rounded-xl lg:rounded-2xl transition-all duration-200 hover:shadow-md active:scale-95"
              title="Send Announcement"
            >
              <Settings className="w-5 h-5 lg:w-6 lg:h-6" />
            </button>
          )}

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
                <div className="absolute right-0 top-full mt-3 w-80 sm:w-96 lg:w-[28rem] bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200/50 z-20 max-h-[32rem] overflow-hidden
                  max-sm:fixed max-sm:inset-x-3 max-sm:right-3 max-sm:left-3 max-sm:w-auto max-sm:max-w-none">
                  <div className="p-4 border-b border-gray-100/50 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-gray-900 text-lg">Notifications</h3>
                      <div className="flex items-center gap-2">
                        {unreadNotifications.length > 0 && (
                          <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            {unreadNotifications.length}
                          </span>
                        )}
                        <button
                          onClick={() => setShowNotifications(false)}
                          className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-white/50 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {allNotifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium">All caught up!</p>
                      <p className="text-sm text-gray-400 mt-2">No notifications yet</p>
                    </div>
                  ) : (
                    <div className="overflow-y-auto max-h-80">
                      {/* Unread Notifications */}
                      {unreadNotifications.length > 0 && (
                        <div className="bg-blue-50/50 px-4 py-2 border-b border-gray-100">
                          <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                            New ({unreadNotifications.length})
                          </p>
                        </div>
                      )}
                      {unreadNotifications.map((notification) => (
                        <div 
                          key={notification.id} 
                          className="px-4 py-3 hover:bg-blue-50/50 border-b border-gray-100 cursor-pointer transition-all duration-200 group relative"
                          onClick={() => handleNotificationClick(notification.id)}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 shadow-sm ${
                            <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
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
                              <p className="text-sm font-semibold text-gray-900 mb-1">
                                {notification.title}
                              </p>
                              <p className="text-sm text-gray-700 leading-5 break-words">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {notification.time}
                              </p>
                              {notification.priority === 'urgent' && (
                                <span className="inline-block mt-1 px-2 py-0.5 bg-red-100 text-red-800 text-xs font-bold rounded-full">
                                  URGENT
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => handleDeleteNotification(notification.id, e)}
                                className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
                                title="Delete notification"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {/* Read Notifications */}
                      {allNotifications.filter(n => n.read).length > 0 && (
                        <>
                          <div className="bg-gray-50 px-4 py-2 border-b border-gray-100">
                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                              Earlier
                            </p>
                          </div>
                          {allNotifications.filter(n => n.read).slice(0, 10).map((notification) => (
                            <div 
                              key={notification.id} 
                              className="px-4 py-3 hover:bg-gray-50/50 border-b border-gray-100 cursor-pointer transition-all duration-200 group relative opacity-75"
                              onClick={() => handleNotificationClick(notification.id)}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 opacity-50 ${
                                  notification.type === 'order' ? 'bg-blue-400' :
                                  notification.type === 'promotion' ? 'bg-purple-400' :
                                  notification.type === 'support' ? 'bg-orange-400' :
                                  notification.type === 'return' ? 'bg-yellow-400' :
                                  notification.type === 'user' ? 'bg-green-400' :
                                  'bg-gray-400'
                                }`}></div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-700 mb-1">
                                    {notification.title}
                                  </p>
                                  <p className="text-sm text-gray-600 leading-5 break-words line-clamp-2">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {notification.time}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={(e) => handleDeleteNotification(notification.id, e)}
                                    className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
                                    title="Delete notification"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  )}
                  
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
                  {allNotifications.length > 0 && (
                    <div className="p-3 border-t border-gray-100/50 bg-gray-50/50">
                      <div className="flex gap-2">
                        {unreadNotifications.length > 0 && (
                          <button 
                            onClick={handleMarkAllAsRead}
                            className="flex-1 text-center text-sm text-blue-600 hover:text-blue-800 font-medium py-2 rounded-lg hover:bg-blue-50 transition-all duration-200 flex items-center justify-center gap-1"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Mark all read
                          </button>
                        )}
                        <button
                          onClick={() => setShowNotifications(false)}
                          className="flex-1 text-center text-sm text-gray-600 hover:text-gray-800 font-medium py-2 rounded-lg hover:bg-gray-100 transition-all duration-200"
                        >
                          Close
                        </button>
                      </div>
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