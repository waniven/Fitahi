const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

//helper to validate MongoDB objectId
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

/*
 * POST /api/users/
 * Create a user
 * body: { name, email, dateofbirth, password }
*/
router.post('/', async (req, res, next) => {
    try {
        //get variables from document
        const { firstname, lastname, email, dateofbirth, password } = req.body;

        //cehck of manditory fields exsist
        if (!firstname || !lastname || !email || !dateofbirth || !password) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        //create a new user 
        const user = await User.create({ firstname, lastname, email, dateofbirth, password });

        //return new user
        return res.status(201).json(user);

    } catch (err) {

        //duplicate email 
        if (err.code === 11000) {
            return res.status(409).json({ error: 'Email already exists' });
        }

        return next(err);
    }
});


/**
 * PATCH /api/users/me
 * Update a user (partial)
 * body: { name, email, dateofbirth, password, pfp }
 * auth needed
 */
router.patch('/me', auth, async (req, res, next) => {
    try {
        //id from users session
        const id = req.user.id;

        //whitelist object, will add allowed fields
        const updates = {};

        //check data type and add to updates whitelist object
        if (typeof req.body.firstname === 'string') updates.firstname = req.body.firstname;
        if (typeof req.body.lastname === 'string') updates.lastname = req.body.lastname;
        if (typeof req.body.email === 'string') updates.email = req.body.email;
        if (typeof req.body.dateofbirth === 'string') updates.dateofbirth = req.body.dateofbirth;
        if (typeof req.body.password === 'string') updates.password = req.body.password;
        if (typeof req.body.pfp === 'string') updates.pfp = req.body.pfp;
        if (typeof req.body.quiz === 'object') updates.quiz = req.body.quiz;

        //check if whitelist object is empty, if so dont update anything
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: 'No valid fields to update' });
        }

        //find and update document in DB
        const updated = await User.findByIdAndUpdate(id, updates, {
            new: true, //returns updated document
            runValidators: true //apply DB schema validaotrs on update
        });

        //not found
        if (!updated) {
            return res.status(404).json({ error: 'User not found' });
        }

        //return updated user document
        return res.json(updated);

    } catch (err) {
        //duplicate email 
        if (err.code === 11000) {
            return res.status(409).json({ error: 'Email already exists' });
        }

        return next(err);
    }
});

/**
 * DELETE /api/users/me
 * Delete a user
 */
router.delete('/me', auth, async (req, res, next) => {
    try {
        //id from users session
        const id = req.user.id;

        //check if id is valid
        if (!isValidId(id)) {
            return res.status(400).json({ error: 'Invalid user id' });
        }

        //finds and deltes user document
        const deleted = await User.findByIdAndDelete(id);

        //return error if user document not found
        if (!deleted) {
            return res.status(404).json({ error: 'User not found' })
        }

        return res.status(204).send();

    } catch (err) {
        return next(err);
    }
});

/**
 * GET /api/me
 * users own profile
 * need to auth their token
**/
router.get('/me', auth, async (req, res, next) => {
    try {
        //get users own profile
        const me = await User.findById(req.user.id);

        //return error if user profile not found
        if (!me) {
            return res.status(404).json({ error: 'User not found' });
        }

        //return users own profile
        return res.json(me);
    } catch (err) {
        return next(err);
    }
});

/**
 * PATCH /api/users/me/quiz
 * save user's sign-up quiz answers
**/
router.patch('/me/quiz', auth, async (req, res, next) => {
    try {
        const id = req.user.id;

        // answers sent from frontend (can be partial due to skippable fields)
        const { quiz } = req.body;

        if (!quiz || typeof quiz !== 'object') {
            return res.status(400).json({ error: 'Invalid quiz data' });
        }

        const updated = await User.findByIdAndUpdate(
            id,
            { $set: { quiz } },
            { new: true, runValidators: true }
        );

        if (!updated) {
            return res.status(404).json({ error: 'User not found' });
        }

        return res.json(updated);
    } catch (err) {
        return next(err);
    }
});

/**
 * POST /api/users/savePushToken
 * save expo push token for current user
 */
router.post('/savePushToken', auth, async (req, res, next) => {
    try {
        const { token } = req.body;
        if (!token) return res.status(400).json({ error: 'No token provided' });

        const userId = req.user.id;
        const updated = await User.findByIdAndUpdate(
            userId,
            { pushToken: token },
            { new: true }
        );

        if (!updated) return res.status(404).json({ error: 'User not found' });

        return res.json({ success: true });
    } catch (err) {
        return next(err);
    }
});

/**
 * GET /api/users/:id
 * Get a single user
 * For testing only
router.get('/:id', async (req, res, next) => {
    try{
        //id obj 
        const { id } = req.params;

        //check if id is valid
        if(!isValidId(id)) {
            return res.status(400).json({ error: 'Invalid user id' });
        }

        //find user document
        const user = await User.findById(id);

        //return error if user not found
        if (!user) {
            return res.status(404).json({ error: 'User not found'})
        }

        //return user document
        return res.json(user);

    } catch (err) {
        return next(err);
    }
});
*/

module.exports = router;