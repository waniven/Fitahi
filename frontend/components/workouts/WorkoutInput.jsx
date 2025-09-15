import { useState, useEffect } from "react";
import { Colors } from "@/constants/Colors";
import { Font } from "@/constants/Font";
import ModalCloseButton from "../ModalCloseButton";
import PrimaryButton from "../PrimaryButton";
import ExerciseInput from "./ExerciseInput";
import {
  View,
  TextInput,
  StyleSheet,
  Modal,
  Text,
  TouchableOpacity,
  useColorScheme,
  Alert,
} from "react-native";

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

function WorkoutInput(props) {
  const scheme = useColorScheme();
  const theme = Colors[scheme ?? "light"];

  const [enteredWorkoutName, setEnteredWorkoutName] = useState("");
  const [selectedWorkoutType, setWorkoutType] = useState("");
  const [selectedDays, setSelectedDays] = useState([]);
  const [showErrors, setShowErrors] = useState(false);
  const [workout, setWorkout] = useState(null);
  const [modalIsVisible, setModalIsVisible] = useState(false);

  useEffect(() => {
    if (props.visible) {
      if (props.workoutToEdit) {
        // Editing mode
        setEnteredWorkoutName(props.workoutToEdit.workoutName || "");
        setWorkoutType(props.workoutToEdit.workoutType || "");
        setSelectedDays(props.workoutToEdit.selectedDays || []);
        setWorkout(props.workoutToEdit);
      } else {
        resetForm();
      }
    }
  }, [props.visible, props.workoutToEdit]);

  function startAddExercise() {
    setModalIsVisible(true);
  }

  function endAddExercise() {
    setModalIsVisible(false);
  }

  function resetForm() {
    setEnteredWorkoutName("");
    setWorkoutType("");
    setSelectedDays([]);
    setShowErrors(false);
  }

  function workoutInputHandler(enteredText) {
    setEnteredWorkoutName(enteredText);
  }

  function workoutTypeInputHandler(type) {
    setWorkoutType(type);
  }

  function toggleDay(idx) {
    setSelectedDays((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  }

  function addWorkoutHandler() {
    const isNameValid = enteredWorkoutName.trim().length > 0;
    const isTypeValid = !!selectedWorkoutType;
    const isDaysValid = selectedDays.length > 0;

    setShowErrors(true);
    if (!isNameValid || !isTypeValid || !isDaysValid) {
      const missing = [];
      if (!isNameValid) missing.push("workout name");
      if (!isTypeValid) missing.push("workout type");
      if (!isDaysValid) missing.push("workout days");

      Alert.alert(
        "Complete all fields",
        `Please provide: ${missing.join(", ")}`
      );
      return;
    }

    // Build workout object with latest info
    const draft = {
      ...props.workoutToEdit,
      workoutName: enteredWorkoutName.trim(),
      workoutType: selectedWorkoutType,
      selectedDays,
      exercises: workout?.exercises || props.workoutToEdit?.exercises || [],
    };

    setWorkout(draft); // make sure the workout object always has name/type/days + existing exercises
    startAddExercise();
  }

  function cancelAddWorkout() {
    resetForm();
    props.onCancel?.();
  }

  function onSaveExercises(exercisesPayload) {
    if (!workout) return;

    // Validation for exercise names
    for (let i = 0; i < exercisesPayload.length; i++) {
      const ex = exercisesPayload[i];
      if (!ex.exerciseName || ex.exerciseName.trim() === "") {
        alert(`Exercise #${i + 1} is missing a name.`);
        return;
      }
    }

    // Merge exercises and ensure correct mapping
    const workoutToSend = {
      ...workout, // includes workoutName, workoutType, selectedDays
      exercises: exercisesPayload.map((ex) => ({
        exerciseName: ex.exerciseName.trim(),
        numOfSets: Number(ex.numOfSets) || 1,
        numOfReps: Number(ex.numOfReps) || 1,
        exerciseWeight: Number(ex.exerciseWeight) || 0,
        exerciseDuration: Number(ex.exerciseDuration) || 0,
        restTime: Number(ex.restTime) || 0,
        imageUrl: ex.imageUrl || "",
      })),
    };

    props.onAddWorkout(workoutToSend);

    // Reset state
    setWorkout(null);
    setModalIsVisible(false);
    resetForm();
    props.onCancel?.();
  }

  const TextFont = { color: theme.background };
  const isTypeInvalid = showErrors && !selectedWorkoutType;
  const isNameInvalid = showErrors && enteredWorkoutName.trim().length === 0;
  const isDayInvalid = showErrors && selectedDays.length === 0;

  return (
    <Modal
      visible={props.visible}
      animationType="slide"
      transparent
      statusBarTranslucent
    >
      <View style={styles.modalOverlay}>
        <View
          style={[styles.modalContent, { backgroundColor: theme.textPrimary }]}
        >
          <ModalCloseButton onPress={cancelAddWorkout} />
          <Text style={[styles.header, TextFont, { fontFamily: Font.bold }]}>
            Workout Specifications
          </Text>
          <Text style={[styles.text, TextFont, { fontFamily: Font.regular }]}>
            What will you be working on?
          </Text>

          <Text
            style={[styles.textTitle, TextFont, { fontFamily: Font.semibold }]}
          >
            NAME YOUR WORKOUT*
          </Text>
          <TextInput
            style={[
              styles.textInput,
              { backgroundColor: theme.inputField, fontFamily: Font.regular },
              isNameInvalid && { borderColor: theme.error, marginBottom: 6 },
            ]}
            placeholder="Workout name"
            onChangeText={workoutInputHandler}
            value={enteredWorkoutName}
          />
          {isNameInvalid && (
            <Text
              style={{
                color: theme.error,
                marginLeft: 10,
                marginTop: 2,
                fontFamily: Font.regular,
                fontSize: 12,
              }}
            >
              Please enter a workout name
            </Text>
          )}

          <Text
            style={[styles.textTitle, TextFont, { fontFamily: Font.semibold }]}
          >
            WORKOUT TYPE*
          </Text>
          <View
            style={[
              styles.fieldGroup,
              isTypeInvalid ? { marginBottom: 10 } : { marginBottom: 25 },
            ]}
          >
            <View
              style={[
                styles.typeRow,
                isTypeInvalid && {
                  borderWidth: 1,
                  borderColor: theme.error,
                  borderRadius: 8,
                  padding: 6,
                  marginTop: 1,
                },
              ]}
            >
              {[
                { label: "Cardio", value: "cardio" },
                { label: "Strength", value: "strength" },
                { label: "Hypertrophy", value: "hypertrophy" },
              ].map(({ label, value }) => {
                const active = selectedWorkoutType === value;
                return (
                  <TouchableOpacity
                    key={value}
                    onPress={() => workoutTypeInputHandler(value)}
                    style={[
                      styles.typeBtn,
                      {
                        backgroundColor: active ? theme.tint : theme.inputField,
                        borderColor: active ? theme.tint : theme.inputField,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        fontFamily: Font.bold,
                        fontSize: 16,
                        color: active ? theme.background : "#0B2239",
                      }}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {isTypeInvalid && (
              <Text
                style={{
                  color: theme.error,
                  marginLeft: 10,
                  marginTop: 6,
                  fontFamily: Font.regular,
                  fontSize: 12,
                }}
              >
                Please choose one workout type
              </Text>
            )}
          </View>

          <Text
            style={[
              styles.text,
              TextFont,
              { fontFamily: Font.semibold, marginBottom: 8 },
            ]}
          >
            WHAT DAYS WILL YOU BE PERFORMING THIS WORKOUT ON? *
          </Text>
          <View
            style={[
              styles.daysRow,
              showErrors &&
                isDayInvalid && {
                  borderWidth: 1,
                  borderColor: theme.error,
                  borderRadius: 8,
                  paddingVertical: 6,
                  marginTop: 1,
                },
            ]}
          >
            {DAYS.map((label, idx) => {
              const active = selectedDays.includes(idx);
              return (
                <TouchableOpacity
                  key={idx}
                  onPress={() => toggleDay(idx)}
                  style={[
                    styles.dayBox,
                    {
                      backgroundColor: active ? theme.tint : theme.inputField,
                      borderColor: active ? theme.tint : theme.inputField,
                    },
                  ]}
                >
                  <Text
                    style={[
                      TextFont,
                      {
                        color: active ? theme.background : "#0B2239",
                        fontFamily: Font.bold,
                        fontSize: 16,
                      },
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {isDayInvalid && (
            <Text
              style={{
                color: theme.error,
                marginLeft: 10,
                marginTop: 1,
                fontFamily: Font.regular,
                fontSize: 12,
              }}
            >
              Please choose at least one day
            </Text>
          )}

          <ExerciseInput
            visible={modalIsVisible}
            workout={workout}
            onCancel={endAddExercise}
            onSave={onSaveExercises}
          />

          <PrimaryButton
            title="Next"
            onPress={addWorkoutHandler}
            floating
            extraBottom={40}
            tabBarHeight={0}
            insetLR={14}
            style={{ width: "100%" }}
          />
        </View>
      </View>
    </Modal>
  );
}

export default WorkoutInput;

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, justifyContent: "flex-end" },
  modalContent: {
    height: "90%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 14,
    paddingBottom: 120,
  },
  header: { fontSize: 22, margin: 8, paddingTop: 6 },
  text: { fontSize: 14, marginBottom: 30, paddingLeft: 12 },
  textTitle: { fontSize: 14, marginBottom: 2, paddingLeft: 12 },
  textInput: {
    borderWidth: 1,
    borderColor: "#ffffff",
    backgroundColor: "#ffffff",
    color: "#120438",
    borderRadius: 8,
    width: "97%",
    padding: 16,
    margin: 5,
    marginBottom: 25,
  },
  daysRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 6,
    marginBottom: 8,
    justifyContent: "center",
  },
  dayBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  typeRow: {
    marginTop: 5,
    flexDirection: "column",
    paddingHorizontal: 6,
    gap: 8,
  },
  fieldGroup: {},
  typeBtn: {
    borderWidth: 0,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    alignSelf: "center",
  },
});
