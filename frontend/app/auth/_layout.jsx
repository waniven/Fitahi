import { Stack } from "expo-router";

export default function AuthLayout() {
  //render stack navigator with custom screen option
  return (
    <Stack
      screenOptions={{
        headerShown: false, //hide the header bar for all screens
        animation: "slide_from_right", // use a slide from right animation when navigation between screen
      }}
    />
  );
}
