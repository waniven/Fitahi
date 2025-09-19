const { Schema, model } = require('mongoose');

const reminderSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'Users',
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        notes: {
            type: String,
            trim: true,
            default: '',
        },
        time: {
            type: String, // store as "HH:mm" or ISO string
            default: null,
        },
        repeat: {
            type: String,
            enum: ['None', 'Daily', 'Weekly', 'Monthly'],
            default: 'None',
        },
        date: {
            type: String, // store as YYYY-MM-DD (matches Calendar)
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = model('Reminder', reminderSchema);
