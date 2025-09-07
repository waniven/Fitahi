import { useState } from "react";
import {
  Text,
  FlatList,
  StyleSheet,
  View,
  useColorScheme,
  Dimensions,
  Platform,
} from "react-native";
import WorkoutInput from "../../../components/workouts/WorkoutInput";
import WorkoutItem from "../../../components/workouts/WorkoutItem";
import { Colors } from "../../../constants/Colors";
import { Font } from "@/constants/Font";
import Fab from "@/components/FloatingActionButton";

// Create a workout which pops up a workout input and display the created workout
function CreateWorkout({ navigation }) {
  const scheme = useColorScheme();
  const theme = Colors[scheme ?? "light"];
  const [modalIsVisible, setModalIsVisible] = useState(false);
  const [workout, setWorkout] = useState([]);

  const NAV_BAR_HEIGHT = 64; // adjust to the actual nav height
  const BOX_MAX_HEIGHT = Math.round(Dimensions.get("window").height * 0.7); // box height cap

  const isEmpty = workout.length === 0;

  // Controls whether workout input box pops up
  function startaddWorkoutName() {
    setModalIsVisible(true);
  }

  //Turns off workout input box after creating a workout
  function endaddWorkoutName() {
    setModalIsVisible(false);
  }

  //Add workout ???
  function addWorkout(newWorkout) {
    setWorkout((curr) => [...curr, newWorkout]);
    endaddWorkoutName();
  }

  //Render item: list all created workouts and allow to click on???
  function renderItemData({ item }) {
    function pressHandler() {
      navigation.navigate("StartExercise", { workoutDetail: item });
    }
    return (
      <WorkoutItem
        text={item.name}
        id={item.id}
        workoutType={item.type}
        onPress={pressHandler}
      />
    );
  }

  const TextFont = {
    color: theme.textPrimary,
    fontFamily: Font.semibold,
  }

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <WorkoutInput
        visible={modalIsVisible}
        onAddWorkout={addWorkout}
        onCancel={endaddWorkoutName}
      />

      {/* Invisible scrollable box shown only when there are workouts */}
      {!isEmpty && (
        <View style={[styles.invisibleBox, { maxHeight: BOX_MAX_HEIGHT }]}>
          <FlatList
            data={workout}
            keyExtractor={(item) => item.id}
            renderItem={renderItemData}
            contentContainerStyle={[
              styles.listContent,
              { paddingBottom: NAV_BAR_HEIGHT + 100 }, // room for FAB + nav
            ]}
            showsVerticalScrollIndicator
          />
        </View>
      )}

      {/* Spacer so content doesn't collide with FAB/nav */}
      <View style={{ height: NAV_BAR_HEIGHT + 24 }} />

      {/* No workout created state: center of display with text above the + button */}
      {isEmpty ? (
        <View style={styles.fabContainerEmpty}>
          <Text style={[styles.emptyText, TextFont]}>
            Create your first workout
          </Text>
          <Fab
            floating={false} // inline — not absolute
            onPress={startaddWorkoutName}
            color={theme.tint}
            iconColor={theme.textPrimary}
            accessibilityLabel="Create workout"
          ></Fab>
        </View>
      ) : (
        // Have Workouts: + button centered above the nav bar
        <Fab
          onPress={startaddWorkoutName}
          color={theme.tint}
          iconColor={theme.textPrimary}
          bottom={NAV_BAR_HEIGHT + 16}
          accessibilityLabel="Create workout"
        />
      )}
    </View>
  );
}

export default CreateWorkout;

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },

  // Invisible scrollable box (no border/background)
  invisibleBox: { overflow: "hidden" },
  listContent: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },

  // No Workout: center of the entire screen
  fabContainerEmpty: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0, // fill screen
    alignItems: "center",
    justifyContent: "center", // centers both text and button
    zIndex: 9999,
    ...(Platform.OS === "android" ? { elevation: 10 } : {}),
  },
  centerInner: { alignItems: "center", gap: 10 },
  emptyText: { fontSize: 24, margin: 20},

});
