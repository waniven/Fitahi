import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

/**
 * Request permissions and get Expo push token
 */
export async function registerForPushNotificationsAsync() {
    let token;

    // Only get a push token on a real device
    if (!Constants.isDevice) {
        console.log('Must use a physical device for Push Notifications');
        return;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
    }

    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('Expo Push Token:', token);
    return token;
}
