const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const router = express.Router();

router.post('/login', async (req, res, next) => {
    try {
        //email and password for authentication
        const { email, password } = req.body;

        //check that email and password are present
        if(!email || !password) {
            return res.status(400).json({ error: 'Email and Password required' });
        }

        //find user and include password hash
        const user = await User.findOne({ email: String(email).toLowerCase().trim() }).select('+password');

        //provide generalized error if user not found
        if (!user) {
            return res.status(401).json({ error: 'Invalid Credentials' });
        }

        //checks user input to stored hash
        const correctPWD = await bcrypt.compare(password, user.password);

        //provide generalized error if password dose not match
        if (!correctPWD) {
            return res.status(401).json({ error: 'Invalid Credentials' });
        }

        //create session token
        const jwt_secret = process.env.JWT_SECRET; //JWT secret 
        const jwt_expires = process.env.JWT_EXPIRES; //JWT session expire time
        const payload = { sub:user._id.toString(), email: user.email }; //generates the payload 
        const token = jwt.sign(payload, jwt_secret, { expiresIn: jwt_expires || '1h'}); //create token with signed payload, secrtet, and expire time

        //return token and some profile info
        const {_id, firstname, lastname, dateofbirth } = user.toJSON();
        return res.json({ token, user: { _id, firstname, lastname, dateofbirth ,email: user.email }});
    } catch (err) {
        return next(err);
    }
});

module.exports = router;