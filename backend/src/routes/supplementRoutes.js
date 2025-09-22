const express = require('express');
const supplement = require('../models/supplement');
const validateId = require('../helpers/validateId');
const auth = require('../middleware/auth');
const router = express.Router();

/*
 * POST /api/supplements
 * create a new supplement
*/
router.post('/', auth, async (req, res, next) => {
    try {
        //save new supplement to DB from current user
        const supplement = await supplement.create({
            ...req.body,
            userID: req.user.id,
        });

        //return new supplement
        return res.status(201).json(supplement);
    } catch (err) {
    //pass to global error handler in server.js
        return next(err);
    }
});

/*
 * PATCH /api/supplements/:id
 * update exsistsing supplement 
*/
router.patch('/:id', auth, async (req, res, next) => {
    try {
        //load and checkid
        const { id } = req.params;
        validateId(id);

        //find and update target document for current user
        const updatedsupplement = await supplement.findOneAndUpdate(
            { _id: id, userId: req.user.id },
            req.body,
            { new: true, runValidators: true }
        );

        if(!updatedsupplement) {
            return res.status(404).json({ error:'supplement not found' });
        }

        //return updated supplement
        return res.json(updatedsupplement);
    } catch (err) {
        //pass to global error handler in server.js
        return next(err);
    }
});

/*
 * GET /api/supplements/:id
 * get all supplements
*/
router.get('/', auth, async (req, res, next) => {
    try {
        const allsupplements = await supplement.find({
            userId: req.user.id
        }).sort({ createdAt: -1 });

        //return all found supplements for current user
        return res.json(allsupplements);
    } catch (err) {
        //pass to global error handler in server.js
        return next(err);
    }
});

/*
 * Delete /api/supplements/:id
 * delete a supplement
*/
router.delete('/:id', auth, async (req, res, next) => {
    try {
        //load and checkid
        const { id } = req.params;
        validateId(id);

        //find and delete
        const deletedsupplement = await supplement.findByIdAndDelete({
            _id: id,
            userId: req.user.id,
        });

        //no content on success
        return res.status(204).send();
    } catch (err) {
        //pass to global error handler in server.js
        return next(err);
    }
});

module.exports = router;