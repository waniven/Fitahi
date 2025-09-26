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
        const { time, amount } = req.body;

        //check if amount is a number
        if (amount === undefined || Number.isNaN(Number(amount))) {
            return res.status(400).json({ error: 'amount is required and must be a number' });
        }

        //create water entry
        const water = await Water.create({
            userId: req.user.id,
            time: time,
            amount: Number(amount),
        });

        //return new water log
        return res.status(201).json(water);
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

/**
 * GET /api/water/all
 * get all water logs for a user (not just today)
 */
router.get('/all', auth, async (req, res, next) => {
    try {
        // fetch all water logs for the current user
        const water = await Water.find({
            userId: req.user.id
        })
            // sort by creation date descending (latest first)
            .sort({ createdAt: -1 });

        // return water logs as json
        return res.json(water);
    } catch (err) {
        // forward error to error handler
        return next(err);
    }
});

module.exports = router;
