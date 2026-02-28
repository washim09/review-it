// Push Notification Utilities for PWA
import { API_BASE_URL } from '../config/api';

interface PushSubscriptionJSON {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export class PushNotificationManager {
  private static instance: PushNotificationManager;
  private swRegistration: ServiceWorkerRegistration | null = null;

  private constructor() {}

  static getInstance(): PushNotificationManager {
    if (!PushNotificationManager.instance) {
      PushNotificationManager.instance = new PushNotificationManager();
    }
    return PushNotificationManager.instance;
  }

  async initialize(registration: ServiceWorkerRegistration): Promise<void> {
    this.swRegistration = registration;
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission;
    }

    return Notification.permission;
  }

  async subscribe(userId: number): Promise<PushSubscriptionJSON | null> {
    try {
      const permission = await this.requestPermission();
      
      if (permission !== 'granted') {
        return null;
      }

      if (!this.swRegistration) {
        console.error('Service Worker not registered');
        return null;
      }

      // Check if already subscribed
      let subscription = await this.swRegistration.pushManager.getSubscription();

      if (!subscription) {
        // Subscribe to push notifications with VAPID public key
        const vapidPublicKey = 'BCfHV1n4S-kvCKntHmV7XC3QANHfydpuGb7Ox0ECyPa6mm4qqn3_XRh3CL40SneLTWl1f2xMnMEmjHDRkBwHOZg';
        
        subscription = await this.swRegistration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey) as BufferSource
        });
      }

      // Send subscription to backend
      const subscriptionJSON = subscription.toJSON() as PushSubscriptionJSON;
      await this.sendSubscriptionToBackend(userId, subscriptionJSON);

      return subscriptionJSON;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }

  async unsubscribe(userId: number): Promise<boolean> {
    try {
      if (!this.swRegistration) {
        return false;
      }

      const subscription = await this.swRegistration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        await this.removeSubscriptionFromBackend(userId);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      return false;
    }
  }

  async isSubscribed(): Promise<boolean> {
    if (!this.swRegistration) {
      return false;
    }

    const subscription = await this.swRegistration.pushManager.getSubscription();
    return subscription !== null;
  }

  private async sendSubscriptionToBackend(
    userId: number,
    subscription: PushSubscriptionJSON
  ): Promise<void> {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${API_BASE_URL}/api/push/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId,
          subscription
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save subscription to backend');
      }
    } catch (error) {
      console.error('Error sending subscription to backend:', error);
      throw error;
    }
  }

  private async removeSubscriptionFromBackend(userId: number): Promise<void> {
    try {
      const token = localStorage.getItem('authToken');
      
      await fetch(`${API_BASE_URL}/api/push/unsubscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId })
      });
    } catch (error) {
      console.error('Error removing subscription from backend:', error);
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  }

  async showNotification(
    title: string,
    options?: NotificationOptions
  ): Promise<void> {
    if (!this.swRegistration) {
      console.error('Service Worker not registered');
      return;
    }

    if (Notification.permission !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }

    await this.swRegistration.showNotification(title, {
      badge: '/icons/icon-96x96.png',
      icon: '/icons/icon-192x192.png',
      ...options
    });
  }
}

export const pushNotificationManager = PushNotificationManager.getInstance();
