const express = require('express');
const Biometric = require('../models/Biometric');
const User = require('../models/User');
const validateId = require('../helpers/validateId');
const router = express.Router();
const auth = require('../middleware/auth');

/*
 * POST /api/biometrics
 * create new biometrics log
*/
router.post('/', auth, async (req, res, next) => {
    try {
        // add biometric entry with logged-in user id
        const biometric = await Biometric.create({
            ...req.body,
            userId: req.user.id,
        });

        // update user's quiz.Height and quiz.Weight with latest values
        if (req.body.height || req.body.weight) {
            await User.findByIdAndUpdate(req.user.id, {
                $set: {
                    ...(req.body.height ? { "quiz.Height": req.body.height } : {}),
                    ...(req.body.weight ? { "quiz.Weight": req.body.weight } : {}),
                }
            });
        }

        // return created biometric entry
        return res.status(201).json(biometric);
    } catch (err) {
        // pass to global error handler in server.js
        return next(err);
    }
});

/**
 * DELETE /api/biometrics/:id
 * delete biometrics log by id
 */
router.delete('/:id', auth, async (req, res, next) => {
    try {
        const { id } = req.params;

        // check if id is valid
        validateId(id);

        // find and delete biometric entry for logged-in user
        const deletedBiometric = await Biometric.findOneAndDelete({
            _id: id,
            userId: req.user.id,
        });

        // biometric entry not found
        if (!deletedBiometric) {
            return res.status(404).json({ error: 'Biometric entry not found' });
        }

        // check if there are any remaining biometric logs
        const remainingLogs = await Biometric.find({ userId: req.user.id });

        // clear quiz Height and Weight if no logs remain
        if (remainingLogs.length === 0) {
            await User.findByIdAndUpdate(req.user.id, {
                $unset: { "quiz.Height": "", "quiz.Weight": "" },
            });
        }

        return res.status(204).send();
    } catch (err) {
        return next(err);
    }
});


/**
 * GET /api/biometrics/:id
 * get biometrics log by id
 */
router.get('/:id', auth, async (req, res, next) => {
    try {
        const { id } = req.params;

        // check if id is valid
        validateId(id);

        // find biometric entry for logged-in user
        const biometric = await Biometric.findOne({ _id: id, userId: req.user.id });

        // biometric entry not found
        if (!biometric) {
            return res.status(404).json({ error: 'Biometric entry not found' });
        }

        return res.json(biometric);
    } catch (err) {
        return next(err);
    }
});

/**
 * GET /api/biometrics
 * get all biometrics logs for user
 */
router.get('/', auth, async (req, res, next) => {
    try {
        // find biometric entries for logged-in user, newest first
        const biometrics = await Biometric.find({ userId: req.user.id }).sort({ timestamp: -1 });
        return res.json(biometrics);
    } catch (err) {
        return next(err);
    }
});

module.exports = router;