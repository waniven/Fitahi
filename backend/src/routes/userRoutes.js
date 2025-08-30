const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');

const router = express.Router();

//helper to validate MongoDB objectId
const isValidId= (id) => mongoose.Types.ObjectId.isValid(id);

/*
 * POST /api/users
 * Create a user
 * body: { name, email, dateofbirth, password }
*/
router.post('/', async (req, res, next) => {
    try {
        //get variables from document
        const { name, email, dateofbirth, password } = req.body;

        //check manditory fields are present 
        switch(true) {
            case !name:
                return res.status(400).json({ error: 'Name is required' });
            case !email:
                return res.status(400).json({ error: 'Email is required' });
            case !dateofbirth:
                return res.status(400).json({ error: 'Date of birth is required' });
            case !password:
                return res.status(400).json({ error: 'Password is required' });
            default:
                break;
        }

        //create a new user 
        const user = await User.create({ name, email, dateofbirth, password });
        
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
 * PATCH /api/users/:id
 * Update a user (partial)
 * body: { name, email, dateofbirth, password }
 */
router.patch('/:id', async (req, res, next) => {
    try{
        //id obj 
        const { id } = req.params;

        //check if id is valid
        if(!isValidId(id)) {
            return res.status(400).json({ error: 'Invalid user id' });
        }

        //whitelist object, will add allowed fields
        const updates = {}; 

        //check data type and add to updates whitelist object
        if (typeof req.body.name === 'string') updates.name = req.body.name;
        if (typeof req.body.email === 'string') updates.email = req.body.email;
        if (typeof req.body.password === 'string') updates.password = req.body.password;
        // date comes as a string; cast and validate
        if (typeof req.body.dateofbirth === 'string' || req.body.dateofbirth instanceof Date) {
            const d = new Date(req.body.dateofbirth);
            if (!Number.isNaN(d.getTime())) updates.dateofbirth = d;
        }

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
 * DELETE /api/users/:id
 * Delete a user
 */
router.delete('/:id', async (req, res, next) => {
    try{
        //id obj 
        const { id } = req.params;

        //check if id is valid
        if(!isValidId(id)) {
            return res.status(400).json({ error: 'Invalid user id' });
        }

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
 * GET /api/users/:id
 * Get a single user
 */
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

module.exports = router;