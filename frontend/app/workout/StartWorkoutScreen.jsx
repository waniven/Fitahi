import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  FlatList,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { Font } from "@/constants/Font";
import WorkoutResult from "@/components/workouts/models/WorkoutResult";
import PrimaryButton from "@/components/PrimaryButton";
import { createWorkoutResult } from "@/services/workoutResultService";

// StartWorkoutScreen lets user click Start on the Workout Log and go to WorkoutScreen
export default function StartWorkoutScreen({ route, navigation }) {
  const scheme = useColorScheme();
  const theme = Colors[scheme ?? "light"];

  // Workout passed from the list
  const workout = route?.params?.workoutDetail ?? route?.params?.workout ?? {};
  const exercises = Array.isArray(workout?.exercises) ? workout.exercises : [];

  // Set header title to workout name (backend uses workoutName)
  useEffect(() => {
    navigation.setOptions({ title: workout?.workoutName || "Workout" });
  }, [navigation, workout?.workoutName]);

  // Build ordered phases
  const phases = useMemo(() => buildPhases(exercises), [exercises]);

  const [phaseIndex, setPhaseIndex] = useState(0);
  const [phaseElapsed, setPhaseElapsed] = useState(0); // Seconds in current phase
  const [totalElapsed, setTotalElapsed] = useState(0); // Entire workout
  const [isRunning, setIsRunning] = useState(false);
  const [completedExercises, setCompletedExercises] = useState([]); // Names

  const currentPhase = phases[phaseIndex] ?? null;

  // Tick timer — increments phaseElapsed AND totalElapsed while running
  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => {
      setPhaseElapsed((s) => s + 1);
      setTotalElapsed((t) => t + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [isRunning]);

  // Reset per-phase elapsed when phase changes
  useEffect(() => {
    setPhaseElapsed(0);
  }, [phaseIndex]);

  // Display value (down phases show remaining, up phases count up)
  let timerValue = 0;
  let isOver = false; // overtime indicator (used only for color)
  if (currentPhase) {
    if (currentPhase.mode === "down") {
      const remaining = (currentPhase.target ?? 0) - phaseElapsed;
      timerValue = remaining;
      // show overtime (red) once it goes negative — but DO NOT auto-advance
      isOver = timerValue < 0;
    } else {
      timerValue = phaseElapsed;
    }
  }

  const onToggleRun = () => setIsRunning((r) => !r);

  // Is the current phase the final WORK set of its exercise?
  const isLastWorkOfExercise = (phase) => {
    if (!phase || phase.type !== "work") return false;
    const ex = exercises[phase.exerciseIndex];
    const sets = toInt(ex?.numOfSets, 1);
    return phase.setIndex === sets;
  };

  // Return a new completed list as if we credited this phase
  const getCompletedAfterPhase = (phase, currentCompleted) => {
    if (!phase || !isLastWorkOfExercise(phase)) return currentCompleted;
    // backend uses exerciseName
    const name = exercises[phase.exerciseIndex]?.exerciseName?.trim();
    return name ? [...currentCompleted, name] : currentCompleted;
  };

  const onNext = () => {
    if (!currentPhase) return;
    setIsRunning(false);

    // Compute + commit completed list before moving on
    setCompletedExercises((prev) => getCompletedAfterPhase(currentPhase, prev));

    if (phaseIndex < phases.length - 1) {
      setPhaseIndex((i) => i + 1);
    }
    // Phase elapsed will reset via the useEffect watching phaseIndex
  };

  const onEnd = async () => {
    setIsRunning(false);

    // Compute a local, up-to-date completed list (don’t trust async state)
    const completedNow = getCompletedAfterPhase(
      currentPhase,
      completedExercises
    );

    // Backend expects: workout_id, totalTimeSpent, completedExercises
    const payload = {
      workout_id: workout?._id ?? workout?.id,
      totalTimeSpent: totalElapsed,
      completedExercises: completedNow,
      dateCompleted: new Date().toISOString(),
    };

    try {
      const saved = await createWorkoutResult(payload);
      navigation.replace("WorkoutResult", { result: saved, workout });
    } catch (err) {
      console.error("Failed to save workout:", err);
      // fallback so UI still works even if backend fails
      const fallback = new WorkoutResult(
        Date.now().toString(),
        totalElapsed,
        completedNow,
        new Date().toISOString(),
        workout?._id ?? workout?.id
      );
      navigation.replace("WorkoutResult", { result: fallback, workout });
    }
  };

  // Current exercise label (work or rest shows the exercise we’re on)
  const currentExerciseName = (() => {
    if (!currentPhase) return "All done";
    const ex = exercises[currentPhase.exerciseIndex];
    return ex?.exerciseName ?? "Exercise";
  })();

  // Up Next: names of exercises after current exercise index
  const nextExerciseNames = (() => {
    if (!currentPhase) return [];
    const afterIdx = (currentPhase.exerciseIndex ?? -1) + 1;
    return exercises
      .slice(afterIdx)
      .map((ex) => ex?.exerciseName || `Exercise ${afterIdx + 1}`);
  })();

  const runIcon = isRunning ? "pause" : "play-arrow";
  const isLastPhase = phaseIndex >= phases.length - 1 || !currentPhase;

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      {/* Total time */}
      <Text
        style={[
          styles.sectionTitle,
          { color: theme.textPrimary, fontFamily: Font.semibold },
        ]}
      >
        TOTAL TIME SPENT WORKING OUT
      </Text>
      <Text
        style={[styles.totalTime, { color: theme.tint, fontFamily: Font.bold }]}
      >
        {fmtHMS(totalElapsed)}
      </Text>

      {/* Current exercise */}
      <Text
        style={[
          styles.sectionTitle,
          { color: theme.textPrimary, fontFamily: Font.semibold },
        ]}
      >
        CURRENT EXERCISE
      </Text>
      <Text
        style={[
          styles.exerciseName,
          { color: theme.textPrimary, fontFamily: Font.bold },
        ]}
      >
        {currentExerciseName}
      </Text>

      {/* Timer Card */}
      <View style={[styles.card, { backgroundColor: theme.backgroundAlt }]}>
        <Text
          style={[
            styles.cardLabel,
            { color: theme.textSecondary, fontFamily: Font.semibold },
          ]}
        >
          {currentPhase?.type === "rest" ? "REST TIMER" : "CURRENT TIMER"}
        </Text>

        <Text
          style={[
            styles.phaseTime,
            {
              color: isOver ? theme.error : theme.textPrimary,
              fontFamily: Font.bold,
            },
          ]}
        >
          {fmtHMS(timerValue)}
        </Text>

        <View style={styles.controlsRow}>
          {/* Start/Pause */}
          <TouchableOpacity
            onPress={onToggleRun}
            activeOpacity={0.8}
            style={[styles.runBtn, { borderColor: theme.tint }]}
            accessibilityRole="button"
            accessibilityLabel={isRunning ? "Pause" : "Start"}
          >
            <MaterialIcons name={runIcon} size={28} color={theme.tint} />
          </TouchableOpacity>

          {/* Next */}
          <TouchableOpacity
            onPress={onNext}
            activeOpacity={0.8}
            disabled={isLastPhase}
            style={[
              styles.nextBtn,
              { backgroundColor: theme.tint },
              isLastPhase && { opacity: 0.4 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Next phase"
          >
            <Text
              style={{
                color: theme.background,
                fontFamily: Font.bold,
                fontSize: 16,
              }}
            >
              Next
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Up Next */}
      <Text
        style={[
          styles.sectionTitle,
          {
            color: theme.textPrimary,
            fontFamily: Font.semibold,
            marginTop: 24,
          },
        ]}
      >
        UP NEXT
      </Text>
      {nextExerciseNames.length === 0 ? (
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
      ) : (
        <FlatList
          data={nextExerciseNames}
          keyExtractor={(n, i) => n + i}
          renderItem={({ item }) => (
            <Text
              style={{
                color: theme.textPrimary,
                fontFamily: Font.bold,
                fontSize: 16,
                marginTop: 6,
                textAlign: "center",
              }}
            >
              {item}
            </Text>
          )}
          style={{ alignSelf: "stretch" }}
          contentContainerStyle={{ paddingTop: 6 }}
        />
      )}
      <View style={{ height: 100 }} />

      {/* End Workout */}
      <PrimaryButton
        title="End Workout"
        onPress={onEnd}
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

/* ---------- helpers ---------- */

// buildPhases builds and constructs different phases of timer
function buildPhases(exercises) {
  const phases = [];
  if (!Array.isArray(exercises)) return phases;

  exercises.forEach((ex, exIdx) => {
    const sets = toInt(ex?.numOfSets, 1);
    // support both names (robustness): prefer exerciseDuration/restTime
    const workDuration = toInt(ex?.exerciseDuration ?? ex?.duration, 0); // seconds; 0 => open-ended
    const rest = toInt(ex?.restTime ?? ex?.rest, 0); // seconds

    for (let set = 1; set <= sets; set++) {
      // Work phase
      phases.push({
        type: "work",
        exerciseIndex: exIdx,
        setIndex: set,
        target: workDuration > 0 ? workDuration : 0,
        mode: workDuration > 0 ? "down" : "up", // duration -> down, none -> up
      });

      // Rest phase (skip after final set of final exercise)
      const isLastSetOfLastExercise =
        exIdx === exercises.length - 1 && set === sets;
      if (rest > 0 && !isLastSetOfLastExercise) {
        phases.push({
          type: "rest",
          exerciseIndex: exIdx,
          setIndex: set,
          target: rest,
          mode: "down", // Rest always counts down
        });
      }
    }
  });

  return phases;
}

// toInt coerces an arbitrary value to a non-negative integer
function toInt(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : fallback;
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
  screen: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },

  sectionTitle: { fontSize: 12, letterSpacing: 0.5, textAlign: "center" },
  totalTime: { fontSize: 28, marginBottom: 16, textAlign: "center" },
  exerciseName: {
    fontSize: 22,
    marginTop: 4,
    marginBottom: 16,
    textAlign: "center",
  },

  card: {
    borderRadius: 16,
    padding: 16,
    alignSelf: "stretch",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
  },
  cardLabel: { fontSize: 12, marginBottom: 8, textAlign: "center" },
  phaseTime: { fontSize: 40, textAlign: "center", marginBottom: 14 },

  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    justifyContent: "center",
  },
  circleBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  nextBtn: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },

  endBtn: {
    marginTop: 24,
    alignSelf: "center",
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  runBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    borderWidth: 2,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
});
