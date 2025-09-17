const express = require('express');
const Water = require('../models/Water');
const validateId = require('../helpers/validateId');
const auth = require('../middleware/auth');
const router = express.Router();
/**
 * POST /api/water
 * create new water log
 */
router.post('/', auth, async (req, res, next) => {
    try {
        //Create and add new water log
        const water = new Water.create({
            userId: req.user.id,
            time: req.body.time, 
            amount: req.body.amount,
        });

        //return new water log
        return res.status(201).json(water);
    } catch (err) {
        //error to global error handler 
        return next(err);
    }
});

/**
 * PATCH /api/water
 * update an exsisting water log
 */
router.patch('/:id', auth, async (req, res, next) => {
    try {
        const { id } = req.params;

        //check if id is valid
        validateId(id);

        //allow only whitelisted fields
        const updates = {};
        if (req.body.amount !== undefined) updates.amount = req.body.amount;
        if (req.body.time !== undefined) updates.time = req.body.time;


        //find and update water log for current user
        const updateWater = await Water.findOneAndUpdate(
            { _id: id, userId: req.user.id },
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!updateWater) {
            return res.status(404).json({ error: 'Water log not found' });
        }

        return res.json(updateWater);
    } catch (err) {
        //error to global error handler 
        return next(err);
    }
});

/**
 * DELETE /api/water/:id
 * delete water log by id
 */
router.delete('/:id', auth, async (req, res, next) => {
    try {
        const { id } = req.params;

        //check if id is valid
        validateId(id);

        //find and delete water for current user
        const deleteWater = await Water.findOneAndDelete({
            _id: id,
            userId: req.user.id,
        });

        //water not found
        if (!deleteWater) {
            return res.status(404).json({ error: 'Water log not found' });
        }

        //no content on success
        return res.status(204).send();
    } catch (err) {
        return next(err);
    }
});

/**
 * GET /api/water
 * get all water logs for the day
 */
router.get('/', auth, async (req, res, next) => {

    //start and end of day so we can filter for logs today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    try {
        //find todays water for current user,
        const water = await Water.find({
            userId: req.user.id,
            time: {
                $gte: startOfToday,
                $lte: endOfToday
            }
        }).sort({ createdAt: 1 });

        return res.json(water);
    } catch (err) {
        return next(err);
    }
});

module.exports = router;
