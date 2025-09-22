import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// This sets how notifications are handled when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// 1. Function to request permissions
export async function registerForPushNotificationsAsync() {
  let token;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    alert('Failed to get push token for push notification!');
    return;
  }
  
  // This is where you would get the token for sending PUSH notifications
  // For now, we are only using local notifications, so we just need permission.
  console.log("Notification permissions granted.");
  return true;
}

// 2. Function to schedule a "Smart Nudge"
export async function scheduleNudge(title, body, seconds) {
    console.log(`Scheduling nudge: "${title}" in ${seconds} seconds.`);
    await Notifications.scheduleNotificationAsync({
        content: {
            title: title,
            body: body,
        },
        trigger: {
            seconds: seconds,
        },
    });
}