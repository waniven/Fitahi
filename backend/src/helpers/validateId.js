// global helper function to validate IDs and compare them to what's in the database
const mongoose = require('mongoose'); // import mongoose library for MongoDB

const validateId = (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        const error = new Error('Invalid ID'); // create new error const
        error.status = 400; // attach HTTP status code
        throw error;        // throw error - to be caught by try/catch in routes
    }
    return true; // if ID is valid, return true
};

// export function for use in other files
module.exports = validateId;
