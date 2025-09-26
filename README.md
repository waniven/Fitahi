# 💪 Fitahi

Fitahi is a MERN (MongoDB, Express, React Native, Node.js) fitness app with features to help users track and log their workouts, nutrition, supplements, water intake, biometrics, and more. It is an all-in-one fitness buddy primarily tailored for Android phones, but works on iOS phones as well.

This guide will help you get the app up and running locally on your machine.

## ✅ Prerequisites

Before you start, make sure you have installed **Expo Go** on your phone:

- [For Android](https://play.google.com/store/apps/details?id=host.exp.exponent)

- [For iOS](https://apps.apple.com/app/expo-go/id982107779)

After downloading our repository, also ensure that you have downloaded the necessary .env files from our Trello board (Resources column). Afterwards, please follow through the outlined instructions:

- Put the files in their corresponding folders (on Trello the files are named '**frontend**' and '**backend**')

- Once done, rename them to just “**.env**“

- For the frontend .env file, **replace the “YOUR-LOCAL-IP-ADDRESS-HERE”** part with **your local machine’s IP address** (e.g. 192.168.1.20). It needs to be replaced with the IP address of the machine that will be running the backend.

#### Done! Proceed to the instructions below to run our project.

## ⚙️ Backend Setup

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

## 📱 Frontend Setup

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

### ✨ Enjoy using Fitahi!

---
