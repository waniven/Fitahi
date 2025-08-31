const { Schema, model } = require('mongoose');

//user schema for the database 
const userSchema = new Schema(
    {
        firstname: {type: String, required: true, trim: true},
        lastname: {type: String, required: true, trim: true},
        email: {
            type: String, 
            required: true,
            trim: true,
            lowercase: true,
            unique: true
        },
        dateofbirth: {type: String, required: false, trim: true},
        password: {type: String, required: true, trim: true},
    },
    { timestamps: true } //will automatically add a timestamp
)

//add documents to Users collection in DB
module.exports = model('Users', userSchema);