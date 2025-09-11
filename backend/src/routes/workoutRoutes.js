const express = require('express');
const Workout = require('../models/Workout');
const validateId = require('../helpers/validateId');
const router = express.Router();
const auth = require('../middleware/auth');

/*
 * POST /api/workouts
 * create new workout
*/
router.post('/', auth, async (req, res, next) => {
    try {
        // add workout with logged-in user id
        const workout = await Workout.create({
            ...req.body,
            userId: req.user.id,
        });

        // return created workout
        return res.status(201).json(workout);
    } catch (err) {
        // pass to global error handler in server.js
        return next(err);
    }
});

/**
 * PATCH /api/workouts/:id
 * update workout by id
 */
router.patch('/:id', auth, async (req, res, next) => {
    try {
        const { id } = req.params;

        // check if id is valid
        validateId(id);

        // find and update workout for logged-in user
        const updatedWorkout = await Workout.findOneAndUpdate(
            { _id: id, userId: req.user.id },
            req.body,
            { new: true, runValidators: true }
        );

        // workout not found
        if (!updatedWorkout) {
            return res.status(404).json({ error: 'Workout not found' });
        }

        return res.json(updatedWorkout);
    } catch (err) {
        return next(err);
    }
});

/**
 * DELETE /api/workouts/:id
 * delete workout by id
 */
router.delete('/:id', auth, async (req, res, next) => {
    try {
        const { id } = req.params;

        // check if id is valid
        validateId(id);

        // find and delete workout for logged-in user
        const deletedWorkout = await Workout.findOneAndDelete({
            _id: id,
            userId: req.user.id,
        });

        // workout not found
        if (!deletedWorkout) {
            return res.status(404).json({ error: 'Workout not found' });
        }

        // no content on success
        return res.status(204).send();
    } catch (err) {
        return next(err);
    }
});

/**
 * GET /api/workouts/:id
 * get workout by id
 */
router.get('/:id', auth, async (req, res, next) => {
    try {
        const { id } = req.params;

        // check if id is valid
        validateId(id);

        // find workout for logged-in user
        const workout = await Workout.findOne({ _id: id, userId: req.user.id });

        // workout not found
        if (!workout) {
            return res.status(404).json({ error: 'Workout not found' });
        }

        return res.json(workout);
    } catch (err) {
        return next(err);
    }
});

/**
 * GET /api/workouts
 * get all workouts for user
 */
router.get('/', auth, async (req, res, next) => {
    try {
        // find workouts for logged-in user, newest first
        const workouts = await Workout.find({ userId: req.user.id }).sort({ createdAt: -1 });
        return res.json(workouts);
    } catch (err) {
        return next(err);
    }
});

module.exports = router;
