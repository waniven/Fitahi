import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  useColorScheme,
} from "react-native";
import { Colors } from "@/constants/Colors";
import { Font } from "@/constants/Font";
import ModalCloseButton from "../ModalCloseButton";
import PrimaryButton from "../PrimaryButton";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ExerciseInput - lets user set exercises for a workout
function ExerciseInput(props) {
  const scheme = useColorScheme(); // Light or dark mode
  const theme = Colors[scheme ?? "light"];

  // Form state
  const [exercises, setExercises] = useState([]);
  const [showErrors, setShowErrors] = useState(false);

  // Modal sizing
  const insets = useSafeAreaInsets();
  const BTN_HEIGHT = 56; // Height of the floating button
  const EXTRA_BOTTOM = 43; // Extra spacing
  const bottomGutter = BTN_HEIGHT + EXTRA_BOTTOM + insets.bottom + 8;

  // Create a new blank exercise
  const makeExercise = () => ({
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    name: "",
    reps: "",
    sets: "",
    weight: "",
    rest: "",
    duration: "",
  });

  // Convert model (from workout) to form state
  const fromModelToForm = (ex) => ({
    id: ex?.id ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    name: ex?.exerciseName ?? "",
    reps: ex?.numOfReps !== undefined ? String(ex.numOfReps) : "",
    sets: ex?.numOfSets !== undefined ? String(ex.numOfSets) : "",
    weight: ex?.exerciseWeight !== undefined ? String(ex.exerciseWeight) : "",
    rest: ex?.restTime !== undefined ? String(ex.restTime) : "",
    duration:
      ex?.exerciseDuration !== undefined ? String(ex.exerciseDuration) : "",
    imageUrl: ex?.imageUrl ?? "",
  });

  // Clear state when modal closes
  useEffect(() => {
    if (!props.visible) {
      setExercises([]);
      setShowErrors(false);
    }
  }, [props.visible]);

  // Seed exercises when modal opens
  useEffect(() => {
    if (!props.visible) return;

    if (!props.workout || !props.workout._id) {
      // New workout --> start with empty
      setExercises([makeExercise()]);
    } else if (props.workout.exercises?.length > 0) {
      // Editing --> load existing exercises
      setExercises(props.workout.exercises.map(fromModelToForm));
    } else {
      // Editing but no exercises yet --> start with one empty
      setExercises([makeExercise()]);
    }

    setShowErrors(false);
  }, [props.visible, props.workout]);

  // Allow only numeric input
  function handleNumericInput(value, optional = false) {
    const filtered = value.replace(/[^0-9]/g, "");
    if (optional && filtered === "") return "";
    return filtered;
  }

  // Validate number input (>0)
  function isInvalidNumber(value) {
    return !value.trim() || Number(value) <= 0;
  }

  // Reset form to empty
  function resetForm() {
    setExercises([makeExercise()]);
    setShowErrors(false);
  }

  // Update specific field of an exercise
  function updateExercise(id, field, value) {
    setExercises((curr) =>
      curr.map((ex) => (ex.id === id ? { ...ex, [field]: value } : ex))
    );
  }

  // Add new exercise card
  function addExerciseCard() {
    setExercises((curr) => [...curr, makeExercise()]);
  }

  // Remove exercise card
  function removeExerciseCard(id) {
    setExercises((curr) => curr.filter((ex) => ex.id !== id));
  }

  // Cancel modal
  function onCancel() {
    resetForm();
    props.onCancel?.();
  }

  // Validate and save exercises
  function onSave() {
    setShowErrors(true);

    for (let i = 0; i < exercises.length; i++) {
      const ex = exercises[i];
      if (
        !ex.name.trim() ||
        isInvalidNumber(ex.reps) ||
        isInvalidNumber(ex.sets) ||
        isInvalidNumber(ex.rest)
      ) {
        return; // Validation failed
      }
    }

    const payload = exercises.map((ex) => ({
      exerciseName: ex.name.trim(),
      numOfSets: Number(ex.sets),
      numOfReps: Number(ex.reps),
      exerciseWeight: Number(ex.weight) || 0,
      exerciseDuration: Number(ex.duration) || 0,
      restTime: Number(ex.rest),
      imageUrl: ex.imageUrl || "",
    }));

    props.onSave?.(payload);
    resetForm();
    props.onCancel?.();
  }

  // Dynamic input styles
  const fieldInputStyle = [
    styles.input,
    {
      backgroundColor: theme.textPrimary,
      color: theme.background,
      borderColor: theme.overlayLight,
      fontFamily: Font.regular,
    },
  ];
  const labelStyle = [
    styles.label,
    { color: theme.background, fontFamily: Font.semibold },
  ];

  // Main render
  return (
    <Modal
      visible={props.visible}
      animationType="slide"
      transparent
      statusBarTranslucent
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContent,
            { backgroundColor: theme.textPrimary, paddingBottom: bottomGutter },
          ]}
        >
          {/* Close button */}
          <ModalCloseButton onPress={onCancel} />

          {/* Header */}
          <Text
            style={[
              styles.header,
              { color: theme.background, fontFamily: Font.bold },
            ]}
          >
            Exercises
          </Text>
          <Text
            style={[
              styles.subheader,
              { color: theme.background, fontFamily: Font.regular },
            ]}
          >
            What exercises will you be performing?
          </Text>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 40 }}
            showsVerticalScrollIndicator
          >
            {/* Exercise cards */}
            {exercises.map((ex, idx) => {
              const nameError = showErrors && !ex.name.trim();
              const repsError = showErrors && isInvalidNumber(ex.reps);
              const setsError = showErrors && isInvalidNumber(ex.sets);
              const restError = showErrors && isInvalidNumber(ex.rest);

              return (
                <View
                  key={ex.id}
                  style={[styles.card, { backgroundColor: theme.inputField }]}
                >
                  <Text
                    style={[
                      styles.cardTitle,
                      {
                        color: theme.background,
                        fontFamily: Font.bold,
                        fontSize: 16,
                      },
                    ]}
                  >
                    EXERCISE {idx + 1}
                  </Text>

                  {/* Name */}
                  <Text style={labelStyle}>EXERCISE NAME *</Text>
                  <TextInput
                    placeholder="Exercise name"
                    placeholderTextColor="#4C5A6A"
                    fontFamily={Font.regular}
                    style={[
                      ...fieldInputStyle,
                      nameError && {
                        borderColor: theme.error,
                        marginBottom: 6,
                      },
                    ]}
                    value={ex.name}
                    onChangeText={(t) => updateExercise(ex.id, "name", t)}
                  />
                  {nameError ? (
                    <Text
                      style={[
                        styles.err,
                        { color: theme.error, fontFamily: Font.regular },
                      ]}
                    >
                      Required
                    </Text>
                  ) : null}

                  {/* Reps & Sets */}
                  <View style={styles.row}>
                    <View style={styles.col}>
                      <Text style={labelStyle}>REPS *</Text>
                      <TextInput
                        placeholder="Reps"
                        placeholderTextColor="#4C5A6A"
                        keyboardType="numeric"
                        style={[
                          ...fieldInputStyle,
                          repsError && {
                            borderColor: theme.error,
                            marginBottom: 6,
                          },
                        ]}
                        value={ex.reps}
                        onChangeText={(t) =>
                          updateExercise(ex.id, "reps", handleNumericInput(t))
                        }
                      />
                      {repsError ? (
                        <Text style={[styles.err, { color: theme.error }]}>
                          {ex.reps.trim() === "" ? "Required" : "Cannot be 0"}
                        </Text>
                      ) : null}
                    </View>

                    <View style={styles.col}>
                      <Text style={labelStyle}>SETS *</Text>
                      <TextInput
                        placeholder="Sets"
                        placeholderTextColor="#4C5A6A"
                        keyboardType="numeric"
                        style={[
                          ...fieldInputStyle,
                          setsError && {
                            borderColor: theme.error,
                            marginBottom: 6,
                          },
                        ]}
                        value={ex.sets}
                        onChangeText={(t) =>
                          updateExercise(ex.id, "sets", handleNumericInput(t))
                        }
                      />
                      {setsError ? (
                        <Text style={[styles.err, { color: theme.error }]}>
                          {ex.reps.trim() === "" ? "Required" : "Cannot be 0"}
                        </Text>
                      ) : null}
                    </View>
                  </View>

                  {/* Weight & Rest */}
                  <View style={styles.row}>
                    <View style={styles.col}>
                      <Text style={labelStyle}>WEIGHT</Text>
                      <TextInput
                        placeholder="Weight"
                        placeholderTextColor="#4C5A6A"
                        keyboardType="numeric"
                        style={fieldInputStyle}
                        value={ex.weight}
                        onChangeText={(t) =>
                          updateExercise(
                            ex.id,
                            "weight",
                            handleNumericInput(t, true)
                          )
                        }
                      />
                    </View>

                    <View style={styles.col}>
                      <Text style={labelStyle}>REST TIME *</Text>
                      <TextInput
                        placeholder="Seconds"
                        placeholderTextColor="#4C5A6A"
                        keyboardType="numeric"
                        style={[
                          ...fieldInputStyle,
                          restError && {
                            borderColor: theme.error,
                            marginBottom: 6,
                          },
                        ]}
                        value={ex.rest}
                        onChangeText={(t) =>
                          updateExercise(ex.id, "rest", handleNumericInput(t))
                        }
                      />
                      {restError ? (
                        <Text style={[styles.err, { color: theme.error }]}>
                          {ex.reps.trim() === "" ? "Required" : "Cannot be 0"}
                        </Text>
                      ) : null}
                    </View>
                  </View>

                  {/* Duration + Delete */}
                  <View style={[styles.row, { alignItems: "flex-end" }]}>
                    <View style={[styles.col, { flex: 1 }]}>
                      <Text style={labelStyle}>DURATION/SET</Text>
                      <TextInput
                        placeholder="Seconds"
                        placeholderTextColor="#4C5A6A"
                        keyboardType="numeric"
                        style={[...fieldInputStyle, { marginBottom: 0 }]}
                        value={ex.duration}
                        onChangeText={(t) =>
                          updateExercise(
                            ex.id,
                            "duration",
                            handleNumericInput(t, true)
                          )
                        }
                      />
                    </View>

                    <TouchableOpacity
                      onPress={() => removeExerciseCard(ex.id)}
                      activeOpacity={0.7}
                      style={[
                        styles.deleteBtn,
                        {
                          borderColor: theme.error,
                          backgroundColor: theme.error,
                          opacity: exercises.length === 1 ? 0.4 : 1, // fade out if only one
                        },
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel={`Delete exercise ${idx + 1}`}
                      disabled={exercises.length === 1} // disable press if only one
                    >
                      <Text
                        style={{
                          color: theme.textPrimary,
                          fontFamily: Font.bold,
                        }}
                      >
                        Delete
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}

            {/* Add Exercise button */}
            <TouchableOpacity
              onPress={addExerciseCard}
              activeOpacity={0.8}
              style={[styles.addBtn, { borderColor: theme.tint }]}
            >
              <Text style={{ color: theme.tint, fontFamily: Font.bold }}>
                + Add Exercise
              </Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Save Workout button */}
          <PrimaryButton
            title="Save Workout"
            onPress={onSave}
            floating
            extraBottom={40}
            insetLR={14}
            tabBarHeight={0}
            style={{ width: "100%" }}
          />
        </View>
      </View>
    </Modal>
  );
}

export default ExerciseInput;

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, justifyContent: "flex-end" },
  modalContent: {
    height: "90%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 14,
  },
  header: { fontSize: 22, margin: 8, paddingTop: 6 },
  subheader: { fontSize: 14, marginBottom: 16, paddingLeft: 12 },

  card: { borderRadius: 12, padding: 12, marginBottom: 14 },
  cardTitle: { fontSize: 14, marginBottom: 8, paddingLeft: 4 },

  label: { fontSize: 12, marginBottom: 6, paddingLeft: 4 },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 14,
  },

  row: { flexDirection: "row", gap: 10 },
  col: { flex: 1 },

  deleteBtn: {
    alignSelf: "flex-end",
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: "center",
    marginLeft: 10,
    marginTop: 0,
  },

  addBtn: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },

  err: { fontSize: 12, marginLeft: 6, marginTop: -6 },
});
