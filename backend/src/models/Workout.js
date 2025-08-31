const { Schema, model } = require('mongoose');

// defining what each workout document will look like + validation included
const workoutSchema = new Schema(
    {
        // name of workout = serves as 'unique identifier' of the workout
        workoutName: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },

        // type of workout = selected from pre-determined list or . . .
        workoutType: {
            type: String,
            required: true,
            trim: true,
            enum: ['cardio', 'strength', 'stretch', 'custom'],
        },

        // a custom entry
        customWorkoutType: {
            type: String,
            trim: true,
            validate: {
                validator: function (input) {
                    // if workoutType is "custom", this field must be filled out
                    if (this.workoutType === 'custom') {
                        return input && input.trim().length > 0; // entry valid only if input is not null/undefined/empty string
                    }

                    // if workoutType is not "custom", skip validation
                    return true;
                },
                message: `The customWorkoutType field is required when workoutType is set to "custom".`,
            },
        },

        // sets
        workoutSets: {
            type: Number,
            required: true,
            min: [1, `Sets must be set to at least 1.`],
        },

        // reps
        workoutReps: {
            type: Number,
            required: true,
            min: [1, `Reps must be set to at least 1.`],
        },

        // duration of the workout = time unit decided by the user
        workoutDuration: {
            type: Number,
            validate: {
                validator: function (val) {
                    // allow undefined/null, but if user types in a number it should be positive
                    return val == null || val > 0;
                },
                message: `Duration must be a positive number.`,
            },
        },
    },
    { timestamps: true } // automatically track creation and update times
);

module.exports = model('Workout', workoutSchema);