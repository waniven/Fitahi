//load env config containing port and mongoDB uri
require('dotenv').config(); 

//load modules
const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./src/routes/userRoutes');

const app = express();

//parse JSON bodies
app.use(express.json());

//mount routes
app.use('/api/users', userRoutes);

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
        app.listen(PORT, () => { //start express server
            console.log(`Server Started, API running at http://localhost:${PORT}`);
        })
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });