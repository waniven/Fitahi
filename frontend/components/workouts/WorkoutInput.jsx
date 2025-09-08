import { useState } from "react";
import { Colors } from "@/constants/Colors";
import { Font } from "@/constants/Font";
import Workout from "./models/Workout";
import ModalCloseButton from "../ModalCloseButton";
import PrimaryButton from "../PrimaryButton";
import { useEffect } from "react";

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

//WorkoutInput lets user fill out workout and exercises
function WorkoutInput(props) {
  const scheme = useColorScheme();
  const theme = Colors[scheme ?? "light"];
  const [enteredWorkoutText, setEnteredWorkoutText] = useState("");
  const [selectedWorkoutType, setWorkoutType] = useState("");
  const [selectedDays, setSelectedDays] = useState([]);
  const [showErrors, setShowErrors] = useState(false);
  const [workout, setWorkout] = useState(null);
  const [modalIsVisible, setModalIsVisible] = useState(false);

  useEffect(() => {
    if (props.visible) {
      if (props.workoutToEdit) {
        // Editing mode
        setEnteredWorkoutText(props.workoutToEdit.name || "");
        setWorkoutType(props.workoutToEdit.type || "");
        setSelectedDays(props.workoutToEdit.selectedDays || []);
        setWorkout(props.workoutToEdit);
      } else {
        // Adding mode, reset form
        resetForm();
      }
    }
  }, [props.visible, props.workoutToEdit]);

  // startAddExercise pop ups a new input to enter exercises and save data into workout type
  function startAddExercise() {
    // addExcersies();
    setModalIsVisible(true);
  }

  // endAddExercise turns off Add Excersise Input
  function endAddExercise() {
    setModalIsVisible(false);
  }

  //Reset form
  function resetForm() {
    setEnteredWorkoutText("");
    setWorkoutType("");
    setSelectedDays([]);
    setShowErrors(false);
  }

  //workoutInputHandler sets workout name
  function workoutInputHandler(enteredText) {
    setEnteredWorkoutText(enteredText);
  }
  //workoutTypeInputHandler sets selected workout type
  function workoutTypeInputHandler(enteredText) {
    setWorkoutType(enteredText);
  }
  
  //toggleDay sets selected days
  function toggleDay(idx) {
    setSelectedDays((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  }

  //addWorkoutHandler checks all fields are filled and saved a temporary workout
  function addWorkoutHandler() {
    const isNameValid = enteredWorkoutText.trim().length > 0;
    const isTypeValid = !!selectedWorkoutType;
    const isDaysValid = selectedDays.length > 0;

    //show highlights after 1st attempt
    setShowErrors(true);
    if (!isNameValid || !isTypeValid || !isDaysValid) {
      const missing = [];
      if (!isNameValid) missing.push("workout name");
      if (!isTypeValid) missing.push("workout type");
      if (!isDaysValid) missing.push("workday days");

      Alert.alert(
        "Complete all fields",
        `Please provide: ${missing.join(", ")}`
      );
      return;
    }

    // Build a draft object to pass into ExerciseInput
    const draft = props.workoutToEdit
      ? {
          ...props.workoutToEdit,
          name: enteredWorkoutText,
          type: selectedWorkoutType,
          selectedDays,
        }
      : new Workout(
          Math.random().toString(),
          enteredWorkoutText,
          selectedWorkoutType,
          selectedDays
        );
    setWorkout(draft);
    setShowErrors(false);
    startAddExercise();
  }

  //cancelAddWorkout let user cancel workout and go back to Workout Log
  function cancelAddWorkout() {
    setEnteredWorkoutText("");
    setWorkoutType("");
    setSelectedDays([]);
    setShowErrors(false);
    props.onCancel();
    resetForm();
    props.onCancel?.();
  }

  //onSaveExercises saves all exercises on the draft workout
  function onSaveExercises(payload) {
    // Merge exercises into the current draft (add or edit)
    const base = workout ?? {};
    const updatedWorkout = {
      ...base,
      name: enteredWorkoutText,
      type: selectedWorkoutType,
      selectedDays,
      exercises: payload,
    };

    setWorkout(updatedWorkout);
    setShowErrors(false);
    props.onAddWorkout(updatedWorkout); // <-- use the updated object, not stale state
    setModalIsVisible(false); // close ExerciseInput
    resetForm(); // clear WorkoutInput fields
    props.onCancel?.(); // close WorkoutInput modal
  }

  const TextFont = {
    color: theme.background,
  };

  const isTypeInvalid = showErrors && !selectedWorkoutType;
  const isNameInvalid = showErrors && enteredWorkoutText.trim().length === 0;
  const isDayInvalid = showErrors && selectedDays.length === 0;

  return (
    <Modal visible={props.visible} animationType="slide" transparent={true}>
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
            value={enteredWorkoutText}
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
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    accessibilityLabel={`${label} workout`}
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

          {/* DAYS GRID */}
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
            workout={workout} // when editing, contains existing exercises
            onCancel={endAddExercise}
            onSave={onSaveExercises}
          />

          {/* Buttons */}
          <PrimaryButton
            title="Next"
            onPress={addWorkoutHandler}
            floating
            extraBottom={20}
            tabBarHeight={0}
            insetLR={14}
            // full width
            style={{ width: "100%" }}
          />
        </View>
      </View>
    </Modal>
  );
}

export default WorkoutInput;

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    justifyContent: "center",
    padding: 14,
    borderBottomWidth: 1,
    backgroundColor: "#151824",
  },
  emptyContainer: {
    flex: 0.5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end", // push content to bottom
  },
  modalContent: {
    height: "93%",
    backgroundColor: "#151824",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 14,
    paddingBottom: 120,
  },
  header: {
    fontSize: 22,
    margin: 8,
    paddingTop: 6,
  },
  text: {
    fontSize: 14,
    marginBottom: 30,
    paddingLeft: 12,
  },
  textTitle: {
    fontSize: 14,
    marginBottom: 2,
    paddingLeft: 12,
  },
  image: {
    width: 100,
    height: 100,
    margin: 20,
  },

  pickerBox: {
    borderWidth: 1,
    borderColor: "#ffffffff",
    backgroundColor: "#ffffffff",
    color: "#0b0223ff",
    borderRadius: 8,
    width: "100%",
    margin: 5,
    height: 50,
    justifyContent: "center",
    paddingHorizontal: 6,
    overflow: "hidden",
    marginBottom: 25,
  },
  workoutType: {
    color: "#666668ff",
    fontSize: 14.5,
    fontFamily: "Montserrat",
  },
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
  // NEW: days grid styles
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
