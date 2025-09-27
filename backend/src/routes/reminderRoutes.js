const express = require('express');
const Reminder = require('../models/Reminder');
const auth = require('../middleware/auth');
const validateId = require('../helpers/validateId');
const router = express.Router();

/**
 * GET /api/reminders
 * fetch all reminders for logged-in user
 */
router.get('/', auth, async (req, res, next) => {
    try {
        // find all reminders for user, sort by date then time
        const reminders = await Reminder.find({ userId: req.user.id }).sort({ date: 1, time: 1 });
        // send reminders as json
        res.json(reminders);
    } catch (err) {
        // pass error to handler
        next(err);
    }
});

/**
 * POST /api/reminders
 * create new reminder
 */
router.post('/', auth, async (req, res, next) => {
    try {
        // create reminder with request body and current user
        const reminder = await Reminder.create({
            ...req.body,
            userId: req.user.id,
        });
        // send reminder with 201 status
        res.status(201).json(reminder);
    } catch (err) {
        // pass error to global handler
        next(err);
    }
});

/**
 * PATCH /api/reminders/:id
 * update reminder by id
 */
router.patch('/:id', auth, async (req, res, next) => {
    try {
        // get reminder id
        const { id } = req.params;
        // validate id
        validateId(id);

        // update reminder if it belongs to user
        const updatedReminder = await Reminder.findOneAndUpdate(
            { _id: id, userId: req.user.id },
            req.body,
            { new: true, runValidators: true }
        );

        // if not found, return 404
        if (!updatedReminder) return res.status(404).json({ error: 'Reminder not found' });

        // return updated reminder
        res.json(updatedReminder);
    } catch (err) {
        // pass error to global handler
        next(err);
    }
});

/**
 * DELETE /api/reminders/:id
 * delete reminder by id
 */
router.delete('/:id', auth, async (req, res, next) => {
    try {
        // get reminder id
        const { id } = req.params;
        // validate id
        validateId(id);

        // delete reminder if it belongs to user
        const deletedReminder = await Reminder.findOneAndDelete({ _id: id, userId: req.user.id });
        // if not found, return 404
        if (!deletedReminder) return res.status(404).json({ error: 'Reminder not found' });

        // send 204 no content if deleted
        res.status(204).send();
    } catch (err) {
        // pass error to global handler
        next(err);
    }
});

module.exports = router;
