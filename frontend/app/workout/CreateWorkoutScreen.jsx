import { useState } from "react";
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
import { useLayoutEffect } from "react";
import Fab from "@/components/FloatingActionButton";
import BackButton from "@/components/BackButton";
import { Ionicons } from "@expo/vector-icons";
import globalStyles from "../../styles/globalStyles";
import { useRouter } from "expo-router";
import AIassistant from "../ai/AIassistant";
import AIChatbox from "../ai/AIChatbox";
import { Modal } from "react-native";

// CreateWorkout creates a workout which pops up a workout input and display the created workout
function CreateWorkout({ navigation }) {
  const scheme = useColorScheme();
  const theme = Colors[scheme ?? "light"];
  const router = useRouter();
  const [aiOpen, setAiOpen] = useState(false);

  //Back button to go back to Homepage
  useLayoutEffect(() => {
  navigation.setOptions({
    headerLeft: () => <BackButton to="/main" />,
    headerRight: () => (
      <TouchableOpacity
        onPress={() => setAiOpen(true)}
        accessibilityRole="button"
        accessibilityLabel="Open AI assistant"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        activeOpacity={0.8}
        style={{ paddingRight: 8 }}
      >
        {/* Circular button with tint background and AI icon in theme.background */}
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: theme.tint,
            alignItems: "center",
            justifyContent: "center",
            // Subtle shadow like your floating one
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
          }}
        >
          <AIassistant size={26} color={theme.background} />
        </View>
      </TouchableOpacity>
    ),
  });
}, [navigation, theme]);

  const [modalIsVisible, setModalIsVisible] = useState(false);
  const [workout, setWorkout] = useState([]);
  const [selectedWorkout, setSelectedWorkout] = useState("");

  const NAV_BAR_HEIGHT = 64; // Adjust to the actual nav height
  const BOX_MAX_HEIGHT = Math.round(Dimensions.get("window").height * 0.7); // Box height cap

  const isEmpty = workout.length === 0;

  // startaddWorkoutName controls whether workout input box pops up
  function startaddWorkoutName() {
    setModalIsVisible(true);
  }

  // endaddWorkoutName turns off workout input box after creating a workout
  function endaddWorkoutName() {
    setModalIsVisible(false);
  }

  // saveWorkout saves the created workout to the defined list
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

    setSelectedWorkout(null); // Reset after save
    endaddWorkoutName();
  }

  // deleteWorkoutHandler deletes a workout based on a supplied workout's id
  function deleteWorkoutHandler(id) {
    setWorkout((currentworkout) => {
      return currentworkout.filter((workout) => workout.id !== id);
    });
  }

  // startEditWorkout sets the current selected workout and open workout input to edit
  function startEditWorkout(item) {
    setSelectedWorkout(item);
    setModalIsVisible(true);
  }

  // Render item: list all created workouts and allow to click on
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
        <WorkoutInput
          visible={modalIsVisible}
          workoutToEdit={selectedWorkout}
          onAddWorkout={saveWorkout}
          onCancel={() => {
            setSelectedWorkout(null); // Reset if cancelled
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
                { paddingBottom: NAV_BAR_HEIGHT + 120 }, // Room for FAB + nav
              ]}
              showsVerticalScrollIndicator
            />
          </View>
        )}

        {/* Spacer so content doesn't collide with FAB/nav */}
        <View style={{ height: NAV_BAR_HEIGHT + 28 }} />

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

      {/* floating ai button */}
      <Modal
        visible={aiOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setAiOpen(false)}
      >
        <AIChatbox onClose={() => setAiOpen(false)} />
      </Modal>
    </View>
  );
}

export default CreateWorkout;

const styles = StyleSheet.create({
  screen: { flex: 1, paddingTop: 12 }, // No horizontal padding here
  content: { flex: 1, paddingHorizontal: 16 }, // New inner padding

  // Invisible scrollable box (no border/background)
  invisibleBox: { overflow: "hidden" },
  listContent: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },

  // No Workout: center of the entire screen
  fabContainerEmpty: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 64,
    alignItems: "center",
    justifyContent: "center", // Centers both text and button
    zIndex: 9999,
    ...(Platform.OS === "android" ? { elevation: 10 } : {}),
  },
  centerInner: { alignItems: "center", gap: 10 },
  emptyText: { fontSize: 24, margin: 20 },

  // Bottom navigation
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
