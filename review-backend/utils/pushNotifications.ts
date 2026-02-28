import webpush from 'web-push';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:akrmwaseem@riviewit.com',
  process.env.VAPID_PUBLIC_KEY || '',
  process.env.VAPID_PRIVATE_KEY || ''
);

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  data?: any;
}

export async function sendPushNotification(userId: number, payload: NotificationPayload) {
  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId, isActive: true }
  });

  let sent = 0, failed = 0;

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth }
        },
        JSON.stringify({
          title: payload.title,
          body: payload.body,
          icon: payload.icon || '/icons/web-app-manifest-192x192.png',
          data: payload.data || {}
        })
      );
      sent++;
    } catch (error: any) {
      failed++;
      if (error.statusCode === 410) {
        await prisma.pushSubscription.update({
          where: { id: sub.id },
          data: { isActive: false }
        });
      }
    }
  }

  return { success: sent > 0, sentCount: sent, failedCount: failed };
}

export async function sendBulkNotification(userIds: number[], payload: NotificationPayload) {
  const results = await Promise.all(
    userIds.map(userId => sendPushNotification(userId, payload))
  );
  
  return {
    totalUsers: userIds.length,
    totalSent: results.reduce((sum, r) => sum + r.sentCount, 0),
    totalFailed: results.reduce((sum, r) => sum + r.failedCount, 0)
  };
}
