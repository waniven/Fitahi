const express = require('express');
const Workout = require('../models/Workout');
const validateId = require('../helpers/validateId');
const router = express.Router();

// check if user is logged in
function requireUser(req, res, next) {
    if (!req.user) return res.status(401).json({ error: 'Unauthorised' });
    next();
}

// create new workout
router.post('/', requireUser, async (req, res, next) => {
    try {
        // add workout with logged-in user id
        const workout = await Workout.create({
            ...req.body,
            userId: req.user.id,
        });
        return res.status(201).json(workout);
    } catch (err) {
        // pass to global error handler in server.js
        return next(err);
    }
});

// update workout by id
router.patch('/:id', requireUser, async (req, res, next) => {
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

// delete workout by id
router.delete('/:id', requireUser, async (req, res, next) => {
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

// get workout by id
router.get('/:id', requireUser, async (req, res, next) => {
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

// get all workouts for user
router.get('/', requireUser, async (req, res, next) => {
    try {
        // find workouts for logged-in user, newest first
        const workouts = await Workout.find({ userId: req.user.id }).sort({ createdAt: -1 });
        return res.json(workouts);
    } catch (err) {
        return next(err);
    }
});

module.exports = router;
