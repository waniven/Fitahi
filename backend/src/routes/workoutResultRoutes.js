const express = require('express');
const WorkoutResult = require('../models/WorkoutResult');
const validateId = require('../helpers/validateId');
const router = express.Router();

// check if user is logged in
function requireUser(req, res, next) {
    if (!req.user) return res.status(401).json({ error: 'Unauthorised' });
    next();
}

// POST: create new workout result
router.post('/', requireUser, async (req, res, next) => {
    try {
        const { workout_id, totalTimeSpent, completedExercises } = req.body;

        // validate required fields
        if (!workout_id || totalTimeSpent == null || !Array.isArray(completedExercises)) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // create new result for logged-in user
        const result = await WorkoutResult.create({
            userId: req.user.id,
            workout_id,
            totalTimeSpent,
            completedExercises,
            dateCompleted: new Date(),
        });

        return res.status(201).json(result); // return created result
    } catch (err) {
        next(err); // pass errors to global handler
    }
});

// GET: all workout results for logged-in user
router.get('/', requireUser, async (req, res, next) => {
    try {
        // fetch results sorted by newest first, optionally populate workout info
        const results = await WorkoutResult.find({ userId: req.user.id })
            .sort({ dateCompleted: -1 })
            .populate('workout_id', 'workoutName workoutType');

        return res.json(results); // return array
    } catch (err) {
        next(err);
    }
});

// GET: single workout result by ID
router.get('/:id', requireUser, async (req, res, next) => {
    try {
        const { id } = req.params;
        validateId(id);

        // find result for logged-in user only
        const result = await WorkoutResult.findOne({ _id: id, userId: req.user.id })
            .populate('workout_id', 'workoutName workoutType');

        if (!result) return res.status(404).json({ error: 'WorkoutResult not found' });

        return res.json(result); // return single result
    } catch (err) {
        next(err);
    }
});

module.exports = router; // export router