import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useAuth } from './useAuth';
import { registerDevicePushToken } from '@/services/notificationsService';

// Configure default notification presentation behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function usePushNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (Platform.OS === 'web') return;

    // 1. Request permissions and retrieve device push token
    async function registerForPushNotificationsAsync() {
      try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== 'granted') {
          console.log('Failed to obtain push token permission.');
          return;
        }

        const tokenData = await Notifications.getExpoPushTokenAsync();
        setExpoPushToken(tokenData.data);

        // Associate device token with authenticated user identity
        if (user?.id) {
          await registerDevicePushToken(tokenData.data, user.id);
        }
      } catch (err) {
        console.warn('Error configuring push notifications:', err);
      }
    }

    registerForPushNotificationsAsync();

    // 2. Listener for incoming foreground notifications
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notif) => {
        setNotification(notif);
      }
    );

    // 3. Listener for user tapping on a notification (Deep Linking)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        if (data && typeof data === 'object') {
          if ('screen' in data && typeof data.screen === 'string') {
            router.push(data.screen as any);
          } else if ('link_url' in data && typeof data.link_url === 'string') {
            router.push(data.link_url as any);
          } else if ('meeting_id' in data) {
            router.push('/(tabs)/meetings');
          } else if ('points' in data) {
            router.push('/(tabs)/points');
          } else if ('announcement_id' in data) {
            router.push('/(tabs)/announcements');
          }
        }
      }
    );

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [user?.id, router]);

  return {
    expoPushToken,
    notification,
  };
}
