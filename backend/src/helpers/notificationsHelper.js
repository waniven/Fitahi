const { Expo } = require('expo-server-sdk');
const User = require('../models/User.js');

const expo = new Expo();

/**
 * Send a notification to a single user
 * {String} userId - MongoDB user ID
 * {String} message - Notification body
 */
async function sendPushNotificationToUser(userId, message) {
    try {
        const user = await User.findById(userId);
        if (!user || !user.pushToken) return;

        if (!Expo.isExpoPushToken(user.pushToken)) {
            console.log(`Invalid Expo push token for user ${userId}: ${user.pushToken}`);
            return;
        }

        const messages = [{
            to: user.pushToken,
            sound: 'default',
            body: message,
            data: { userId },
        }];

        const chunks = expo.chunkPushNotifications(messages);
        for (let chunk of chunks) {
            try {
                await expo.sendPushNotificationsAsync(chunk);
            } catch (err) {
                console.error(err);
            }
        }

        console.log(`Notification sent to user ${userId}`);
    } catch (err) {
        console.error('Error sending notification:', err);
    }
}

/**
 * Send notification to multiple users
 * {Array<String>} userIds
 * {String} message
 */
async function sendPushNotificationToUsers(userIds, message) {
    for (const id of userIds) {
        await sendPushNotificationToUser(id, message);
    }
}

module.exports = {
    sendPushNotificationToUser,
    sendPushNotificationToUsers,
};
