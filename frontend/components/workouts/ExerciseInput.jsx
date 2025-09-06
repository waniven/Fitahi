import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { useState } from "react";
import { Colors } from "@/constants/Colors";
import { Font } from "@/constants/Font";
import Workout from "./models/Workout";

import {
  View,
  TextInput,
  Button,
  StyleSheet,
  Modal,
  Text,
  TouchableOpacity,
  useColorScheme
} from "react-native";

function WorkoutInput(props) {
  const scheme = useColorScheme();
  const theme = Colors[scheme ?? "light"];
  const [enteredWorkoutText, setEnteredWorkoutText] = useState("");
  const [selectedWorkoutType, setWorkoutType] = useState("");
  const [enteredWorkoutSet, setEnteredWorkoutSetText] = useState("");
  const [enteredWorkoutRep, setEnteredWorkoutRepText] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [currentDates, setCurrentDate] = useState(new Date());
  const [show, setShow] = useState(false);

  const onChange = (event, date) => {
    setShow(false);
    if (event.type === "set" && date) {
      const dateString = date.toDateString();
      if (!selectedDates.some((d) => d.toDateString() === dateString)) {
        setSelectedDates((current) => [...current, date]);
      } else {
        alert("You already selected this date!");
      }
    }
  };

  function workoutInputHandler(enteredText) {
    setEnteredWorkoutText(enteredText);
  }

  function workoutTypeInputHandler(enteredText) {
    setWorkoutType(enteredText);
  }

  function workoutSetHandler(enteredText) {
    setEnteredWorkoutSetText(enteredText);
  }

  function workoutRepHandler(enteredText) {
    setEnteredWorkoutRepText(enteredText);
  }

  function addWorkoutHandler() {
    const workout = new Workout(
      Math.random().toString(),
      enteredWorkoutText,
      selectedWorkoutType,
      enteredWorkoutSet,
      enteredWorkoutRep,
      selectedDates,
      
    )
    
    props.onAddWorkout(workout);

    setEnteredWorkoutSetText("");
    setEnteredWorkoutRepText("");
    setSelectedDates([]);
  }

  function cancelAddWorkout() {
    setEnteredWorkoutText("");
    setWorkoutType("");
    props.onCancel();
  }

  const TextFont = {
    color: theme.background,
  }

  return (
    <Modal visible={props.visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.textPrimary }]}>
          <Text style={[styles.header, TextFont, {fontFamily: Font.bold}]}>
            Workout Specifications
          </Text>
          <Text style={[styles.text, TextFont, {fontFamily: Font.regular}]}>
            What will you be working on?
          </Text>
          <Text style={[styles.text, TextFont, {fontFamily: Font.semibold}]}>
            NAME YOUR WORKOUT*
          </Text>
          <TextInput
            style={styles.textInput}
            placeholder="Workout Name"
            onChangeText={workoutInputHandler}
            value={enteredWorkoutText}
          />

          <View style={styles.pickerBox}>
            <Picker
              selectedValue={selectedWorkoutType}
              onValueChange={(itemValue) => setWorkoutType(itemValue)}
            >
              <Picker.Item
                style={styles.workoutType}
                label="Select workout type"
                value=""
                enabled={false}
              />
              <Picker.Item
                label="Strength Training"
                value="strength-training"
              />
              <Picker.Item label="Cadio/Aerobic" value="carido-aerobic" />
            </Picker>
          </View>

          <TextInput
            style={styles.textInput}
            placeholder="No. of Sets"
            onChangeText={workoutSetHandler}
            value={enteredWorkoutSet}
          />

          <TextInput
            style={styles.textInput}
            placeholder="No. of Reps"
            onChangeText={workoutRepHandler}
            value={enteredWorkoutRep}
          />

          <TouchableOpacity
            onPress={() => setShow(true)}
            style={styles.selectDateButton}
          >
            <Text style={{ color: "white", fontSize: 16 }}>Select Date</Text>
          </TouchableOpacity>

          {show && (
            <DateTimePicker
              value={currentDates}
              mode="date"
              display="spinner"
              onChange={onChange}
            />
          )}

          <View
            style={{
              marginVertical: 14,
              flexDirection: selectedDates.length > 1 ? "row" : "column",
              flexWrap: "wrap",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {selectedDates.map((d, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  // Remove the clicked date, maybe add a 'x' button to indicate: LATER
                  setSelectedDates((current) =>
                    current.filter((date) => date.getTime() !== d.getTime())
                  );
                }}
                style={{
                  backgroundColor: "#ffffff33",
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                  borderRadius: 6,
                  margin: 4,
                }}
              >
                <Text style={{ color: "white" }}>{d.toDateString()}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.buttonContainer}>
            <View style={styles.button}>
              <Button
                title="Add Workout"
                onPress={addWorkoutHandler}
                color="#4F9AFF"
              />
            </View>
            <View style={styles.button}>
              <Button
                title="Cancel"
                onPress={cancelAddWorkout}
                color="#1e34a0ff"
              />
            </View>
          </View>
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
    justifyContent: "flex-end",   // push content to bottom
  },
  modalContent: {
    height: "90%",   // 2/3 of screen
    backgroundColor: "#151824",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 14,
  },
  header: {
    fontSize: 22,
    margin: 10,
    paddingTop: 10,
  },
  text: {
    fontSize: 14,
    marginBottom: 20,
    paddingLeft: 12,

  },
  inputContainer: {
    flex: 3,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 1,
    backgroundColor: "#151824",
  },
  image: {
    width: 100,
    height: 100,
    margin: 20,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ffffffff",
    backgroundColor: "#ffffffff",
    color: "#120438",
    borderRadius: 8,
    width: "100%",
    padding: 16,
    margin: 5,
    
    
  },
  buttonContainer: {
    marginTop: 16,
    height: "25%",
    flexDirection: "row",
    borderRadius: 10,
  },
  button: {
    width: "45%",
    marginHorizontal: 8,
    borderRadius: 9,
  },
  datesDetail: {
    backgroundColor: "#ffffff33",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    margin: 4,
  },
  selectDateButton: {
    backgroundColor: "#007bffff",
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 10,
    marginTop: 5,
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
  },
  workoutType: {
    color: "#666668ff",
    fontSize: 14.5,
    
  },
});
