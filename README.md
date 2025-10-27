# 💪 Fitahi

Fitahi is a MERN (MongoDB, Express, React Native, Node.js) fitness app with features to help users track and manage multiple aspects of their fitness journey and health, all in one place. It enables them to log their workouts, nutrition, supplements, water intake, biometrics, and more. It is an all-in-one fitness buddy primarily tailored for Android phones, but works on iOS phones as well (using Expo Go).

This README file provides an overview into the app's features and provides instructions on how to run it depending on which features you want to see. It provides the following:

1. Features Overview

2. Installation Prerequisites

3. Running Fitahi with Expo Go

4. Running Fitahi as a Compiled App (necessary for the Google Ads Feature)

## 📜 1. Features Overview

#### 🏋 Workout Logging

- Create, edit, and log personalised workouts including exercise names, sets, reps, rest times, and optional weights or durations per exercise. Workouts can be scheduled on selected days with automated, editable reminders to help users stay consistent.

#### 🍽 Nutrition / Food Logging

- Log meals across breakfast, lunch, dinner, and snacks - tracking calories, protein, carbs, and fats. Automatically triggers an editable water reminder 30 minutes after logging food to promote balanced hydration.

#### 💧 Water Intake Logging

- Record water intake by amount and time. The app will also send you smart reminders if you haven't logged water for a few hours, helping you stay on track with your hydration goals.

#### 📊 Biometrics Logging

- Track physical stats like height and weight over time. Entries update your analytics graphs and help monitor progress.

#### 💊 Supplement Logging

- Track supplements with name, dosage, and intake schedule. Log when they’ve been taken or skipped, and easily modify or delete supplement entries at anytime.

#### ⏰ Reminders

- Receive automated notifications for workouts, nutrition, water, supplements, or anything of your choice! All reminders are fully customisable through the in-app Fitahi calendar, allowing you to adjust or delete them anytime.

#### 🔥 Streaks

- Stay motivated with daily login streaks. The app tracks consecutive active days and resets the streak if a day is missed, displaying motivational messages to encourage consistency.

#### 📈 Analytics Graphs, Logs + Filtering Options

- View interactive weekly graphs for workouts, nutrition, water, and biometrics. Filter, sort, and review detailed logs to easily find the logs you're looking for and track your overall progress efficiently.

#### 🤖 Darwin, Fitahi's AI Assistant Chatbox

- Chat with Darwin, our friendly, fitness AI assistant that can help you with a wide range of things such as: understanding your progress, answering any fitness questions, offering technical guidance on how to use the app's features, making tailored workouts for you and offering general support based on your saved information.

#### 📍 Gym Finder + Filtering Options

- Discover gyms using an interactive map and search bar. Filter by star ratings or open/close hours, view gym details, and open directions directly in your native maps app.

#### 👤 Profile Creation, Personalisation Quiz & Account Settings

- Sign up, login and personalise your experience with a setup quiz that tailors your fitness information, nutrition and water intake goals. Edit personal info, your profile picture (from your gallery or make a fun avatar); manage fitness goals, dietary preferences, and daily intake targets.

- Should you forget your password, recover your account and reset your password with ease. If you'd prefer a straightforward approach, authenticate with our Google OAuth option instead!

#### ⭐ Google Ads

- A single ad appears on the Home Screen - it can be closed but reappears when revisiting the screen. Tapping the ad will take you to the advertiser's website in your device's native browser.

#

> ⚠️ _**READ BEFORE PROCEEDING:** The Google Ads feature cannot be run with Expo Go. You need to run a compiled dev build on a physical Android device in order to experience it. The rest of the features can be experienced through **either** methods specified in the sections below, however some of them may behave a little off in the Compiled version of the app. Our recommendation is to only run the Compiled version if you wish to check out the Google Ads feature, otherwise stick to Expo Go._

## ✅ 2. Prerequisites

Firstly, please choose whether you want to run Fitahi with **Expo Go** or as a **compiled app**. Afterwards, navigate to a directory where you wish to keep the repository folder, then open a terminal within that directory and execute **either** of the following commands:

- For running with **Expo Go**, execute:

```bash
git clone -b release-expo-go https://github.com/waniven/Fitahi.git
```

- For running the **compiled app**, execute:

```bash
git clone -b Release https://github.com/waniven/Fitahi.git
```

#

