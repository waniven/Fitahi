const express = require('express');
const mongoose = require('mongoose');
const Workout = require('../models/Workout');
const router = express.Router();

// helper function to check if an ID is a valid mongoDB objectId
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * POST /api/workouts
 * Create a new workout
 * body: { workoutName, workoutType, customWorkoutType?, workoutSets, workoutReps, workoutDuration? }
 */
router.post('/', async (req, res, next) => {
    try {
        const workout = await Workout.create(req.body); // mongoose handles validation
        return res.status(201).json(workout);
    } catch (err) {
        // handle duplicate workoutName 
        if (err.code === 11000) {
            return res.status(409).json({ error: `Workout already exists.` });
        }

        // pass to global error handler in server.js
        return next(err);
    }
});

/**
 * PATCH /api/workouts/:id
 * Update workout
 */
router.patch('/:id', async (req, res, next) => {
    try {
        // firstly, check to see if the workout ID is valid 
        const { id } = req.params;
        if (!isValidId(id)) {
            return res.status(400).json({ error: `Invalid workout ID` });
        }

        // if it's valid, update the corresponding workout
        const updatedWorkout = await Workout.findByIdAndUpdate(id, req.body, {
            new: true, // return updated doc
            runValidators: true, // apply schema validators on update
        });

        // throw status 404 if workout isn't found
        if (!updatedWorkout) {
            return res.status(404).json({ error: `Workout not found` });
        }

        // otherwise, return the updated document
        return res.json(updatedWorkout);
    } catch (err) {
        return next(err);
    }
});

/**
 * DELETE /api/workouts/:id
 * Delete workout by id
 */
router.delete('/:id', async (req, res, next) => {
    try {
        // firstly, check to see if the workout ID is valid 
        const { id } = req.params;
        if (!isValidId(id)) {
            return res.status(400).json({ error: `Invalid workout ID` });
        }

        // if valid, delete the workout
        const deletedWorkout = await Workout.findByIdAndDelete(id);

        // throw status 404 if workout isn't found
        if (!deletedWorkout) {
            return res.status(404).json({ error: `Workout not found` });
        }

        // successful deletion, nothing to return
        return res.status(204).send();
    } catch (err) {
        return next(err);
    }
});

/**
 * GET /api/workouts/:id
 * Get a single workout
 */
router.get('/:id', async (req, res, next) => {
    try {
        // firstly, check to see if the workout ID is valid 
        const { id } = req.params;
        if (!isValidId(id)) {
            return res.status(400).json({ error: `Invalid workout ID` });
        }

        // if valid, find the workout by ID
        const workout = await Workout.findById(id);

        // throw status 404 if workout isn't found
        if (!workout) {
            return res.status(404).json({ error: `Workout not found` });
        }

        // return the workout in JSON format
        return res.json(workout);
    } catch (err) {
        return next(err);
    }
});

/**
 * GET /api/workouts
 * Get all workouts
 */
router.get('/', async (_req, res, next) => {
    try {
        // retrieve all workouts within collection, sorting them by creation date - newest first (descending)
        const workouts = await Workout.find().sort({ createdAt: -1 });

        // return the workouts in JSON format
        return res.json(workouts);
    } catch (err) {
        return next(err);
    }
});

module.exports = router;
