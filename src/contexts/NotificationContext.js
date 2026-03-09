import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const timerIdsRef = useRef({});

  useEffect(() => {
    return () => {
      Object.values(timerIdsRef.current).forEach(timerId => clearTimeout(timerId));
    };
  }, []);

  const addNotification = (message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random();
    const notification = {
      id,
      message,
      type, // 'success', 'error', 'warning', 'info'
      duration
    };

    setNotifications(prev => [...prev, notification]);

    // Auto remove notification after duration
    if (duration > 0) {
      const timerId = setTimeout(() => {
        removeNotification(id);
      }, duration);
      timerIdsRef.current[id] = timerId;
    }

    return id;
  };

  const removeNotification = (id) => {
    if (timerIdsRef.current[id]) {
      clearTimeout(timerIdsRef.current[id]);
      delete timerIdsRef.current[id];
    }
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const clearAllNotifications = () => {
    Object.values(timerIdsRef.current).forEach(timerId => clearTimeout(timerId));
    timerIdsRef.current = {};
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        clearAllNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};