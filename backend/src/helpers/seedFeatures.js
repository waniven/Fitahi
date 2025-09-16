require("dotenv").config();
const mongoose = require("mongoose");
const Feature = require("../models/Feature");

// connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

const features = [
  // workouts
  {
    name: "Create Workout",
    description: "Create a new workout including lower body, upper body, or full-body exercises. Does not start the timer or log completed workouts.",
    steps: [
      "From the Home Screen, go to the \"Workout Log\" tab",
      "Tap + to create a new workout",
      "Enter workout name, type (strength, hypotrophy, cardio) and days you wish to perform the workout on",
      "Click \"Next\", then add exercises with names, sets, reps and rest (mandatory), along with weight and duration (optional)",
      "Click \"Save Workout\"",
    ],
  },
  {
    name: "Edit Workout",
    description: "Edit/modify an existing workout, including changing exercises, sets, reps, or workout days. Does not start or log a workout.",
    steps: [
      "From the Home Screen, go to the \"Workout Log\" tab",
      "If you wish to delete a workout, click the \"Delete\" button on the workout card of your choice",
      "Tap \"Edit\" on the workout you wish to modify",
      "Change workout name, type (strength, hypotrophy, cardio) or days you wish to perform the workout on",
      "Click \"Next\", then delete, modify or add exercises with names, sets, reps and rest (mandatory), along with weight and duration (optional)",
      "Click \"Save Workout\"",
    ],
  },
  {
    name: "Log Workout",
    description: "Log a workout session when performing exercises. Tracks exercise sets, reps, rest, duration, and optionally weight. Does not create or edit workouts.",
    steps: [
      "From the Home Screen, go to the \"Workout Log\" tab",
      "Tap the Play Button on the workout you wish to perform",
      "Click the Play Button on the screen to start the timer and measure your current exercise duration",
      "Click the Pause Button to pause the timer at any point",
      "Click the Next Button to trigger the Rest Timer for the current exercise after completing a set",
      "Click the \"End Workout\" button at any point if you wish to end the workout",
      "You will be presented with a log overview, afterwards you may click the \"Go back to Workout Logs\" button to return to the Workout Log screen",
    ],
  },

  // supplements
  {
    name: "Create/Make Supplement Entry/Log",
    description: "Make/create/add a new supplement log/entry.",
    steps: [
      "From the Home Screen, go to the \"Supplement Log\" tab",
      "Tap + to create a new supplement log",
      "Enter supplement name, dosage (grams), time and days you wish to take the supplement on",
      "Click \"Save Supplement Entry\"",
    ],
  },
  {
    name: "Log Supplement",
    description: "Log your supplement intake for today. Tracks whether you have taken or skipped scheduled supplements. Does not create new supplement entries.",
    steps: [
      "From the Home Screen, go to the \"Supplement Log\" tab",
      "Select the \"Today\" tab at the top of the screen",
      "If you have any supplements scheduled for today, you will see a card with options \"Taken?\" and \"Skipped?\" - tap the appropriate button",
    ],
  },
  {
    name: "Edit/Modify/Update Supplement Entry/Log",
    description: "Edit/Modify/Update an existing supplement log including name, dosage, or days. Does not track intake automatically.",
    steps: [
      "From the Home Screen, go to the \"Supplement Log\" tab",
      "Select the \"All logs\" tab at the top of the screen",
      "Click the \"Edit\" button on the entry you wish to modify, or \"Delete\" if you wish to remove it",
      "Modify supplement name, dosage (grams), time and days you wish to take the supplement on",
      "Click \"Update Supplement Entry\"",
    ],
  },

  // nutrition
  {
    name: "Create/Log/Make Nutrition Entry/Log",
    description: "Log/Make your nutrition/meals including breakfast, lunch, dinner, or snacks. Tracks calories, protein, carbs, and fats. Does not delete previous entries automatically.",
    steps: [
      "From the Home Screen, go to the \"Nutrition Log\" tab",
      "Tap + to create a new nutrition log (if you haven't created any logs yet), or \"Log New Food Entry\" (if you have already logged food before)",
      "Enter food name, meal type (breakfast, lunch, dinner, or snack), and how much of the following was in your food (in kcal): calories, protein, carbs, fats",
      "Click \"Log Food\"",
    ],
  },
  {
    name: "Delete/Remove Nutrition Entry/Log",
    description: "Delete/Remove a log/logged food entry from your nutrition log. Does not create new entries automatically.",
    steps: [
      "From the Home Screen, go to the \"Nutrition Log\" tab",
      "If you have already logged food, you should see a list of \"Today's Entries\", otherwise you may want to create a new log first",
      "Click on the Bin Icon on the nutrition log you wish to delete",
    ],
  },

  // water
  {
    name: "Create/Log/Make Water Entry/Log",
    description: "Create/Log/Make your water intake. Records the amount and time you drank water. Does not delete previous entries automatically.",
    steps: [
      "From the Home Screen, go to the \"Water Log\" tab",
      "Tap + to create a new water log (if you haven't created any logs yet), or \"Log New Water Entry\" (if you have already logged water before)",
      "Enter the amount of water your drank (in milliliters), and at what time you drank it",
      "Click \"Log Water\"",
    ],
  },
  {
    name: "Delete/Remove Water Entry/Log",
    description: "Delete a previously logged water entry. Does not create new entries automatically.",
    steps: [
      "From the Home Screen, go to the \"Water Log\" tab",
      "If you have already logged water, you should see a list of \"Today's Entries\", otherwise you may want to create a new log first",
      "Click on the Bin Icon on the water log you wish to delete",
    ],
  },

  // biometrics
  {
    name: "Create/Log/Make Biometrics Log",
    description: "Create/Log/Make your weight and height. Does not modify past entries automatically.",
    steps: [
      "From the Home Screen, go to the \"Biometrics Log\" tab",
      "Tap + to create a new biometrics log (if you haven't created any logs yet), or \"Add New Entry\" (if you have already logged your biometrics before)",
      "Enter your current height (in centimeters) and weight (in kilograms)",
      "Click \"Add Entry\"",
    ],
  },
  {
    name: "Delete/Remove Biometrics Log",
    description: "Delete/Remove a previously logged biometrics entry/log. Does not create new entries automatically.",
    steps: [
      "From the Home Screen, go to the \"Biometrics Log\" tab",
      "If you have already logged your biometrics before, you should see a list under the \"Previous Entries\" tab, otherwise you may want to create a new log first",
      "Click on the Bin Icon on the biometrics log you wish to delete",
    ],
  },

  // account settings and quiz questions
  {
    name: "Edit/Modify Account/Personal/Quiz Information",
    description: "The user CAN ONLY EDIT THE FOLLOWING: Profile Picture, First Name, Last Name, Date of Birth, Email, Password, Fitness Goal, Fitness Level, Training Days, Training Time, Diet, Height, Weight, Water Intake Goal, and Calories Intake Goal. No other fields exist.",
    steps: [
      "From the bottom Navigation Bar, click on the \"Settings\" icon",
      "Tap on any field you want to modify, fields you can modify include: Profile Picture, First Name, Last Name, Date of Birth, Email, Password, Fitness Goal, Fitness Level, Training Days, Training Time, Diet, Height, Weight, Water Intake Goal, and Calories Intake Goal.",
      "Once you're done editing, click \"Save Information\"",
    ],
  },
  {
    name: "Edit/Modify Profile Picture",
    description: "Lets the user edit their profile photo/picture in the settings page.",
    steps: [
      "From the bottom Navigation Bar, click on the \"Settings\" icon",
      "Tap on the Pencil icon on the Profile Picture circle at the top of the screen",
      "Choose a picture from your device and crop it",
      "Once you're happy with your chosen photo, click \"Save Information\"",
    ],
  },
];

async function seed() {
  try {
    await Feature.deleteMany(); // clear old data
    await Feature.insertMany(features);
    console.log("Features seeded successfully!");
    mongoose.connection.close();
  } catch (err) {
    console.error(err);
    mongoose.connection.close();
  }
}

seed();