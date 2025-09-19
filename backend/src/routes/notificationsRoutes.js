const express = require('express');
const auth = require('../middleware/auth.js');
const { sendPushNotificationToUser } = require('../helpers/notificationsHelper.js');

const router = express.Router();

/**
 * POST /api/notifications/test
 * body: { message: "Hello" }
 */
router.post('/test', auth, async (req, res) => {
    try {
        const { message } = req.body;
        const userId = req.user.id;

        await sendPushNotificationToUser(userId, message);
        return res.json({ success: true, message: 'Notification sent!' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to send notification' });
    }
});

module.exports = router;
