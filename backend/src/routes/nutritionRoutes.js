const express = require('express');
const Nutrition = require('../models/Nutrition');
const validateId = require('../helpers/validateId');
const auth = require('../middleware/auth');
const router = express.Router();

/**
 * POST /api/nutrition
 * create new nutirion log
 */
router.post('/', auth, async (req, res, next) => {
    try {
        const { name, type, calories, protine, fats, carbs } = req.body;

        //check calories, protine, fats, carb is a number
        if (calories === undefined || Number.isNaN(Number(calories))){
            return res.status(400).json({ error: 'calories is required and must be a number' });
        }

        if (protine === undefined || Number.isNaN(Number(protine))){
            return res.status(400).json({ error: 'protine is required and must be a number' });
        }

        if (fats === undefined || Number.isNaN(Number(fats))){
            return res.status(400).json({ error: 'fatssss is required and must be a number' });
        }

        if (carbs === undefined || Number.isNaN(Number(carbs))){
            return res.status(400).json({ error: 'carbs is required and must be a number' });
        }

        //create nutrition entry
        const nutrition = await Nutrition.create({
            userId: req.user.id,
            name: name,
            type: type,
            calories: calories,
            protine: protine,
            fats: fats,
            carbs: carbs,
        });

        //return new nutrition log
        return res.status(201).json(nutrition);
    } catch (err) {
        //error to global error handler 
        return next(err);
    }
});

/**
 * DELETE /api/nutrition/:id
 * delete nutrition log by id
 */
router.delete('/:id', auth, async (req, res, next) => {
    try {
        const { id } = req.params;

        //check if id is valid 
        validateId(id);

        //find and delete nutrition log
        const deleteNutrition = await Nutrition.findOneAndDelete({
            _id: id,
            userId: req.user.id,
        });

        //nutrition log not found
        if (!deleteNutrition) {
            return res.status(404).json({ error: 'Nutrition log not found' });
        }

        //no content on success
        return res.status(204).send();
    } catch (err) {
        //error to global error handler 
        return next(err);
    }
});

/**
 * GET /api/nutrition
 * get all nutrition logs for the day
 */
router.get('/', auth, async (req, res, next) => {

    //start and end of day so we can filter for logs today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    try {
        //find todays nutrition log for the current user
        const nutrition = await Nutrition.find({
            userId: req.user.id,
            createdAt: {
                $gte: startOfToday,
                $lte: endOfToday
            }
        })
    } catch (err) {
        //error to global error handler 
        return next(err);
    }
});

module.exports = router;