import React from "react";
import { View, Text, StyleSheet, useColorScheme, FlatList } from "react-native";
import { Colors } from "@/constants/Colors";
import { Font } from "@/constants/Font";
import PrimaryButton from "@/components/PrimaryButton";
import { useSafeAreaInsets } from "react-native-safe-area-context";

//WorkoutResultScreen displays the result after finishing a workout
export default function WorkoutResultScreen({ route, navigation }) {
  const scheme = useColorScheme();
  const theme = Colors[scheme ?? "light"];
  const insets = useSafeAreaInsets();

  const result = route?.params?.result;
  const workout = route?.params?.workout;

  const workoutName = workout?.workoutName ?? "Workout";
  const total = result?.totalTimeSpent ?? 0;
  const completed = Array.isArray(result?.completedExercises)
    ? result.completedExercises
    : [];

  const BUTTON_HEIGHT = 64;
  const EXTRA_BOTTOM = 40;
  const bottomReserve = insets.bottom + EXTRA_BOTTOM + BUTTON_HEIGHT;

  return (
    <View
      style={[
        styles.screen,
        { backgroundColor: theme.background, paddingBottom: 110 },
      ]}
    >
      {/* Top (non-scroll) */}
      <View style={styles.topSection}>
        <Text
          style={[
            styles.title,
            { color: theme.textPrimary, fontFamily: Font.bold },
          ]}
        >
          {workoutName}
        </Text>

        <Text
          style={[
            styles.sectionLabel,
            { color: theme.textSecondary, fontFamily: Font.semibold },
          ]}
        >
          TOTAL TIME SPENT WORKING OUT
        </Text>
        <Text
          style={[
            styles.totalTime,
            { color: theme.tint, fontFamily: Font.bold },
          ]}
        >
          {fmtHMS(total)}
        </Text>

        <Text style={styles.star}>✨</Text>
        <Text
          style={[
            styles.keepItUp,
            { color: theme.textPrimary, fontFamily: Font.semibold },
          ]}
        >
          Keep it up!
        </Text>

        <Text
          style={[
            styles.sectionLabel,
            {
              color: theme.textSecondary,
              fontFamily: Font.semibold,
              marginTop: 24,
            },
          ]}
        >
          COMPLETED EXERCISES
        </Text>
      </View>

      {/* Scrollable list area */}
      <View style={styles.listWrapper}>
        {completed.length === 0 ? (
          <View
            style={{
              paddingTop: 8,
              paddingBottom: bottomReserve,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: theme.textSecondary,
                fontFamily: Font.regular,
                marginTop: 6,
                textAlign: "center",
              }}
            >
              —
            </Text>
          </View>
        ) : (
          <FlatList
            data={completed}
            keyExtractor={(name, idx) => `${name}-${idx}`}
            renderItem={({ item }) => (
              <Text
                style={{
                  color: theme.textPrimary,
                  fontFamily: Font.bold,
                  fontSize: 16,
                  textAlign: "center",
                  marginVertical: 6,
                }}
              >
                {item}
              </Text>
            )}
            // Allow scrolling and keep space for floating button
            contentContainerStyle={{
              paddingTop: 8,
              paddingBottom: bottomReserve,
              alignItems: "center",
            }}
            showsVerticalScrollIndicator
          />
        )}
      </View>

      {/* Floating bottom button */}
      <PrimaryButton
        title="Go back to Workout Logs"
        onPress={() => navigation.popToTop()}
        floating
        extraBottom={40}
        insetLR={14}
        tabBarHeight={0}
        style={{ width: "100%", marginTop: 0 }}
        textStyle={{ fontSize: 16 }}
      />
    </View>
  );
}

// pad2 left-pad a number to 2 digits with a leading zero
function pad2(n) {
  return (Math.abs(n) < 10 ? "0" : "") + Math.abs(n);
}

// fmtHMS formats a number of seconds into "HH:MM:SS"
function fmtHMS(seconds) {
  const sign = seconds < 0 ? "-" : "";
  const s = Math.abs(Math.trunc(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${sign}${pad2(h)}:${pad2(m)}:${pad2(sec)}`;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 50,
  },
  topSection: {
    alignItems: "center",
  },
  title: { fontSize: 22, marginBottom: 20, textAlign: "center" },
  sectionLabel: { fontSize: 12, letterSpacing: 0.5, textAlign: "center" },
  totalTime: { fontSize: 32, marginTop: 6, textAlign: "center" },
  star: { fontSize: 40, marginTop: 16, textAlign: "center" },
  keepItUp: { fontSize: 16, marginTop: 6, textAlign: "center" },

  // This grows and becomes scrollable
  listWrapper: {
    flex: 1,
    alignSelf: "stretch",
    marginTop: 8, // To move it up a bit under the section title
  },
});
