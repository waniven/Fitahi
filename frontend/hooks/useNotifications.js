import * as Notifications from "expo-notifications";
import * as Device from "expo-device";

export async function registerForPushNotificationsAsync() {
    if (!Device.isDevice) {
        console.log("Must use physical device for Push Notifications");
        return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    console.log("Existing status:", existingStatus);

    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        console.log("Request status:", status);
        finalStatus = status;
    }

    if (finalStatus !== "granted") {
        console.log("Permission not granted");
        return null;
    }

    const token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log("Expo Push Token:", token);
    return token;
}
