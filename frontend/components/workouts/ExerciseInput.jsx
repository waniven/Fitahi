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

// ExerciseInput let user set exercises in a workout
function ExerciseInput(props) {
  const scheme = useColorScheme();
  const theme = Colors[scheme ?? "light"];

  const [exercises, setExercises] = useState([]);
  const [showErrors, setShowErrors] = useState(false);

  // Set the size of the modal content and scrollview
  const insets = useSafeAreaInsets();
  const BTN_HEIGHT = 56; //Height of the button
  const EXTRA_BOTTOM = 43;
  const bottomGutter = BTN_HEIGHT + EXTRA_BOTTOM + insets.bottom + 8;

  const makeExercise = () => ({
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    name: "",
    reps: "",
    sets: "",
    weight: "",
    rest: "",
    duration: "",
  });

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

  // clears state whenever the modal closes, so leftover exercises never linger
  useEffect(() => {
    if (!props.visible) {
      setExercises([]);
      setShowErrors(false);
    }
  }, [props.visible]);

  //seeds the exercises whenever the modal opens,
  // either with existing workout data (for editing) or a fresh empty exercise (for new workouts)
  useEffect(() => {
    if (!props.visible) return;

    // if workout exists and has exercises, seed them
    const existing = props.workout?.exercises;

    // always start fresh if workout is new (no id) or no exercises
    if (!props.workout || !existing || existing.length === 0) {
      setExercises([makeExercise()]);
    } else {
      setExercises(existing.map(fromModelToForm));
    }

    setShowErrors(false);
  }, [props.visible, props.workout]);

  // allows only digits, keeps empty string for optional fields
  function handleNumericInput(value, optional = false) {
    const filtered = value.replace(/[^0-9]/g, "");
    if (optional && filtered === "") return "";
    return filtered;
  }

  // resetForm allows to reset form to original state
  function resetForm() {
    setExercises([makeExercise()]);
    setShowErrors(false);
  }

  // updateExercise updates the current exercises with new values
  function updateExercise(id, field, value) {
    setExercises((curr) =>
      curr.map((ex) => (ex.id === id ? { ...ex, [field]: value } : ex))
    );
  }

  // addExerciseCard adds each exercise input into an array
  function addExerciseCard() {
    setExercises((curr) => [...curr, makeExercise()]);
  }

  // removeExerciseCard removes a selected exercise card
  function removeExerciseCard(id) {
    setExercises((curr) => {
      if (curr.length <= 1) {
        alert("You must have at least one exercise in a workout.");
        return curr; // don’t delete anything
      }
      return curr.filter((ex) => ex.id !== id);
    });
  }

  // onCancel allows to click X to go back to Workout Input
  function onCancel() {
    resetForm();
    props.onCancel?.();
  }

  // onSave checks each exercise form is valid and save them into an array and send back to the parent
  function onSave() {
    setShowErrors(true);

    for (let i = 0; i < exercises.length; i++) {
      const ex = exercises[i];

      // validation: required fields must be filled
      if (
        !ex.name.trim() ||
        !ex.reps.trim() ||
        !ex.sets.trim() ||
        !ex.rest.trim()
      ) {
        return; // errors will show under fields
      }

      // validation: reps, sets, rest cannot be 0
      if (
        Number(ex.reps) <= 0 ||
        Number(ex.sets) <= 0 ||
        Number(ex.rest) <= 0
      ) {
        return;
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
          <ModalCloseButton onPress={onCancel} />

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
            {exercises.map((ex, idx) => {
              const nameError = showErrors && !ex.name.trim();
              const repsError = showErrors && !ex.reps.trim();
              const setsError = showErrors && !ex.sets.trim();
              const restError = showErrors && !ex.rest.trim();

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
                      {/* Reps */}
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
                          Required
                        </Text>
                      ) : null}
                    </View>

                    <View style={styles.col}>
                      <Text style={labelStyle}>SETS *</Text>
                      {/* Sets */}
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
                          Required
                        </Text>
                      ) : null}
                    </View>
                  </View>

                  {/* Weight & Rest */}
                  <View style={styles.row}>
                    <View style={styles.col}>
                      <Text style={labelStyle}>WEIGHT</Text>
                      {/* Weight (optional) */}
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
                      {/* Rest */}
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
                          Required
                        </Text>
                      ) : null}
                    </View>
                  </View>

                  {/* Duration + Delete */}
                  <View style={[styles.row, { alignItems: "flex-end" }]}>
                    <View style={[styles.col, { flex: 1 }]}>
                      <Text style={labelStyle}>DURATION/SET</Text>
                      {/* Duration (optional) */}
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
                        },
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel={`Delete exercise ${idx + 1}`}
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

            {/* Add Exercise */}
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

          {/* Save Workout */}
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
