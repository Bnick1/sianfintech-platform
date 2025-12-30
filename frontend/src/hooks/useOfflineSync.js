// src/hooks/useOfflineSync.js
import { useState, useEffect } from 'react';

export const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSync, setPendingSync] = useState([]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const syncData = async (collection, data) => {
    if (isOnline) {
      // Send to server
      try {
        const response = await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ collection, data })
        });
        return await response.json();
      } catch (error) {
        // Fallback to offline storage
        storeOffline(collection, data);
        return { success: false, storedOffline: true };
      }
    } else {
      // Store offline
      storeOffline(collection, data);
      return { success: true, storedOffline: true };
    }
  };

  const storeOffline = (collection, data) => {
    const key = `offline_${collection}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    const updated = [...existing, { ...data, syncId: Date.now() }];
    localStorage.setItem(key, JSON.stringify(updated));
    setPendingSync(updated);
  };

  const getOfflineData = (collection) => {
    const key = `offline_${collection}`;
    return JSON.parse(localStorage.getItem(key) || '[]');
  };

  return {
    isOnline,
    pendingSync,
    syncData,
    getOfflineData
  };
};