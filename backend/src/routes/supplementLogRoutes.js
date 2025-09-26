const express = require('express');
const SupplementLog = require('../models/Supplementlog');
const validateId = require('../helpers/validateId');
const auth = require('../middleware/auth');
const router = express.Router();

/*
 * POST /api/supplementlog
 * create a new supplement log
*/
router.post('/', auth, async (req, res, next) => {
    try {
        //save new supplement log
        const supplementlog = await SupplementLog.create({
                ...req.body,
                userId: req.user.id,
            });

        return res.status(201).json(supplementlog);
    } catch (err) {
        //pass to global error handler in server.js
        return next(err);
    }
});

/*
 * PATCH /api/supplementlog/:id
 * update supplement log
*/
router.patch('/:id', auth, async (req, res, next) => {
    try {
        //load and checkid
        const { id } = req.params;
        validateId(id);

        //find and update target document for current user
        const updatedSupplementLog = await SupplementLog.findByIdAndUpdate(
            { _id: id, userId: req.user.id },
            req.body,
            { new: true, runValidators: true }
        )

        if (!updatedSupplementLog) {
            return res.status(404).json({ error:'supplement log not found' });
        }

        //return updated supplement
        return res.json(updatedSupplementLog);
    } catch (err) {
        //pass to global error handler in server.js
        return next(err);
    }
});

/*
 * GET /api/supplementlog/
 * todays suppliment logs 
*/
router.get('/', auth, async (req, res, next) => {
    
    //start and end of day so we can filter for logs today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    try {
        //find todays supplement logs for current user
        const supplementLog = SupplementLog.find({
            userId: req.user.id,
            createdAt: {
                $gte: startOfToday,
                $lte: endOfToday
            }
        })

        return (supplementLog);
    } catch (err) {
        //pass to global error handler in server.js
        return next(err);
    }
});

module.exports = router;