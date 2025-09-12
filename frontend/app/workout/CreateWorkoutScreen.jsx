import { useState, useEffect, useLayoutEffect, useContext } from "react";
import * as workoutService from "../../services/workoutService";
import { loginTemp } from "../../services/api";
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
import BackButton from "@/components/BackButton";
import { Ionicons } from "@expo/vector-icons";
import globalStyles from "../../styles/globalStyles";
import { AIContext } from "../ai/AIContext";
import { useRouter } from "expo-router";

// CreateWorkout creates a workout which pops up a workout input and display the created workout
function CreateWorkout({ navigation }) {
  const scheme = useColorScheme();
  const theme = Colors[scheme ?? "light"];
  const { toggleChat } = useContext(AIContext);
  const router = useRouter();

  // Back button to go back to Homepage
  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => <BackButton to="/main" />,
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

  const NAV_BAR_HEIGHT = 64;
  const BOX_MAX_HEIGHT = Math.round(Dimensions.get("window").height * 0.7);

  const isEmpty = workout.length === 0;

  // fetching workouts when screen mounts
  useEffect(() => {
    async function init() {
      const loggedIn = await loginTemp();
      if (!loggedIn) {
        console.error("Could not log in, skipping fetch.");
        return;
      }

      try {
        const data = await workoutService.getWorkouts();
        setWorkout(data);
      } catch (err) {
        console.error(
          "Failed to fetch workouts:",
          err.response?.data || err.message
        );
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

      {/* bottom navigation */}
      <View style={[styles.bottomNav, { backgroundColor: "#fff" }]}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/home/index")}
        >
          <Ionicons name="home-outline" size={26} color={theme.tint} />
          <Text style={[globalStyles.navText, { color: theme.tint }]}>
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/main/analytics")}
        >
          <Ionicons name="stats-chart-outline" size={26} color={theme.tint} />
          <Text style={[globalStyles.navText, { color: theme.tint }]}>
            Analytics
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/main/supplements")}
        >
          <Ionicons name="medkit-outline" size={26} color={theme.tint} />
          <Text style={[globalStyles.navText, { color: theme.tint }]}>
            Supplements
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/profile/AccountSettings")}
        >
          <Ionicons name="settings-outline" size={26} color={theme.tint} />
          <Text style={[globalStyles.navText, { color: theme.tint }]}>
            Settings
          </Text>
        </TouchableOpacity>
      </View>
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
  bottomNav: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    zIndex: 1000,
    ...(Platform.OS === "android" ? { elevation: 20 } : {}),
  },
  navItem: {
    alignItems: "center",
  },
});
