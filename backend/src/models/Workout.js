const { Schema, model } = require('mongoose');

// exercise subdocument schema
const exerciseSchema = new Schema({
    // exercise name (required)
    exerciseName: {
        type: String,
        required: true,
        trim: true
    },

    // number of sets (required)
    numOfSets: {
        type: Number,
        required: true,
        min: 1
    },

    // number of reps per set (required)
    numOfReps: {
        type: Number,
        required: true,
        min: 1
    },

    // duration per exercise in seconds (optional)
    exerciseDuration: {
        type: Number,
        min: 0,   // allow 0 (counts up)
        default: 0,  // optional, will default to 0 if frontend sends empty string
    },

    // weight used (optional)
    exerciseWeight: {
        type: Number,
        min: 0,
        default: 0,
    },

    // rest time between sets in seconds (required)
    restTime: {
        type: Number,
        required: true,
        min: 0
    },
}, { _id: false }); // no _id for subdocuments

// workout schema
const workoutSchema = new Schema(
    {
        // user who owns this workout
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'Users',
            required: true
        },

        // name of workout (required, not globally unique)
        workoutName: {
            type: String,
            required: true,
            trim: true,
        },

        // workout type
        workoutType: {
            type: String,
            required: true,
            trim: true,
            enum: ['cardio', 'strength', 'hypertrophy']
        },

        // days of week workout is performed (valid array, 0–6 integer check, no duplicate days)
        selectedDays: {
            type: [Number],
            required: true,
            validate: {
                validator: (arr) =>
                    Array.isArray(arr) &&
                    new Set(arr).size === arr.length && // no duplicate days
                    arr.every((day) => Number.isInteger(day) && day >= 0 && day <= 6), // valid day numbers
                message: 'selectedDays must be an array of unique integers between 0–6.',
            },
        },

        // array of exercises in this workout
        exercises: {
            type: [exerciseSchema],
            validate: [
                arr => arr.length > 0,
                'A workout must contain at least one exercise.',
            ],
        },
    },
    { timestamps: true } // auto track createdAt and updatedAt
);

module.exports = model('Workout', workoutSchema);