# 💪 Fitahi

Fitahi is a MERN (MongoDB, Express, React Native, Node.js) fitness app that helps users track and manage multiple aspects of their health in one place. The goal is to make daily fitness logging practical instead of overwhelming. Users can log workouts, record supplements and nutrition, track their water intake and biometrics, review progress over time, set reminders, look for gym locations and get AI support - all inside a single mobile app.

In the app, users can:
- Account signup and log in
- Streak 
- Log structured workouts (sets, reps, weights)
- Track supplements, nutrition, water, and biometrics
- View simple progress analytics
- Get habit reminders
- Discover local gyms
- Get basic AI guidance

Fitahi is primarily built for Android devices using React Native, but it also runs on iOS. The backend is powered by Node.js with MongoDB for persistent storage.

This README covers:
1.	Features overview
2.	Development setup
3. Running the App in Development (EXPO workflow)
4.	Building a dev client for Android (required for testing Google Ads / AdMob)

## ✅ 1. Features overview

#### 🏋 Workout Tracking
- Log exercises (including sets/reps/weight), with timing and saving workout sessions, and review past workouts.

#### 💊 Supplement Tracking
- Record supplements you’re taking, with name and dosage, so you can build consistent habits.

#### 💧 Water Intake Tracking
- Quickly log how much water you’ve had throughout the day.

#### 📊 Biometrics Tracking
- Track health stats like weight and other body metrics over time.

#### 🍽 Nutrition / Food Logging
- Capture food-related data to support your goals.

#### ⏰ Reminders
- Set custom reminders for habits like workouts, or supplements so you don’t forget.

#### 🔥 Streaks
- See how consistently you’re hitting habits to keep motivation up.

#### 📈 Analytics Dashboard
- View simple charts and summaries of your activity and health data to see trends over time.

#### 🤖 AI Assistant (“Darwin”)
- Get basic AI support for things like workout suggestions and guidance inside the app.

#### 📍 Gym Finder + Filters
- Find nearby gyms using map search, then filter by rating and opening hours.

#### 👤 Account & Profile
- Create and use an account so your data persists between sessions.
- Personalize your profile by choosing from pre-set avatars and backgrounds or upload from your device.

#### ⭐ Premium Upsell Banner (AdMob) (Only run on a compiled dev build on a physical Android device)
- In-app banner (AdMob) encouraging upgrade to premium features.


```bash
⚠️ NOTE: The AdMob banner cannot be tested inside Expo Go. You need to run a compiled dev build on a physical Android device. Instructions in part 4.
```

## ✅ 2. Development setup

After downloading our repository, also ensure that you have downloaded the necessary .env files from our Trello board (Resources column). Afterwards, please follow through the outlined instructions:

- Put the files in their corresponding folders (on Trello the files are named '**frontend**' and '**backend**')

- Once done, rename them to just “**.env**“

- For the frontend .env file, **replace the “YOUR-LOCAL-IP-ADDRESS-HERE”** part with **your local machine’s IP address** (e.g. 192.168.1.20). It needs to be replaced with the IP address of the machine that will be running the backend.

#### Done! Proceed to the instructions below to run our project.

## ✅ 3. Running the App in Development (EXPO workflow)

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

## ✅ 4. Building a dev client for Android (required for testing Google Ads / AdMob)

This workflow gives you an installable Android app (debug/dev build) running on a real device.
Use this when:
- You need to test react-native-google-mobile-ads
- You want to confirm native behavior, like the AdMob banner
- You want to test production-like performance on real hardware

```bash
⚠️ NOTE: You cannot test the AdMob banner inside Expo Go. You must build and install the native dev client on a physical Android phone.
```
#### Step 1. Install dependencies

   ```bash
   npm install
   ```

#### Step 2. Prepare an Android device
1. Connect your Android phone to your computer via USB.

2. On the phone:
- Go to Settings → About phone → Build number
- Tap the build number 7 times to enable Developer Options.
- Go to Settings → Developer options → USB debugging
- Turn on USB debugging.

3. (Windows only) Install your device’s USB driver if needed.
- On macOS/Linux, drivers are not usually required.

#### Step 3. Install Android platform tools (ADB)
- macOS (with Homebrew)

   ```bash
   brew install android-platform-tools
   ```

- Windows \
  Download the official “Android SDK Platform Tools” zip from Google.\
  Extract it and add the platform-tools folder to your PATH.

- Verify ADB is available:

   ```bash
   adb version
   ```

#### Step 4. Authorize the device

1. Plug in the phone via USB
2. Run:

   ```bash
   adb devices
   ```
3. On the phone, accept the “Allow USB debugging?” prompt
4. Run **adb devices** again.\
   You should see your device listed as **device** (not unauthorized or offline).

If it still shows unauthorized:
- Toggle USB debugging off and on.
- Replug the cable.
- Run:

   ```bash
   adb kill-server
   adb start-server
   adb devices
   ```

#### Step 5. Prebuild the native Android project

Because we’re using **react-native-google-mobile-ads**, we need native Android code. expo prebuild generates the android/ directory and injects config.

From the project root:

   ```bash
   npx expo prebuild --platform android
   ```

This will:
- Create/update the android/ folder
- Apply any config from app.json / app.config.js
- Link native modules like ads

#### Step 6. Build and install the dev client on the device

Still from the project root, run:

   ```bash
   npx expo run:android
   ```

What this does:
- Builds a debug/dev variant of the app
- Installs it directly onto the connected Android device
- Boots the app on the device

At this point you are not using Expo Go anymore. You’re running the actual native app, with the Google Mobile Ads SDK included.

#### Step 7. Test Google Ads (AdMob banner / premium upsell)

Open the installed app on the device.
- Navigate to the screen that shows the banner ad / premium upsell surface.
- In dev, this should show the Google test ad unit (for example, TestIds.ADAPTIVE_BANNER from react-native-google-mobile-ads) instead of a live ad.
- You should see a test banner render successfully.

If you don’t see the test banner:
- Confirm the device is online.
- Confirm that you’re not running inside Expo Go.
- Check that you’re using the Google test ad unit ID in dev (never a production ad unit during development).

### ✨ Enjoy using Fitahi!

---
