const express = require('express');
const mongoose = require('mongoose');
const otp = require("../helpers/otpStore");
const sendEmail = require('../helpers/sendEmail');
const User = require('../models/User');

const router = express.Router();

/*
 * POST /api/reset/
 * send recovery email
 * body: { email }
*/
router.post('/', async (req, res, next) => {
    try {
        //get email from request
        const { email } = req.body || {};

        //email is null
        if (!email) {
            return res.status(400).json({ error: 'email_required' });
        }

        //validate email exsists
        const user = await User.findOne({ email });

        //send email
        if (user) {
            try {
                await sendEmail(user.email);
            } catch (mailErr) {
                console.error('sendEmail failed:', mailErr);
            }
        }
        
        //sends no content back 
        return res.sendStatus(204);
    } catch (err) {
        return next(err);
    }
});

/*
 * POST /api/reset/password/
 * reset email
 * body: { otp, password }
*/
router.post('/password', async (req, res, next) => {
    try {
        //get opt and new password from request
        const { code, password } = req.body || {};

        //check if password and otp are present
        if (typeof code !== 'string' || typeof password !== 'string') {
            return res.status(400).json({ error: 'OTP and Password required' });
        }

        //validate otp
        const email = otp.verifyPasswordResetOtp(code);

        if (!email) {
            return res.status(400).json({ error: 'Invalid or Expired OTP' });
        }

        const updated = await User.findOneAndUpdate(
            { email },
            { $set: { password: password } }, //set new password
            {
                new: true, //returns updated document
                runValidators: true, // enforce any password validators
            }
        ).select('_id');

        if (!updated) {
            return res.status(404).json({ error: 'user_not_found' });
        }
        
        return res.sendStatus(204); 
    } catch (err) {
        return next(err);
    }
});

module.exports = router;