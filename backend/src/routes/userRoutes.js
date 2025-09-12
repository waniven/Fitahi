const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const validateId = require('../helpers/validateId');

const router = express.Router();

/*
 * POST /api/createUser
 * Create a user
 * body: { name, email, dateofbirth, password }
*/
router.post('/createUser', async (req, res, next) => {
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
        if(err.code === 11000) {
            return res.status(409).json({ error: 'Email already exists' });
        }

        return next(err);
    }
});


/**
 * PATCH /api/updateUser
 * Update a user (partial)
 * body: { name, email, dateofbirth, password }
 * auth needed
 */
router.patch('/updateUser', auth, async (req, res, next) => {
    try{
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

        //check if whitelist object is empty, if so dont update anything
        if(Object.keys(updates).length === 0) {
            return res.status(400).json({ error: 'No valid fields to update' });
        }

        //find and update document in DB
        const updated = await User.findByIdAndUpdate(id, updates, {
            new: true, //returns updated document
            runValidators: true //apply DB schema validaotrs on update
        });

        //not found
        if(!updated) {
            return res.status(404).json({ error: 'User not found' });
        }

        //return updated user document
        return res.json(updated);

    } catch (err) {
        //duplicate email 
        if(err.code === 11000) {
            return res.status(409).json({ error: 'Email already exists' });
        }

        return next(err);
    }
});

/**
 * DELETE /api/deleteUser
 * Delete a user
 */
router.delete('/deleteUser', auth, async (req, res, next) => {
    try{
        //id from users session
        const id = req.user.id; 

        //check if id is valid
        validateId(id);

        //finds and deltes user document
        const deleted = await User.findByIdAndDelete(id);

        //return error if user document not found
        if (!deleted) {
            return res.status(404).json({ error: 'User not found'})
        }

        return res.status(204).send();

    } catch (err) {
        return next(err);
    }
});

/**
 * GET /api/myinfo
 * users own profile
 * need to auth their token
**/
router.get('/myinfo', auth , async (req, res, next) => {
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

module.exports = router;