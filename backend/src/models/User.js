const { Schema, model } = require('mongoose');

//user schema for the database 
const userSchema = new Schema(
    {
        name: {type: String, required: true, trim: true},
        email: {
            type: String, 
            required: true,
            trim: true,
            lowercase: true,
            unique: true
        },
        dateofbirth: {type: String, required: true, trim: true},
        password: {type: String, required: true, trim: true},
    },
    { timestamps: true } //will automatically add a timestamp
)

userSchema.index({ email: 1}, { unique: true });

module.exports = model('Users', userSchema);