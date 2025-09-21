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
    description: "Log/Make your nutrition/meals/food including breakfast, lunch, dinner, or snacks. Tracks calories, protein, carbs, and fats. Does not delete previous entries automatically.",
    steps: [
      "From the Home Screen, go to the \"Nutrition Log\" tab",
      "Tap + to create a new nutrition log (if you haven't created any logs yet), or \"Log New Food Entry\" (if you have already logged food before)",
      "Enter food name, meal type (breakfast, lunch, dinner, or snack), and how much of the following was in your food: calories (kcal), protein, carbs, fats (last three must be given in grams)",
      "Click \"Log Food\"",
    ],
  },
  {
    name: "Delete/Remove Nutrition Entry/Log",
    description: "Delete/Remove a log/logged food entry from your nutrition log. Does not modify entry, but user can delete and add entries back in. This feature only deletes/removes entries.",
    steps: [
      "From the Home Screen, go to the \"Nutrition Log\" tab",
      "If you have already logged food, you should see a list of \"Today's Entries\", otherwise you may want to create a new log first",
      "Click on the Bin Icon on the nutrition log you wish to delete",
    ],
  },

  // water
  {
    name: "Create/Log/Make Water Entry/Log",
    description: "Create/Log/Make your water intake. Records the amount and time you drank water. Does not delete previous entries automatically. ",
    steps: [
      "From the Home Screen, go to the \"Water Log\" tab",
      "Tap + to create a new water log (if you haven't created any logs yet), or \"Log New Water Entry\" (if you have already logged water before)",
      "Enter the amount of water your drank (in milliliters), and at what time you drank it",
      "Click \"Log Water\"",
    ],
  },
  {
    name: "Delete/Remove Water Entry/Log",
    description: "Delete a previously logged water entry. Does not modify entry, but user can delete and add entries back in. This feature only deletes/removes entries.",
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
    name: "View/Edit/Modify Account/Personal/Quiz Information",
    description: "The user CAN ONLY EDIT AND VIEW THE FOLLOWING: Profile Picture, First Name, Last Name, Date of Birth, Email, Password, Fitness Goal, Fitness Level, Training Days, Training Time, Dietary Preference, Daily Water Intake Goal (mL), and Daily Calories Intake Goal (kcal). Height and Weight are read-only in Settings and can ONLY be updated by making Biometric logs (Biometrics Log tab). No other fields exist.",
    steps: [
      "From the bottom Navigation Bar, click on the \"Settings\" icon",
      "Tap on any field you want to modify, fields you can modify include: Profile Picture, First Name, Last Name, Date of Birth, Email, Password, Fitness Goal, Fitness Level, Training Days, Training Time, Dietary Preference, Daily Water Intake Goal, and Daily Calories Intake Goal.",
      "Height and Weight are read-only from the Settings page and can ONLY be edited by making Biometric Logs (the user would have gotten the chance to enter them in through the Sign-Up Quiz as well). No other way of editting those fields.",
      "Once you're done editing, click \"Save Information\"",
    ],
  },
  {
    name: "View/Edit/Modify Profile Picture",
    description: "Lets the user edit their profile photo/picture in the settings page.",
    steps: [
      "From the bottom Navigation Bar, click on the \"Settings\" icon",
      "Tap on the Pencil icon on the Profile Picture circle at the top of the screen",
      "Choose a picture from your device and crop it",
      "Once you're happy with your chosen photo, click \"Save Information\"",
    ],
  },

  // gym finder
  {
    name: "Nearby Gym Finder/Gym finder/Maps/Map",
    description: "View interactive map, find nearest gyms in your area (given location permissions are allowed), and search up gyms through a search bar. See quick overall star review and open/close status of the gym. Google Maps/native Maps can be opened through this feature.",
    steps: [
      "From the Home Screen, go to the \"Gym Finder\" tab",
      "If asked, accept location permission request, otherwise feature will not work properly",
      "Afterwards, you can do the following:",
      "Search up gyms in the search bar via address or name (any irrelevant searches will default to showing you nearby gyms)",
      "Interact with a global map that shows you Gym markers and your current location",
      "View a list of gyms being presented in the map, showing their overall star rating and open/closed status, as well as \"Map\" buttons next to each of them if you want to open the gym in your native Maps app",
    ],
  },

  // analytics (viewing logs)
  {
    name: "See Analytics/View All Logs/View Graphs",
    description: "Lets the user view weekly graphs for their workout durations, nutrition breakdown (calories, carbs, fat, protein), water intake, and biometrics weight tracking. Clicking on the graphs allows them to see all logs/entries made for that graph's category. Details on respective logs include things like age, meal names, exercises finished in a workout log, etc...",
    steps: [
      "From the Home Screen, navigate to the \"Your Analytics\" tab.",
      "If you have logged entries for workouts, water, nutrition, or biometrics, the corresponding graphs will be visible.",
      "Each graph displays this week's data:",
      "- Workouts: total minutes spent per day",
      "- Nutrition: daily calorie and macronutrient breakdown",
      "- Water: daily water intake compared to goal",
      "- Biometrics: weight tracked per day",
      "Tap any graph to view all past, detailed logs for that category (only these four categories support graphs and log views).",
      "Those detailed logs (per graph) include:",
      "- Water: all intake entries and the daily goal",
      "- Biometrics: height, weight and BMI at that point in time, as well as your age",
      "- Nutrition: meal name, meal type (breakfast, lunch, dinner, snack), and nutrient breakdown (calories, protein, carbs, fat) per entry",
      "- Workouts: workout name, total minutes spent, and total exercises completed",
      "For workouts, tapping a single log entry will show precise details, including exact duration and exercises performed."
    ]
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