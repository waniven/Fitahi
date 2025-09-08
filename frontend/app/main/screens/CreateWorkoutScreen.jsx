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
import ListCardItem from "@/components/ListCardItem";
import { Colors } from "../../../constants/Colors";
import { Font } from "@/constants/Font";
import Fab from "@/components/FloatingActionButton";

// Create a workout which pops up a workout input and display the created workout
function CreateWorkout({ navigation }) {
  const scheme = useColorScheme();
  const theme = Colors[scheme ?? "light"];
  const [modalIsVisible, setModalIsVisible] = useState(false);
  const [workout, setWorkout] = useState([]);
  const [selectedWorkout, setSelectedWorkout] = useState('');
  

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

  //saveWorkout saves the created workout to the defined list
  function saveWorkout(workout) {
    if (selectedWorkout) {
      // Edit mode → replace existing workout
      setWorkout((current) =>
        current.map((w) => (w.id === workout.id ? workout : w))
      );
    } else {
      // Add mode → append
      setWorkout((current) => [...current, workout]);
    }

    setSelectedWorkout(null); // reset after save
    endaddWorkoutName();
  }

  //deleteWorkoutHandler deletes a workout based on a supplied workout's id
  function deleteWorkoutHandler(id) {
    setWorkout((currentworkout) => {
      return currentworkout.filter((workout) => workout.id !== id);
    });
  }

  //startEditWorkout sets the current selected workout and open workout input to edit
  function startEditWorkout(item) {
    setSelectedWorkout(item);
    setModalIsVisible(true);
  }

  //Render item: list all created workouts and allow to click on
  function renderItemData({ item }) {
    function startWorkoutSreen(item) {
      navigation.navigate("StartWorkoutScreen", { workoutDetail: item });
    }
    return (
      

      <ListCardItem
        workout={item}
        onEdit={startEditWorkout}
        onDelete={deleteWorkoutHandler}
        onStart={startWorkoutSreen}
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
        workoutToEdit={selectedWorkout}
        onAddWorkout={saveWorkout}
        onCancel={() => {
          setSelectedWorkout(null);      // reset if cancelled
          endaddWorkoutName();
        }}
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