Next, ensure that you have downloaded the necessary .env files from our **Trello board's Resources column ("Environment Variables (frontend + backend)")**. Afterwards, please follow through the outlined instructions below:

- Put the files in their corresponding folders (on Trello the files are named '**frontend**' and '**backend**')

- Once done, rename them to just “**.env**“

- For the frontend .env file, **replace the “YOUR-LOCAL-IP-ADDRESS-HERE”** part with **your local machine’s IP address** (e.g. 192.168.1.20). It needs to be replaced with the IP address of the machine that will be running the backend.

#### Done! Proceed to the instructions below to run our project.

## 🤳 3. Running Fitahi with Expo Go

Before you start, make sure you have installed **Expo Go** on your phone:

- [For Android](https://play.google.com/store/apps/details?id=host.exp.exponent)

- [For iOS](https://apps.apple.com/app/expo-go/id982107779)

### ⚙️ Backend Setup

1. Open a terminal and, in the **Fitahi** folder, navigate to the **backend** directory:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the backend server with **nodemon**:

   ```bash
   nodemon server
   ```

### 📱 Frontend Setup

1. Open another terminal and, in the **Fitahi** folder, navigate to the **frontend** directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npx expo start
   ```

4. Open the app on your phone:
   - Scan the QR code in the terminal using **Expo Go** on your phone.
   - Make sure your phone and computer are on the same network when using **Expo Go**.

## 📲 4. Running Fitahi as a Compiled App

> ⚠️ _**READ BEFORE PROCEEDING:** The Google Ads feature cannot be run with Expo Go. You need to run a compiled dev build on a physical Android device in order to experience it. The rest of the features can be experienced through **either** methods specified in this file, however some of them may behave a little off in the Compiled version of the app. Our recommendation is to only run the Compiled version if you wish to check out the Google Ads feature, otherwise stick to Expo Go._

1. Open a terminal and, in the **Fitahi** folder, navigate to the **backend** directory:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Open another terminal and, in the **Fitahi** folder, navigate to the **frontend** directory:

   ```bash
   cd frontend
   ```

4. Install dependencies:

   ```bash
   npm install
   ```

#

5. Prepare an **Android** device (NOT a simulator). Connect your **Android phone** to your computer via **USB cable**.

6. On the phone, do the following:

- Go to **Settings** → **About phone** → **Build number**

- Tap the Build Number **7 times** to enable **Developer Options**

- Go back to **Settings** → **Developer options** → **USB debugging**

- Turn on **USB debugging**

#### (Windows only) Install your device’s USB driver if needed. On macOS/Linux, drivers are not usually required.

#

7. Install **Android Platform Tools (Android Debug Bridge)**

- **macOS (with Homebrew):**

  ```bash
  brew install android-platform-tools
  ```

- **Windows:**

  - Download the official [**Android SDK Platform Tools**](https://developer.android.com/tools/releases/platform-tools)

  - Extract it in your chosen directory and add the **platform-tools** folder to your Environemnt System Variable "**Path**"

  - To provide further assistance if needed, a reference document of correctly set-up Environment Variables on Windows has been provided under the **Resources column on Trello ("Environment System Variable Path Configuration")**, containing a brief set of instructions and screenshots

#### Following this, verify that **ADB** is available by opening a terminal and running the command below - you should see an output displaying the **Android Debug Bridge version**:

```bash
adb version
```

#

8. **Authorise** your Android device:

- Ensure your phone is plugged into your computer via **USB cable**, then run the following command:

  ```bash
  adb devices
  ```

- On the phone, **accept the "Allow USB debugging?"** prompt, then run the command again. You should see your device listed as **device** (not unauthorised or offline).

- If it still shows **unauthorised**:

  - Toggle USB debugging off and on
  - Replug the cable
  - Run:

  ```bash
  adb kill-server
  adb start-server
  adb devices
  ```

#

9. Prebuild the **native Android project**, from the project root, run the command outlined below. This will create or update the **android folder**, apply any config from **app.json**, and link **native modules** (ads).

   ```bash
   npx expo prebuild --platform android
   ```

#

10. Build and install the **dev client on the Android device**, open up a terminal within the project root, then run the command below. In doing so, you will build a compiled variant of the app and install it directly onto the connected device.

    ```bash
    npx expo run:android
    ```

#

11. Check out the Google Ads feature on the Home Screen!

#

### ✨ Enjoy using Fitahi!
