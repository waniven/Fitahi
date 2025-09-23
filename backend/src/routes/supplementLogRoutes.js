const express = require('express');
const supplementLog = require('../models/Supplementlog');
const validateId = require('../helpers/validateId');
const auth = require('../middleware/auth');
const router = express.Router();

/*
 * POST /api/supplementlog
 * create a new supplement log
*/
router.post('/', auth, async (req, res, next) => {
    try {

    } catch (err) {
        //pass to global error handler in server.js
        return next(err);
    }
});

/*
 * PATCH /api/supplementlog/:id
 * update supplement log
*/
router.patch('/:id', auth, async (req, res, next) => {
    try {

    } catch (err) {
        //pass to global error handler in server.js
        return next(err);
    }
});

/*
 * GET /api/supplementlog/
 * todays suppliment logs 
*/
router.get('/', auth, async (req, res, next) => {
    try {

    } catch (err) {
        //pass to global error handler in server.js
        return next(err);
    }
});

/*
 * DELETE /api/supplementlog/:id
 * delete a suppliment log
*/
router.delete('/:id', auth, async (req, res, next) => {
    try {

    } catch (err) {
        //pass to global error handler in server.js
        return next(err);
    }
});