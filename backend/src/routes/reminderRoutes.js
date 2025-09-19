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
        const reminders = await Reminder.find({ userId: req.user.id }).sort({ date: 1, time: 1 });
        res.json(reminders);
    } catch (err) {
        next(err);
    }
});

/**
 * POST /api/reminders
 * create new reminder
 */
router.post('/', auth, async (req, res, next) => {
    try {
        const reminder = await Reminder.create({
            ...req.body,
            userId: req.user.id,
        });
        res.status(201).json(reminder);
    } catch (err) {
        next(err);
    }
});

/**
 * PATCH /api/reminders/:id
 * update reminder by id
 */
router.patch('/:id', auth, async (req, res, next) => {
    try {
        const { id } = req.params;
        validateId(id);

        const updatedReminder = await Reminder.findOneAndUpdate(
            { _id: id, userId: req.user.id },
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedReminder) return res.status(404).json({ error: 'Reminder not found' });

        res.json(updatedReminder);
    } catch (err) {
        next(err);
    }
});

/**
 * DELETE /api/reminders/:id
 * delete reminder by id
 */
router.delete('/:id', auth, async (req, res, next) => {
    try {
        const { id } = req.params;
        validateId(id);

        const deletedReminder = await Reminder.findOneAndDelete({ _id: id, userId: req.user.id });
        if (!deletedReminder) return res.status(404).json({ error: 'Reminder not found' });

        res.status(204).send();
    } catch (err) {
        next(err);
    }
});

module.exports = router;
