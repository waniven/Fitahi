const express = require('express');
const SupplementLog = require('../models/SupplementLog');
const validateId = require('../helpers/validateId');
const auth = require('../middleware/auth');
const router = express.Router();

/*
 * POST /api/supplementlog
 * Create or update today’s supplement log (upsert)
*/
router.post('/', auth, async (req, res, next) => {
    try {
        const todayStr = new Date().toISOString().slice(0, 10); // Get YYYY-MM-DD
        const { supplement_id, status } = req.body;

        // Find today's log for this user & supplement, create if not exist
        const supplementlog = await SupplementLog.findOneAndUpdate(
            { userId: req.user.id, supplement_id, date: todayStr },
            { $set: { status, date: todayStr } },
            { upsert: true, new: true, runValidators: true }
        );

        return res.status(201).json(supplementlog);
    } catch (err) {
        return next(err);
    }
});

/*
 * PATCH /api/supplementlog/:id
 * Update a specific supplement log
*/
router.patch('/:id', auth, async (req, res, next) => {
    try {
        const { id } = req.params;
        validateId(id); // Ensure valid MongoDB ObjectId

        const updatedSupplementLog = await SupplementLog.findOneAndUpdate(
            { _id: id, userId: req.user.id }, // Only allow owner to update
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedSupplementLog) {
            return res.status(404).json({ error: 'supplement log not found' });
        }

        return res.json(updatedSupplementLog);
    } catch (err) {
        return next(err);
    }
});

/*
 * GET /api/supplementlog/
 * Get today’s supplement logs for the user
*/
router.get('/', auth, async (req, res, next) => {
    const todayStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    try {
        // Find all logs for today and populate supplement details
        const logs = await SupplementLog.find({
            userId: req.user.id,
            date: todayStr,
        }).populate('supplement_id');

        return res.json(logs);
    } catch (err) {
        return next(err);
    }
});

module.exports = router;
