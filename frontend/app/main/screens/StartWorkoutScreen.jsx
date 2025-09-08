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

export default function StartWorkoutScreen({ route, navigation }) {
  const scheme = useColorScheme();
  const theme = Colors[scheme ?? "light"];

  const workout =
    route?.params?.workoutDetail ??
    route?.params?.workout ??
    {};
  const exercises = Array.isArray(workout?.exercises)
    ? workout.exercises
    : route?.params?.exercises ?? [];

  // Build ordered phases: for each exercise, each set gets a "work" phase,
  // then (unless it’s the final set of the final exercise) a "rest" phase.
  const phases = useMemo(() => buildPhases(exercises), [exercises]);

  const [phaseIndex, setPhaseIndex] = useState(0);
  const [phaseElapsed, setPhaseElapsed] = useState(0); // seconds in current phase
  const [totalElapsed, setTotalElapsed] = useState(0); // whole workout
  const [isRunning, setIsRunning] = useState(false);

  const currentPhase = phases[phaseIndex] ?? null;

  // Tick timer
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

  // Display logic: down phases show remaining (target - elapsed), red < 0; up phases count up.
  let timerValue = 0;
  let isOver = false;
  if (currentPhase) {
    if (currentPhase.mode === "down") {
      const remaining = (currentPhase.target ?? 0) - phaseElapsed;
      timerValue = remaining;
      isOver = remaining < 0;
    } else {
      // 'up'
      timerValue = phaseElapsed;
      isOver = false;
    }
  }

  const onToggleRun = () => setIsRunning((r) => !r);

  const onNext = () => {
    setIsRunning(false);
    if (phaseIndex < phases.length - 1) {
      setPhaseIndex((i) => i + 1);
    } else {
      // Finished
      // Can navigate to a summary or simply go back:
      navigation.goBack();
    }
  };

  const onEnd = () => {
    setIsRunning(false);
    navigation.goBack();
  };

  // Current exercise name
  const currentExerciseName = (() => {
    if (!currentPhase) return "All done";
    const ex = exercises[currentPhase.exerciseIndex];
    return ex?.name ?? "Exercise";
    // Note: during a rest phase, this still shows the exercise you just worked.
  })();

  // Up Next: show names of exercises after the current exercise index (unique & ordered)
  const nextExerciseNames = (() => {
    if (!currentPhase) return [];
    const afterIdx = currentPhase.exerciseIndex + 1;
    const names = [];
    const seen = new Set();
    for (let i = afterIdx; i < exercises.length; i++) {
      const n = exercises[i]?.name ?? "";
      if (n && !seen.has(n)) {
        seen.add(n);
        names.push(n);
      }
    }
    return names;
  })();

  const runIcon = isRunning ? "pause" : "play-arrow";
  const isFinished = !currentPhase;

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      {/* Total time */}
      <Text style={[styles.sectionTitle, { color: theme.textPrimary, fontFamily: Font.semibold }]}>
        TOTAL TIME SPENT WORKING OUT
      </Text>
      <Text style={[styles.totalTime, { color: theme.tint, fontFamily: Font.bold }]}>
        {fmtHMS(totalElapsed)}
      </Text>

      {/* Current exercise */}
      <Text style={[styles.sectionTitle, { color: theme.textPrimary, fontFamily: Font.semibold }]}>
        CURRENT EXERCISE
      </Text>
      <Text style={[styles.exerciseName, { color: theme.textPrimary, fontFamily: Font.bold }]}>
        {currentExerciseName}
      </Text>

      {/* Timer Card */}
      <View style={[styles.card, { backgroundColor: theme.backgroundAlt }]}>
        <Text style={[styles.cardLabel, { color: theme.textSecondary, fontFamily: Font.semibold }]}>
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
          {/* Start/Pause circular button */}
          <TouchableOpacity
            onPress={onToggleRun}
            activeOpacity={0.8}
            style={[styles.circleBtn, { borderColor: theme.tint }]}
            accessibilityRole="button"
            accessibilityLabel={isRunning ? "Pause" : "Start"}
          >
            <MaterialIcons name={runIcon} size={28} color={theme.tint} />
          </TouchableOpacity>

          {/* Next button */}
          <TouchableOpacity
            onPress={onNext}
            activeOpacity={0.8}
            style={[styles.nextBtn, { backgroundColor: theme.tint }]}
            accessibilityRole="button"
            accessibilityLabel="Next phase"
            disabled={isFinished}
          >
            <Text style={{ color: theme.background, fontFamily: Font.bold, fontSize: 16 }}>
              Next
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Up Next */}
      <Text style={[styles.sectionTitle, { color: theme.textPrimary, fontFamily: Font.semibold, marginTop: 24 }]}>
        UP NEXT
      </Text>
      {nextExerciseNames.length === 0 ? (
        <Text style={{ color: theme.textSecondary, fontFamily: Font.regular, marginTop: 6 }}>
          —
        </Text>
      ) : (
        <FlatList
          data={nextExerciseNames}
          keyExtractor={(n, i) => n + i}
          renderItem={({ item }) => (
            <Text style={{ color: theme.textPrimary, fontFamily: Font.bold, fontSize: 16, marginVertical: 4 }}>
              {item}
            </Text>
          )}
          style={{ alignSelf: "stretch" }}
          contentContainerStyle={{ paddingTop: 6 }}
        />
      )}

      {/* End Workout */}
      <TouchableOpacity
        onPress={onEnd}
        activeOpacity={0.8}
        style={[styles.endBtn, { borderColor: theme.error }]}
        accessibilityRole="button"
        accessibilityLabel="End Workout"
      >
        <Text style={{ color: theme.error, fontFamily: Font.bold }}>End Workout</Text>
      </TouchableOpacity>
    </View>
  );
}



function buildPhases(exercises) {
  const phases = [];
  if (!Array.isArray(exercises)) return phases;

  exercises.forEach((ex, exIdx) => {
    const sets = toInt(ex?.numOfSets, 1);
    const workDuration = toInt(ex?.duration, 0); // seconds; 0 => open-ended
    const rest = toInt(ex?.rest, 0);             // seconds

    for (let set = 1; set <= sets; set++) {
      // Work phase
      phases.push({
        type: "work",
        exerciseIndex: exIdx,
        setIndex: set,
        target: workDuration > 0 ? workDuration : 0,
        mode: workDuration > 0 ? "down" : "up", // duration -> down, no duration -> up
      });

      // Rest phase (skip after the very last set of the very last exercise)
      const isLastSetOfLastExercise =
        exIdx === exercises.length - 1 && set === sets;

      if (rest > 0 && !isLastSetOfLastExercise) {
        phases.push({
          type: "rest",
          exerciseIndex: exIdx,
          setIndex: set,
          target: rest,
          mode: "down", // REST COUNTS DOWN
        });
      }
    }
  });

  return phases;
}

function toInt(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : fallback;
}

function pad2(n) {
  return (Math.abs(n) < 10 ? "0" : "") + Math.abs(n);
}

function fmtHMS(seconds) {
  // seconds can be negative; show leading '-' when < 0
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
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  sectionTitle: {
    fontSize: 12,
    letterSpacing: 0.5,
  },
  totalTime: {
    fontSize: 28,
    marginBottom: 16,
  },
  exerciseName: {
    fontSize: 22,
    marginTop: 4,
    marginBottom: 16,
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
  cardLabel: {
    fontSize: 12,
    marginBottom: 8,
  },
  phaseTime: {
    fontSize: 40,
    textAlign: "center",
    marginBottom: 14,
  },

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
    paddingHorizontal: 28,
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
});
