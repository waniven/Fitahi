const express = require('express');
const mongoose = require('mongoose');
const otp = require("../helpers/otpStore");
const resetEmail = require('..//helpers/sendEmail');
const User = require('../models/User');

const router = express.Router();

/*
 * POST /api/rest/
 * send recovery email
 * body: { email }
*/
router.post('/', async (req, res, next) => {
    try {
        //get email from request
        const email = req.body;

        //validate email exsists
        const user = await User.find(email);

        //send email
        if (email) {
            resetEmail.sendEmail(email);
        }
        
        //empty sucess response no matter if user is found
        return res.status(201);
    } catch (err) {
        return next(err);
    }
});

/*
 * POST /api/rest/
 * reset email
 * body: { otp, password }
*/
router.post('/', async (req, res, next) => {
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
        
        return res.status(201);
    } catch (err) {
        return next(err);
    }
});

module.exports = router;