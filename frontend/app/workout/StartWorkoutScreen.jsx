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
import PrimaryButton from "@/components/PrimaryButton";
import { createWorkoutResult } from "@/services/workoutResultService";
import CustomToast from "@/components/common/CustomToast";

/**
 * Active workout execution screen with timer and exercise progression
 * Manages workout phases, tracks time, and handles workout completion
 */
export default function StartWorkoutScreen({ route, navigation }) {
  const scheme = useColorScheme();
  const theme = Colors[scheme ?? "light"];

  // Extracts workout data passed from the workout list
  const workout = route?.params?.workoutDetail ?? route?.params?.workout ?? {};
  const exercises = Array.isArray(workout?.exercises) ? workout.exercises : [];

  // Sets navigation header title to the workout name
  useEffect(() => {
    navigation.setOptions({ title: workout?.workoutName || "Workout" });
  }, [navigation, workout?.workoutName]);

  // Builds ordered sequence of work and rest phases from exercises
  const phases = useMemo(() => buildPhases(exercises), [exercises]);

  // Workout timing and progression state
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [phaseElapsed, setPhaseElapsed] = useState(0);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  
  // Tracks completed exercise names for final results
  const [completedExercises, setCompletedExercises] = useState([]);

  const currentPhase = phases[phaseIndex] ?? null;

  // Timer increment logic - updates both phase and total elapsed time
  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => {
      setPhaseElapsed((s) => s + 1);
      setTotalElapsed((t) => t + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [isRunning]);

  // Resets phase timer when moving to next phase
  useEffect(() => {
    setPhaseElapsed(0);
  }, [phaseIndex]);

  // Calculates timer display value based on phase mode (countdown vs count-up)
  let timerValue = 0;
  let isOver = false;
  if (currentPhase) {
    if (currentPhase.mode === "down") {
      const remaining = (currentPhase.target ?? 0) - phaseElapsed;
      timerValue = remaining;
      isOver = timerValue < 0;
    } else {
      timerValue = phaseElapsed;
    }
  }

  const onToggleRun = () => setIsRunning((r) => !r);

  // Determines if current phase is the final work set of its exercise
  const isLastWorkOfExercise = (phase) => {
    if (!phase || phase.type !== "work") return false;
    const ex = exercises[phase.exerciseIndex];
    const sets = toInt(ex?.numOfSets, 1);
    return phase.setIndex === sets;
  };

  // Updates completed exercises list when finishing an exercise's final set
  const getCompletedAfterPhase = (phase, currentCompleted) => {
    if (!phase || !isLastWorkOfExercise(phase)) return currentCompleted;
    const name = exercises[phase.exerciseIndex]?.exerciseName?.trim();
    return name ? [...currentCompleted, name] : currentCompleted;
  };

  // Advances to the next phase and updates completed exercises
  const onNext = () => {
    if (!currentPhase) return;
    setIsRunning(false);

    setCompletedExercises((prev) => getCompletedAfterPhase(currentPhase, prev));

    if (phaseIndex < phases.length - 1) {
      setPhaseIndex((i) => i + 1);
    }
  };

  // Completes workout and saves results to backend
  const onEnd = async () => {
    setIsRunning(false);

    const completedNow = getCompletedAfterPhase(
      currentPhase,
      completedExercises
    );

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
      CustomToast.error("Save Failed", "Workout couldn't be saved, try again.");
    }
  };

  // Gets the name of the currently active exercise
  const currentExerciseName = (() => {
    if (!currentPhase) return "All done";
    const ex = exercises[currentPhase.exerciseIndex];
    return ex?.exerciseName ?? "Exercise";
  })();

  // Gets list of upcoming exercise names for preview
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
      {/* Total workout duration display */}
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

      {/* Currently active exercise name */}
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

      {/* Main timer card with controls */}
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

        {/* Timer control buttons */}
        <View style={styles.controlsRow}>
          <TouchableOpacity
            onPress={onToggleRun}
            activeOpacity={0.8}
            style={[styles.runBtn, { borderColor: theme.tint }]}
            accessibilityRole="button"
            accessibilityLabel={isRunning ? "Pause" : "Start"}
          >
            <MaterialIcons name={runIcon} size={28} color={theme.tint} />
          </TouchableOpacity>

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

      {/* Preview of upcoming exercises */}
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

      {/* Fixed bottom button to end workout */}
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

// Constructs alternating work and rest phases from exercise definitions
function buildPhases(exercises) {
  const phases = [];
  if (!Array.isArray(exercises)) return phases;

  exercises.forEach((ex, exIdx) => {
    const sets = toInt(ex?.numOfSets, 1);
    const workDuration = toInt(ex?.exerciseDuration ?? ex?.duration, 0);
    const rest = toInt(ex?.restTime ?? ex?.rest, 0);

    for (let set = 1; set <= sets; set++) {
      // Work phase with countdown or count-up timer
      phases.push({
        type: "work",
        exerciseIndex: exIdx,
        setIndex: set,
        target: workDuration > 0 ? workDuration : 0,
        mode: workDuration > 0 ? "down" : "up",
      });

      // Rest phase between sets (skip after final set of final exercise)
      const isLastSetOfLastExercise =
        exIdx === exercises.length - 1 && set === sets;
      if (rest > 0 && !isLastSetOfLastExercise) {
        phases.push({
          type: "rest",
          exerciseIndex: exIdx,
          setIndex: set,
          target: rest,
          mode: "down",
        });
      }
    }
  });

  return phases;
}

// Converts value to non-negative integer with fallback
function toInt(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : fallback;
}

// Pads number to 2 digits with leading zero
function pad2(n) {
  return (Math.abs(n) < 10 ? "0" : "") + Math.abs(n);
}

// Formats seconds as HH:MM:SS with negative sign support
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

  nextBtn: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
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