const { Schema, model } = require('mongoose');

// schema for completed workout logs
const workoutResultSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'Users', required: true }, // owner of this result
        workout_id: { type: Schema.Types.ObjectId, ref: 'Workout', required: true }, // reference to workout template
        totalTimeSpent: { type: Number, required: true, min: 0 }, // total time in seconds
        completedExercises: [{ type: String, required: true, trim: true }], // array of exercise names
        dateCompleted: { type: Date, default: Date.now }, // completion timestamp
    },
    { timestamps: true } // auto track createdAt / updatedAt
);

module.exports = model('WorkoutResult', workoutResultSchema); // export model
