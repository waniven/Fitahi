//load env config containing port and mongoDB uri
require('dotenv').config();

//load modules
const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./src/routes/userRoutes');
const authRoutes = require('./src/routes/authRoutes');
const workoutRoutes = require('./src/routes/workoutRoutes');
const workoutResultRoutes = require('./src/routes/workoutResultRoutes');
const messageRoutes = require("./src/routes/messageRoutes");
const conversationRoutes = require("./src/routes/conversationRoutes");
const waterRoutes = require("./src/routes/waterRoutes");
const nutritionRoutes = require("./src/routes/nutritionRoutes");
const biometricRoutes = require("./src/routes/biometricRoutes")
const reminderRoutes = require("./src/routes/reminderRoutes");

const app = express();

//parse JSON bodies
app.use(express.json());

//mount routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/workout-results', workoutResultRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/water", waterRoutes);
app.use("/api/nutrition", nutritionRoutes);
app.use("/api/biometrics", biometricRoutes);
app.use("/api/reminders", reminderRoutes);

//global error handing
app.use((err, _req, res, _next) => {
    console.error(err);
    const status = err.status || 500;
    res.status(status).json({ error: err.message || 'Internal Server Error' });
});

//read port and mongoDB uri from env file
const { PORT, MONGODB_URI } = process.env;

//Connect to MongoDB and then start server
mongoose
    .connect(MONGODB_URI) //conect mongo
    .then(() => {
        console.log("Connected to Fitahi MongoDB server");
        app.listen(PORT, "0.0.0.0", () => { // start express server and don't bind to localhost only
            console.log(`Server Started, API running at http://localhost:${PORT}`);
        })
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });