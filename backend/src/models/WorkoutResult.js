const { Schema, model } = require('mongoose');

// schema for completed workout logs
const workoutResultSchema = new Schema(
    {
        // owner of this result
        userId: { type: Schema.Types.ObjectId, ref: 'Users', required: true },

        // reference to workout template
        workout_id: { type: Schema.Types.ObjectId, ref: 'Workout', required: true },

        // total time in seconds
        totalTimeSpent: { type: Number, required: true, min: 0 },

        // array of exercise names
        completedExercises: [{ type: String, required: true, trim: true }],

        // completion timestamp
        dateCompleted: { type: Date, default: Date.now },
    },
    // auto track createdAt / updatedAt
    { timestamps: true }
);

// export workoutresult model
module.exports = model('WorkoutResult', workoutResultSchema); 
