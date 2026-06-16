// src/hooks/useNotifications.ts
import { useState, useEffect, useCallback } from 'react';
import { getToken, useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';

export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  metadata: string | null;
  createdAt: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { isAuth, isLoading: authLoading } = useAuth();

  const fetchNotifications = useCallback(async () => {
    try {
      const token = getToken();
      if (!isAuth || !token) {
        setNotifications([]);
        setUnreadCount(0);
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setNotifications([]);
          setUnreadCount(0);
          return;
        }
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      // Silently handle errors
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, [isAuth]);

  const markAsRead = useCallback(async (notificationIds: number[]) => {
    try {
      const token = getToken();
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/notifications`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationIds }),
      });

      if (response.ok) {
        // Update local state
        setNotifications((prev) =>
          prev.map((n) =>
            notificationIds.includes(n.id) ? { ...n, isRead: true } : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - notificationIds.length));
      }
    } catch (err) {
      // Silently handle errors
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n.id);
    if (unreadIds.length > 0) {
      await markAsRead(unreadIds);
    }
  }, [notifications, markAsRead]);

  useEffect(() => {
    if (!authLoading) {
      if (isAuth && getToken()) {
        fetchNotifications();
      } else {
        setNotifications([]);
        setUnreadCount(0);
        setLoading(false);
      }
    }
  }, [isAuth, authLoading, fetchNotifications]);

  // Poll every 60 seconds for new notifications
  useEffect(() => {
    if (!isAuth || authLoading) return;

    const interval = setInterval(() => {
      if (isAuth && getToken()) {
        fetchNotifications();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [isAuth, authLoading, fetchNotifications]);

  return { notifications, unreadCount, loading, markAsRead, markAllAsRead, refetch: fetchNotifications };
};
