require("dotenv").config(); // load environment variables from .env
const mongoose = require("mongoose"); // import mongoose library for MongoDB
const Feature = require("../models/Feature"); // import Feature model schema

// connect to MongoDB using MONGODB_URI from .env
mongoose.connect(process.env.MONGODB_URI);

// features array containing all feature objects
// each feature includes: name, description, and steps (array of strings)
const features = [
  // workouts
  {
    name: "Create Workout",
    description: "Create a new workout including lower body, upper body, or full-body exercises. Does not start the timer or log completed workouts. Will create automatic reminders/notifications based on days selected.",
    steps: [
      "From the Home Screen, go to the \"Workout Log\" tab",
      "Tap + to create a new workout",
      "Enter workout name, type (strength, hypotrophy, cardio) and days you wish to perform the workout on",
      "Click \"Next\", then add exercises with names, sets, reps and rest (mandatory), along with weight and duration (optional)",
      "Click \"Save Workout\"",
      "By default, you will be receiving weekly reminder notifications on the days you selected at 10am. You can fully customise or remove these reminder notificatons via the Home Page Calendar."
    ],
  },
  {
    name: "Edit Workout",
    description: "Edit/modify an existing workout, including changing exercises, sets, reps, or workout days. Does not start or log a workout. Does not update reminders/notifications for the workout.",
    steps: [
      "From the Home Screen, go to the \"Workout Log\" tab",
      "If you wish to delete a workout, click the \"Delete\" button on the workout card of your choice",
      "Tap \"Edit\" on the workout you wish to modify",
      "Change workout name, type (strength, hypotrophy, cardio) or days you wish to perform the workout on",
      "Click \"Next\", then delete, modify or add exercises with names, sets, reps and rest (mandatory), along with weight and duration (optional)",
      "Click \"Save Workout\"",
      "If you wish to update the reminder notifications for this workout, you must manually do so through the Home Page Calendar, where they are fully customisable and deletable."
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
    description: "Log/Make your nutrition/meals/food including breakfast, lunch, dinner, or snacks. Tracks calories, protein, carbs, and fats. Does not delete previous entries automatically. Will create a reminder to drink water that will send a notification to the phone 30 minutes after log has been made.",
    steps: [
      "From the Home Screen, go to the \"Nutrition Log\" tab",
      "Tap + to create a new nutrition log (if you haven't created any logs yet), or \"Log New Food Entry\" (if you have already logged food before)",
      "Enter food name, meal type (breakfast, lunch, dinner, or snack), and how much of the following was in your food: calories (kcal), protein, carbs, fats (last three must be given in grams)",
      "Click \"Log Food\"",
      "You will receive a reminder notification reminding you to drink water 30 minutes after making the log. This reminder can be fully customised or removed in the Home Page Calendar."
    ],
  },
  {
    name: "Delete/Remove Nutrition Entry/Log",
    description: "Delete/Remove a log/logged food entry from your nutrition log. Does not modify entry, but user can delete and add entries back in. This feature only deletes/removes entries, not their reminders to drink water.",
    steps: [
      "From the Home Screen, go to the \"Nutrition Log\" tab",
      "If you have already logged food, you should see a list of \"Today's Entries\", otherwise you may want to create a new log first",
      "Click on the Bin Icon on the nutrition log you wish to delete",
      "Deleting a log will not delete its water reminder notification (if it hasn't gone off yet), but you can do so in the Home Page Calendar."
    ],
  },

  // water
  {
    name: "Create/Log/Make Water Entry/Log",
    description: "Create/Log/Make your water intake. Records the amount and time you drank water. Does not delete previous entries automatically. If no logs have been made for about 3 hours or more, you will receive a notification reminding you about the progress you made towards your water intake goal for the day.",
    steps: [
      "From the Home Screen, go to the \"Water Log\" tab",
      "Tap + to create a new water log (if you haven't created any logs yet), or \"Log New Water Entry\" (if you have already logged water before)",
      "Enter the amount of water your drank (in milliliters), and at what time you drank it",
      "Click \"Log Water\"",
      "If you don't make any water logs for the next 3+ hours, you will receive a notification reminding you how much (in mL) you have left until you reach your goal."
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
      "Select \"Gallery\" as your choice, choose a picture from your device and crop it",
      "(\"Avatar\" is also another choice, to create an avatar from our pre-made icons and background colours)",
      "Once you're happy with your chosen photo, click \"Save Information\"",
    ],
  },
  {
    name: "Create/View/Edit/Modify Avatar",
    description: "Lets the user create/edit/modify their avatar and upload it as their profile photo/picture in the settings page. There are 3 human avatars to choose from and 18 colours the user can select as a background.",
    steps: [
      "From the bottom Navigation Bar, click on the \"Settings\" icon",
      "Tap on the Pencil icon on the Profile Picture circle at the top of the screen",
      "Select \"Avatar\" as your choice, pick an avatar from the 3 available options and choose a background colour from the 18 available options",
      "Once you're happy with your combination, click \"Save Avatar\"",
    ],
  },
  {
    name: "Forgot Password/Reset Password",
    description: "Lets the user reset their password if they have forgotten it by sending a one time code their registered email. Their email must be registered in order to use this feature, otherwise the app won't proceed to do the password reset.",
    steps: [
      "From the Login Screen, click on the \"Forgot Password?\" link above the Login button",
      "Enter your registered email address and click \"Send Recovery Code\", following this you will receive a pop-up notifying you that a code has been sent to your email if is registered",
      "Clicking \"x\" on the pop-up will take you to the next step, where you must enter the one time code you received in your email along with your new password. When done, click \"Create New Password\"",
      "Following this, you will be taken to the Welcome Screen and will receive a pop-up notification to alert you that your password has been reset successfully.",
    ],
  },
  {
    name: "App Streaks/Streaks Feature/Streaks Counter/Streaks Tracking",
    description: "Whenever the user log ins once a day, they will be presented with a streaks screen which will show their current streak count (number of consecutive days they have logged in). If they miss a day, the streak will reset to 0. Every time they see the screen, it will be accompanied by a motivational message to keep them going. Streaks are tracked by the app and are NOT manually editable by the user.",
    steps: [
      "Here's some notes about the Streaks feature:",
      "Every time you log in to the app, if you have logged in the previous day as well, your streak count will increase by 1",
      "If you miss a day, your streak count will reset to 0",
      "Every time you see the streaks screen, you will be presented with a motivational message to keep you going",
      "Streaks are tracked by the app and cannot be manually edited by the user",
    ],
  },
  {
    name: "Authenticating with Google/OAUTH via Google/Sign in, Sign up or Log In with Google",
    description: "Lets the user sign up or log in using their Google account via OAUTH authentication (ONLY Google). The user must have a valid Google account to use this feature. If a user has already signed up using regular email and password, they cannot use this feature to sign in or switch to OAuth.",
    steps: [
      "From the Welcome Screen, click on the \"Sign in with Google\" button",
      "You will be redirected to a Google Sign-In page, where you must enter your Google account credentials (email and password)",
      "Once you have successfully signed in with your Google account, you will be redirected back to the app and signed-up automatically",
      "If you are a new user, you will be taken to the Sign-Up Quiz, and a new account will be created for you using your Google account information",
      "If you have already signed up with OAuth before, you can use the same \"Sign in with Google\" button to log back in using your Google account",
      "If you have already signed up using regular email and password, you cannot use this feature to sign in or switch to OAuth",
    ],
  },

  // google ads
  {
    name: "Viewing/Closing/Interacting with Google Ads/Advertisements on the Home Screen",
    description: "The app has one ad displaying on the Home Screen, the user is able to click on an \"X\" to make it disappear. It will re-appear every time the user goes to the Home Screen. It is NOT possible to disable ads in the current version of the app. Clicking on the ad will redirect the user to the advertiser's website in their native browser.",
    steps: [
      "Some notes about the Google Ads displayed on the Home Screen:",
      "From the Home Screen, you will see a Google Ad banner below the Fitahi calendar",
      "You can click on the \"X\" button on the top right corner of the ad to close it, it will re-appear every time you go back to the Home Screen",
      "Clicking on the ad itself will redirect you to the advertiser's website in your device's native browser",
      "There is currently no way to disable ads in the app",
      "Thank you for supporting Fitahi!"
    ],
  },

  // gym finder
  {
    name: "Nearby Gym Finder/Gym finder/Maps/Map/Map Filters/Filtering Gyms/Clear Gym Filters",
    description: "View interactive map, find nearest gyms in your area (given location permissions are allowed), and search up gyms through a search bar. See quick overall star review and open/close status of the gym. Google Maps/native Maps can be opened through this feature. Filtering can ONLY be done by open/close times and star ratings, can be cleared too.",
    steps: [
      "From the Home Screen, go to the \"Gym Finder\" tab",
      "If asked, accept location permission request, otherwise feature will not work properly",
      "Afterwards, you can do the following:",
      "Search up gyms in the search bar via address or name (any irrelevant searches will default to showing you nearby gyms)",
      "Interact with a global map that shows you Gym markers and your current location",
      "View a list of gyms being presented in the map, showing their overall star rating and open/closed status, as well as \"Map\" buttons next to each of them if you want to open the gym in your native Maps app",
      "Filter gyms by open/close times and star ratings by clicking the \"Hours\" and \"Rating\" buttons below the search bar, click \"Clear filters\" to remove all filters applied",
    ],
  },

  // analytics (viewing and filtering logs)
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
  {
    name: "Filter Analytics Logs/Filter Logs/Clear Analytics Log Filters/Clear Logs/Sorting Analytics Logs",
    description: "Lets the user view and filter all logs that fall under the analytics graphs (weekly graphs for their workout durations, nutrition breakdown (calories, carbs, fat, protein), water intake, and biometrics weight tracking.) Unique filtering CAN ONLY be done by selecting a specific graph to view logs for (ONLY FOR: workouts, nutrition, water, biometrics), clearing filters is an option. All of them can be sorted in ascending or descending order.",
    steps: [
      "From the Home Screen, navigate to the \"Your Analytics\" tab.",
      "If you have logged entries for workouts, water, nutrition, or biometrics, the corresponding graphs will be visible.",
      "Tap any graph to view all past, detailed logs for that category (only these four categories support graphs, log views and filtering). Each of them have their own filters to help you find specific entries faster, along with an option to clear the filters or sort them in ascending or descending order. (Filtering by dates includes only all time, today, yesterday and last 7 days. Also includes sorting in ascending/descending order (oldest/newest logs).)",
      "Those detailed logs (per graph) and their filtering options include:",
      "- Water: all intake entries and the daily goal (Filterable by dates and amount drunk)",
      "- Biometrics: height, weight and BMI at that point in time, as well as your age (Filterable by dates, weight and BMI value)",
      "- Nutrition: meal name, meal type (breakfast, lunch, dinner, snack), and nutrient breakdown (calories, protein, carbs, fat) per entry (Filterable by dates, meal type, calories, names of meals)",
      "- Workouts: workout name, total minutes spent, and total exercises completed (Filterable by dates, duration, and exercises completed)",
      "You can clear all filters by clicking on the \"Clear filters\" button at any time to see all logs again."
    ]
  },

  // reminders and notifications
  {
    name: "Create/Make Reminder/Notificaitons",
    description: "Create a custom reminder on the app that will send a notification to your phone to remind you of anything you need. These reminders are NOT synced to your phone/the phone's native calendar. Your phone will still receive notifications. Past days CANNOT be scheduled on.",
    steps: [
      "From the Home Screen Calendar, tap on any day you wish to make a reminder on. (Past days cannot be scheduled on.)",
      "Alternatively, click on the \"+ Add reminder\" button below the calendar",
      "Put down the reminder title (required), any notes (will show up in the notification), and select the date and time you want to be reminded on (required)",
      "There are also \"Repeat\" options you can select: None (one-off reminder), Daily, Weekly, Monthly",
      "Click the \"Add Reminder\" button once finished.",
      "All notifications will be automatically scheduled based on what you selected."
    ],
  },
  {
    name: "Modify/Edit Reminder/Notifications",
    description: "Modify/edit a reminder/notifications currently set up/scheduled in the Fitahi app. If the reminder is repeating daily, weekly or monthly, any instance of the reminder on the calendar can be used to modify the reminder and its notifications.",
    steps: [
      "From the Home Screen Calendar, tap on the day where you have a scheduled reminder (there are visual indicators for days that have something scheduled on them).",
      "Below the calendar, you will be able to see all reminders you have scheduled for that day. Tap on the reminder you wish to edit.",
      "Keep in mind that if this is a repeating reminder, editing one instance will affect all of them.",
      "You are able to edit everything shown: the reminder title (remains required), any notes (will show up in the notification), and the date and time you want to be reminded on (remains required)",
      "All of the \"Repeat\" options remain editable and you can choose to change the reminder to: None (one-off reminder), Daily, Weekly, Monthly",
      "Click the \"Save Changes\" button once finished.",
      "All notifications will be automatically re-scheduled based on what you selected."
    ],
  },
  {
    name: "Delete/Remove Reminder/Notifications",
    description: "Delete/remove a reminder/notifications currently set up/scheduled in the Fitahi app. If the reminder is repeating daily, weekly or monthly, any instance of the reminder on the calendar can be used to delete/remove the reminder and its notifications.",
    steps: [
      "From the Home Screen Calendar, tap on the day where you have a scheduled reminder (there are visual indicators for days that have something scheduled on them).",
      "Below the calendar, you will be able to see all reminders you have scheduled for that day. Tap on the reminder you wish to delete.",
      "Keep in mind that if this is a repeating reminder, deleting one instance will remove all of them.",
      "Scroll down the pop-up as needed, past all the editable fields.",
      "Click the \"Delete Reminder\" button.",
      "All notifications will be automatically deleted."
    ],
  },

  // Darwin
  {
    name: "Inacivity Notifications/Inactivity Reminder/Inactivity Check-in/Inactivity Alert/Initiate Conversation on Inactivity/Start Conversation on Inactivity",
    description: "This is a description of a capability you have as Darwin. You will send Inactivity Notifications to the user and initiate a conversation when they have been inactive (no workout, nutrition, water or biometrics logs made) for 5+ hours during the day. This is to help motivate them or check-in with them/their wellbeing, to make them feel cared for and stay on track with their fitness goals. This capability CANNOT be disabled at the moment.",
    steps: [
      "Notes about this capability of yours:",
      "The user's activity in the app is monitored throughout the day",
      "If the user has not made any logs (workout, nutrition, water, biometrics) for 5+ hours during the day, you will send them an Inactivity Notification to their phone",
      "The notification will include a motivational message to encourage them to get moving and stay on track with their fitness goals",
      "You will also initiate a conversation with the user in the app following that, motivating them to log an activity or workout, or have a friendly chat to you to keep them engaged",
      "If multiple notifications are sent while the user is inactive, when they return, only the latest notification will trigger the conversation, to prevent spamming them",
      "This capability is designed to help users stay motivated and engaged with their fitness journey and at the moment cannot be disabled"
    ],
  },
];

// seed function: clears existing features and inserts new ones
// logs success or error, then closes the database connection
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

// run seed function
seed();
