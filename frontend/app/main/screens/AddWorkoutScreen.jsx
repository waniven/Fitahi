import { useState } from "react";
import { Button, FlatList, StyleSheet, View } from "react-native";
import WorkoutInput from "../../../components/workouts/WorkoutInput";
import WorkoutItem from "../../../components/workouts/WorkoutItem";
import { Colors } from "../../../constants/Colors";

function AddWorkout({ navigation }) {
  const scheme = "dark"; // black theme
  const theme = Colors[scheme ?? "light"];
  const [modalIsVisible, setModalIsVisible] = useState(false);

  const [workout, setworkout] = useState([]);

  //Add workout name visible
  function startaddWorkoutName() {
    setModalIsVisible(true);
  }

  //Add workout name end not visible
  function endaddWorkoutName() {
    setModalIsVisible(false);
  }
  //Add workout name
  function addWorkout(workout) {
    setworkout((currentworkout) => [...currentworkout, workout]);
    endaddWorkoutName();
  }
  //Add workout type
  function addWorkoutType(enteredWorkoutType) {
    setworkout((currentworkout) => [
      ...currentworkout,
      { text: enteredWorkoutName, id: Math.random().toString() },
    ]);
    endaddWorkoutName();
  }

  //Delete filling text workout
  function deleteWorkoutHandler(id) {
    setworkout((currentworkout) => {
      return currentworkout.filter((workout) => workout.id !== id);
    });
  }

  function renderItemData(itemData) {
    function pressHandler() {
      navigation.navigate("ShowWorkoutDetail", {
        workoutDetail: itemData.item,
      });
    }

    return (
      <WorkoutItem //Render item to the list
        text={itemData.item.name}
        id={itemData.item.id}
        workoutType={itemData.item.type}
        // onDeleteItem={deleteWorkoutHandler}
        onPress={pressHandler}
      />
    );
  }

  return (
    <View style={[styles.appContainer, {backgroundColor: theme.background}]}>
      <Button
        title="Create Workouts"
        color="#0A84FF"
        onPress={startaddWorkoutName}
      />

      <WorkoutInput
        visible={modalIsVisible}
        onAddWorkout={addWorkout}
        onCancel={endaddWorkoutName}
      />
      <View style={styles.workoutContainer}>
        <FlatList
          data={workout}
          renderItem={renderItemData}
          keyExtractor={(item, index) => {
            return item.id;
          }}
          alwaysBounceVertical={false}
        />
      </View>
    </View>
  );
}

export default AddWorkout;

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    paddingTop: 16,
    paddingHorizontal: 16,
    margin: 10,
    alignItems: 'center',
  },

  buttonCreate: {
    flex: 1,
    marginTop: 100,
  },

  workoutContainer: {
    flex: 3,
  },
});
