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
        const { otp, password } = req.body;

        //validate otp
        

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

module.exports = router;