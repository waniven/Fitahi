import { useState, useEffect, useLayoutEffect, useContext } from "react";
import * as workoutService from "../../services/workoutService";
import {
  Text,
  FlatList,
  StyleSheet,
  View,
  useColorScheme,
  Dimensions,
  Platform,
  TouchableOpacity,
} from "react-native";
import WorkoutInput from "../../components/workouts/WorkoutInput";
import ListCardItem from "@/components/ListCardItem";
import { Colors } from "../../constants/Colors";
import { Font } from "@/constants/Font";
import Fab from "@/components/FloatingActionButton";
import CustomButtonThree from "../../components/common/CustomButtonThree";
import { AIContext } from "../ai/AIContext";
import BottomNav from "@/components/navbar/BottomNav";
import LoadingProgress from "@/components/LoadingProgress";

// CreateWorkout creates a workout which pops up a workout input and display the created workout
function CreateWorkout({ navigation }) {
  const scheme = useColorScheme();
  const theme = Colors[scheme ?? "light"];
  const { toggleChat } = useContext(AIContext);

  // Back button to go back to Homepage
  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <CustomButtonThree onPress={() => navigation.goBack()} />
      ),
      headerRight: () => (
        <TouchableOpacity
          onPress={toggleChat}
          activeOpacity={0.85}
          style={{ paddingRight: 8 }}
        >
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: "#6761d7ff",
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 5,
            }}
          >
            {/* C) Emoji fallback */}
            <Text style={{ color: theme.background, fontSize: 18 }}>💬</Text>
          </View>
        </TouchableOpacity>
      ),
    });
  }, [navigation, theme, toggleChat]);

  // states
  const [modalIsVisible, setModalIsVisible] = useState(false);
  const [workout, setWorkout] = useState([]);
  const [selectedWorkout, setSelectedWorkout] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const NAV_BAR_HEIGHT = 64;
  const BOX_MAX_HEIGHT = Math.round(Dimensions.get("window").height * 0.7);

  const isEmpty = workout.length === 0;

  // fetching workouts when screen mounts
  useEffect(() => {
    async function init() {
      try {
        // simulate incremental progress while fetching
        setLoadingProgress(0.3);
        const data = await workoutService.getWorkouts();
        setLoadingProgress(0.7);

        setWorkout(data);
        setLoadingProgress(1); // complete
      } catch (err) {
        console.error(
          "Failed to fetch workouts:",
          err.response?.data || err.message
        );
      } finally {
        // wait a short tick so users see the bar finish
        setTimeout(() => setIsLoading(false), 300);
      }
    }
    init();
  }, []);

  // modal
  function startaddWorkoutName() {
    setModalIsVisible(true);
  }

  function endaddWorkoutName() {
    setModalIsVisible(false);
  }

  // create & update workout via backend
  async function saveWorkout(workoutData) {
    try {
      let savedWorkout;
      if (selectedWorkout) {
        // update existing workout
        savedWorkout = await workoutService.updateWorkout(
          selectedWorkout._id,
          workoutData
        );
        setWorkout((current) =>
          current.map((w) => (w._id === savedWorkout._id ? savedWorkout : w))
        );
      } else {
        // create new workout
        savedWorkout = await workoutService.createWorkout(workoutData);
        setWorkout((current) => [...current, savedWorkout]);
      }
      setSelectedWorkout(null);
      endaddWorkoutName();
    } catch (err) {
      console.error("Failed to save workout:", err);
    }
  }

  // delete workout via backend
  async function deleteWorkoutHandler(id) {
    try {
      await workoutService.deleteWorkout(id);
      setWorkout((current) => current.filter((w) => w._id !== id));
    } catch (err) {
      console.error("Failed to delete workout:", err);
    }
  }

  // edit workout
  function startEditWorkout(item) {
    setSelectedWorkout(item);
    setModalIsVisible(true);
  }

  // render each workout exercise item
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
  };

  // UI render
  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <WorkoutInput
          visible={modalIsVisible}
          workoutToEdit={selectedWorkout}
          onAddWorkout={saveWorkout}
          onCancel={() => {
            setSelectedWorkout(null);
            endaddWorkoutName();
          }}
        />

        {/* Workouts list */}
        {!isEmpty && (
          <View style={[styles.invisibleBox, { maxHeight: BOX_MAX_HEIGHT }]}>
            <FlatList
              data={workout}
              keyExtractor={(item) => item._id} // unique id from backend
              renderItem={renderItemData}
              contentContainerStyle={[
                styles.listContent,
                { paddingBottom: NAV_BAR_HEIGHT + 120 },
              ]}
              showsVerticalScrollIndicator
            />
          </View>
        )}

        {/* Spacer so content doesn't collide with FAB/nav */}
        <View style={{ height: NAV_BAR_HEIGHT + 28 }} />

        {/* No workout state */}
        {isEmpty ? (
          <View style={styles.fabContainerEmpty}>
            <Text style={[styles.emptyText, TextFont]}>
              Create your first workout
            </Text>
            <Fab
              floating={false}
              onPress={startaddWorkoutName}
              color={theme.tint}
              iconColor={theme.textPrimary}
              accessibilityLabel="Create workout"
            />
          </View>
        ) : (
          <Fab
            onPress={startaddWorkoutName}
            color={theme.tint}
            iconColor={theme.textPrimary}
            bottom={NAV_BAR_HEIGHT + 25}
            accessibilityLabel="Create workout"
          />
        )}
      </View>

      {isLoading && (
        <LoadingProgress
          progress={loadingProgress}
          message="Fetching workouts..."
        />
      )}

      {/* bottom navigation */}
      <BottomNav />
    </View>
  );
}

export default CreateWorkout;

const styles = StyleSheet.create({
  screen: { flex: 1, paddingTop: 12 },
  content: { flex: 1, paddingHorizontal: 16 },
  invisibleBox: { overflow: "hidden" },
  listContent: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  fabContainerEmpty: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 64,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    ...(Platform.OS === "android" ? { elevation: 10 } : {}),
  },
  centerInner: { alignItems: "center", gap: 10 },
  emptyText: { fontSize: 24, margin: 20 },
});
