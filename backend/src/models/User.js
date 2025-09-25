const { Schema, model } = require('mongoose');
const bcrypt = require('bcryptjs');

//user schema for the database 
const userSchema = new Schema(
    {
        firstname: { type: String, required: true, trim: true },
        lastname: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, trim: true, lowercase: true },
        dateofbirth: { type: Date, required: true },
        password: { type: String, required: true, select: false }, //select: false dose not return the password by defualt quaries
        pfp: { type: String, required: false, default: null }, //profile picture in base64
        quiz: { // quiz questions from sign-up
            FitnessGoal: { type: String, default: null },
            FitnessLevel: { type: String, default: null },
            TrainingDays: { type: String, default: null },
            TrainingTime: { type: String, default: null },
            Diet: { type: String, default: null },
            Height: { type: Number, default: null },
            Weight: { type: Number, default: null },
        },
        intakeGoals: { //daily intake goals 
            dailyCalories: { type: Number, default: null },
            dailyWater: { type: Number, default: null },
        }
    },
    { timestamps: true } //will automatically add a timestamp
)

//Remove password if its ever selected
userSchema.set('toJSON', {
    transform: (_doc, ret) => {
        delete ret.password;
        return ret;
    }
});

//Hash password before saving new user
userSchema.pre('save', async function (next) { //runs when a document calls .save()
    if (!this.isModified('password')) return next(); //check if password has changed, prevent double hashing
    try {
        const rounds = 12; //bcrypt cost factor
        this.password = await bcrypt.hash(this.password, rounds); //hashes password and generats internal salt
        next(); //continue 
    } catch (err) {
        next(err); //error to mongoose 
    }
});

//Hash password on update user by functions findByIdAndUpdate / findOneAndUpdate
userSchema.pre('findOneAndUpdate', async function (next) { //runs when a document calls .findOneAndUpdate()
    try {
        const update = this.getUpdate() || {}; //object that will be sent to mongo, if missing then empty
        const $set = update.$set || {};

        const pwd = $set.password ?? update.password; //Looks password in $set else top level  
        if (!pwd) return next(); //no password, skip hashing

        const rounds = 12; //bcrypt cost factor
        const hashed = await bcrypt.hash(pwd, rounds); //hashes password and generats internal salt

        //replace planetext password with new hash
        if ('password' in $set) {
            update.$set.password = hashed;
        } else {
            update.password = hashed;
        }

        //write back and ensure Mongoose uses the mutated object
        update.$set = $set;
        this.setUpdate(update);

        next(); //continue
    } catch (err) {
        next(err); //error to mongoose
    }
});

//helper to compaire password for login 
userSchema.methods.comparePassword = function (plain) {
    return bcrypt.compare(plain, this.password);
};

//add documents to Users collection in DB
module.exports = model('Users', userSchema);