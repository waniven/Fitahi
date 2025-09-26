const { Schema, model } = require('mongoose');

// reminder schema
const reminderSchema = new Schema(
    {
        // owner of reminder
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'Users',
            required: true,
        },

        // reminder title
        title: {
            type: String,
            required: true,
            trim: true,
        },

        // optional notes
        notes: {
            type: String,
            trim: true,
            default: '',
        },

        // reminder time (HH:mm or ISO string)
        time: {
            type: String,
            default: null,
        },

        // repeat option
        repeat: {
            type: String,
            enum: ['None', 'Daily', 'Weekly', 'Monthly'],
            default: 'None',
        },

        // reminder date (YYYY-MM-DD)
        date: {
            type: String,
            required: true,
        },
    },
    // auto add createdAt and updatedAt
    { timestamps: true }
);

// export reminder model
module.exports = model('Reminder', reminderSchema);
