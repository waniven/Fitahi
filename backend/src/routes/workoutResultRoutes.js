const express = require('express');
const WorkoutResult = require('../models/WorkoutResult');
const validateId = require('../helpers/validateId');
const router = express.Router();
const auth = require('../middleware/auth');

/*
 * POST /api/workout-results
 * create new workout result
*/
router.post('/', auth, async (req, res, next) => {
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

        // transform response for frontend
        const response = {
            id: result._id.toString(),
            totalTimeSpent: result.totalTimeSpent,
            completedExercises: result.completedExercises,
            dateCompleted: result.dateCompleted.toISOString(),
            workout_id: result.workout_id.toString(),
        };

        // return response
        return res.status(201).json(response);
    } catch (err) {
        // pass to global error handler in server.js
        next(err);
    }
});

/*
 * GET /api/workout-results
 * all workout results for logged-in user
*/
router.get('/', auth, async (req, res, next) => {
    try {
        // fetch results sorted by newest first, optionally populate workout info
        const results = await WorkoutResult.find({ userId: req.user.id })
            .sort({ dateCompleted: -1 })
            .populate('workout_id', 'workoutName workoutType');

        // transform each result
        const transformed = results.map(r => ({
            id: r._id.toString(),
            totalTimeSpent: r.totalTimeSpent,
            completedExercises: r.completedExercises,
            dateCompleted: r.dateCompleted.toISOString(),
            workout_id: {
                id: r.workout_id._id.toString(),
                name: r.workout_id.workoutName, // renamed for frontend
                type: r.workout_id.workoutType,
            }
        }));

        // return transformed
        return res.json(transformed);
    } catch (err) {
        next(err);
    }
});

/*
 * GET /api/workout-results/:id
 * single workout result by ID
*/
router.get('/:id', auth, async (req, res, next) => {
    try {
        const { id } = req.params;

        // check if id is valid
        validateId(id);

        // find result for logged-in user only
        const result = await WorkoutResult.findOne({ _id: id, userId: req.user.id })
            .populate('workout_id', 'workoutName workoutType');

        // if result not found, return 404
        if (!result) return res.status(404).json({ error: 'WorkoutResult not found' });

        // transform response for frontend
        const response = {
            id: result._id.toString(),
            totalTimeSpent: result.totalTimeSpent,
            completedExercises: result.completedExercises,
            dateCompleted: result.dateCompleted.toISOString(),
            workout_id: {
                id: result.workout_id._id.toString(),
                name: result.workout_id.workoutName, // renamed for frontend
                type: result.workout_id.workoutType,
            }
        };

        // return response
        return res.json(response);
    } catch (err) {
        next(err);
    }
});

module.exports = router;