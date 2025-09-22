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
import CustomToast from "../../components/common/CustomToast";

/**
 * Workout creation and management screen that handles workout CRUD operations
 * Displays a list of existing workouts with options to create, edit, delete, and start workouts
 */
function CreateWorkout({ navigation }) {
  const scheme = useColorScheme();
  const theme = Colors[scheme ?? "light"];
  const { toggleChat } = useContext(AIContext);

  // Sets up navigation header with back button and AI chat toggle
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
            <Text style={{ color: theme.background, fontSize: 18 }}>💬</Text>
          </View>
        </TouchableOpacity>
      ),
    });
  }, [navigation, theme, toggleChat]);

  // Main state for workout management
  const [modalIsVisible, setModalIsVisible] = useState(false);
  const [workout, setWorkout] = useState([]);
  const [selectedWorkout, setSelectedWorkout] = useState("");
  
  // Loading states with progress tracking
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const NAV_BAR_HEIGHT = 64;
  const BOX_MAX_HEIGHT = Math.round(Dimensions.get("window").height * 0.7);
  const isEmpty = workout.length === 0;

  // Fetches workouts from backend with animated loading progress
  useEffect(() => {
    async function init() {
      try {
        setLoadingProgress(0.3);
        const data = await workoutService.getWorkouts();
        setLoadingProgress(0.7);

        setWorkout(data);
        setLoadingProgress(1);
      } catch (err) {
        CustomToast.error(
          "Fetch Failed",
          "Unable to load workouts, try again soon."
        );
      } finally {
        setTimeout(() => setIsLoading(false), 300);
      }
    }
    init();
  }, []);

  // Modal control functions
  function startaddWorkoutName() {
    setModalIsVisible(true);
  }

  function endaddWorkoutName() {
    setModalIsVisible(false);
  }

  // Handles both creating new workouts and updating existing ones
  async function saveWorkout(workoutData) {
    try {
      let savedWorkout;
      if (selectedWorkout) {
        savedWorkout = await workoutService.updateWorkout(
          selectedWorkout._id,
          workoutData
        );
        setWorkout((current) =>
          current.map((w) => (w._id === savedWorkout._id ? savedWorkout : w))
        );
      } else {
        savedWorkout = await workoutService.createWorkout(workoutData);
        setWorkout((current) => [...current, savedWorkout]);
      }
      setSelectedWorkout(null);
      endaddWorkoutName();
    } catch (err) {
      CustomToast.error("Save Failed", "Workout couldn't be saved, try again.");
    }
  }

  // Removes workout from backend and updates local state
  async function deleteWorkoutHandler(id) {
    try {
      await workoutService.deleteWorkout(id);
      setWorkout((current) => current.filter((w) => w._id !== id));
    } catch (err) {
      CustomToast.error(
        "Deletion Failed",
        "Workout couldn't be deleted, try again."
      );
    }
  }

  // Opens edit modal for an existing workout
  function startEditWorkout(item) {
    setSelectedWorkout(item);
    setModalIsVisible(true);
  }

  // Renders individual workout cards with edit, delete, and start options
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

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        {/* Modal for creating or editing workout details */}
        <WorkoutInput
          visible={modalIsVisible}
          workoutToEdit={selectedWorkout}
          onAddWorkout={saveWorkout}
          onCancel={() => {
            setSelectedWorkout(null);
            endaddWorkoutName();
          }}
        />

        {/* Scrollable list of existing workouts */}
        {!isEmpty && (
          <View style={[styles.invisibleBox, { maxHeight: BOX_MAX_HEIGHT }]}>
            <FlatList
              data={workout}
              keyExtractor={(item) => item._id}
              renderItem={renderItemData}
              contentContainerStyle={[
                styles.listContent,
                { paddingBottom: NAV_BAR_HEIGHT + 120 },
              ]}
              showsVerticalScrollIndicator
            />
          </View>
        )}

        <View style={{ height: NAV_BAR_HEIGHT + 28 }} />

        {/* Empty state with centered add button or floating action button for existing workouts */}
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

      {/* Loading overlay with progress animation */}
      {isLoading && (
        <LoadingProgress
          progress={loadingProgress}
          message="Fetching workouts..."
        />
      )}

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