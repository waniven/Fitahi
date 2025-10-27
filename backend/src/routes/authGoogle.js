const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

const client = new OAuth2Client(process.env.GOOGLE_WEB_CLIENT_ID);

function issueJwt(user) {
    return jwt.sign(
        // payload
        { email: user.email, provider: user.provider || 'local' },
            process.env.JWT_SECRET,
        {
            expiresIn: '7d',
            subject: user._id.toString(),
        }
    );
}

/**
 * POST /api/auth/google
 * body: { id_token }
 */
router.post('/google', async (req, res) => {
    try {
        const { id_token } = req.body;
        if (!id_token) return res.status(400).json({ error: 'Missing id_token' });

        const ticket = await client.verifyIdToken({
            idToken: id_token,
            audience: process.env.GOOGLE_WEB_CLIENT_ID
        });

        const payload = ticket.getPayload();

        if (!payload?.email || !payload.email_verified) {
            return res.status(401).json({ error: 'Google email not verified' });
        }

        const email = payload.email.toLowerCase();
        const googleId = payload.sub;

        //Find by googleId or email to support linking
        let user = await User.findOne({ $or: [{ googleId }, { email }] });

        if (!user) {
            user = await User.create({
                email,
                googleId,
                provider: 'google',
                firstname: payload.given_name || 'New',
                lastname:  payload.family_name || 'User',
                pfp: payload.picture || null
            });
        } else if (!user.googleId) {
            user.googleId = googleId;
            user.provider = 'google';
            if (!user.pfp && payload.picture) user.pfp = payload.picture;
            if (!user.firstname && payload.given_name) user.firstname = payload.given_name;
            if (!user.lastname && payload.family_name) user.lastname = payload.family_name;
            await user.save();
        }

        const token = issueJwt(user);
        res.json({ token, user: { id: user._id, email: user.email, firstname: user.firstname, lastname: user.lastname } });
    } catch (err) {
        console.error('Google auth error', err);
        res.status(401).json({ error: 'Invalid Google token' });
    }
});

module.exports = router;