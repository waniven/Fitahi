import { useLayoutEffect, useState, useEffect } from "react";
import {
  Image,
  StyleSheet,
  Text,
  ScrollView,
  View,
  TouchableOpacity,
  FlatList,
  useColorScheme,
} from "react-native";
import { Colors } from "../../../constants/Colors";
import globalStyles from "../../../styles/globalStyles";

function StartExercise({ route, navigation }) {
  const scheme = useColorScheme(); //black theme
  const theme = Colors[scheme ?? "light"];
  const workout = route.params.workoutDetail;

  //Store which set the user is currently on
  const [activeSet, setActiveSet] = useState(0);

  //Timer for current set (for example: SET 1)
  const [time, setTime] = useState(0);

  //Timer for rest
  const [isResting, setIsResting] = useState(false);
  const [restTime, setRestTime] = useState(10); //Rest automatically sets for 10 seconds

  //Array of SET
  const [sets, setSets] = useState(
    Array.from({ length: workout.numOfSets }, () => ({
      reps: workout.numOfReps,
      completed: false,
      duration: 0,
    }))
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      title: workout.name,
    });
  }, [navigation]);

  function handlerExercise() {}

  // Timer effect for active set
  useEffect(() => {
    let interval = null;
    if (!isResting && activeSet < sets.length) {
      interval = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isResting, activeSet]);

  // Rest timer effect
  useEffect(() => {
    let restInterval = null;
    if (isResting) {
      restInterval = setInterval(() => {
        setRestTime((prev) => {
          if (prev <= 1) {
            clearInterval(restInterval);
            setIsResting(false);
            setTime(0); // reset set timer
            setRestTime(10); // reset rest timer
            setActiveSet((prevSet) => prevSet + 1); // move to next set
            return 10;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(restInterval);
  }, [isResting]);

  function handleFinishSet() {
    // Save duration
    const updatedSets = [...sets];
    updatedSets[activeSet].duration = time;
    updatedSets[activeSet].completed = true;
    setSets(updatedSets);

    // Start rest
    setIsResting(true);
  }

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      
      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>
          {isResting
            ? `Rest: ${restTime}s`
            : `Set Timer: ${formatTime(time)}`}
        </Text>
      </View>

      
      <FlatList
        data={sets}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.row}>
            <Text style={styles.setText}>
              SET {index + 1} / {item.reps} reps
            </Text>
            {activeSet === index && !isResting ? (
              <TouchableOpacity
                style={styles.finishButton}
                onPress={handleFinishSet}
              >
                <Text style={styles.finishButtonText}>Finish</Text>
              </TouchableOpacity>
            ) : item.completed ? (
              <Text style={styles.completedText}>
                ✅ {formatTime(item.duration)}
              </Text>
            ) : (
              <Text style={styles.pendingText}>Pending</Text>
            )}
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </View>
  );
}

export default StartExercise;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  timerContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  timerText: {
    fontSize: 24,
    color: "white",
    fontWeight: "700",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(113, 183, 254, 0.3)",
    padding: 16,
    marginVertical: 5,
    borderRadius: 10,
  },
  setText: {
    fontSize: 18,
    color: "white",
  },
  finishButton: {
    backgroundColor: "white",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  finishButtonText: {
    fontWeight: "700",
    color: "#71b7fe",
  },
  completedText: {
    color: "lightgreen",
    fontWeight: "700",
  },
  pendingText: {
    color: "lightgray",
    fontStyle: "italic",
  },
});