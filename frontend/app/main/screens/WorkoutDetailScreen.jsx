import {
  Image,
  StyleSheet,
  Text,
  ScrollView,
  View,
  TouchableOpacity,
} from "react-native";
import { Colors } from "../../../constants/Colors";

function ShowWorkoutDetail({ route }) {
  const scheme = "dark"; // black theme
  const theme = Colors[scheme ?? "light"];
  const workout = route.params.workoutDetail;

  function handlerExercise() {}

  return (
    <View
      style={[styles.workoutsContainer, { backgroundColor: theme.background }]}
    >
      <ScrollView style={{ flex: 1}}>
      <View style={styles.imageContainer}>
        <Image
          style={styles.image}
          source={require("../../../assets/images/workout.jpg")}
        ></Image>
      </View>
      <View style={styles.items}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemWkNameText}>{workout.name}</Text>
          <Text style={styles.itemWkTypeText}>{workout.type}</Text>
        </View>
        <View style={styles.itemContent}>
          <View style={styles.row}>
            <Text style={styles.label}>Workout Type</Text>
            <Text style={styles.value}>{workout.type}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>No. of Sets</Text>
            <Text style={styles.value}>{workout.numOfSets}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>No. of Reps</Text>
            <Text style={styles.value}>{workout.numOfReps}</Text>
          </View>
          
        </View>
      </View>
      </ScrollView>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.tint }]}
        onPress={handlerExercise}
      >
        <Text style={[styles.buttonText, { color: theme.background }]}>
          Get Started
        </Text>
      </TouchableOpacity>
    </View>
  );
}
export default ShowWorkoutDetail;
const styles = StyleSheet.create({
  workoutsContainer: {
    flex: 1,
    
  },
  imageContainer: {
    alignItems: "center",
    borderRadius: 10,
  },
  image: {
    width: "90%",
    height: 200,
    borderRadius: 6,
    alignItems: "center",
  },
  items: {
    flex: 2,
    margin: 8,
    
  },
  itemHeader: {
    flex: 0.7,
    margin: 2,
    padding: 10,
  },
  itemContent: {
    flex: 2,
  },
  itemWkTypeText: {
    color: "white",
    margin: 2,
  },
  itemWkNameText: {
    color: "white",
    margin: 2,
    fontSize: 24,
  },
  text: {
    color: "white",
  },
  row: {
    backgroundColor: "rgba(113, 183, 254, 0.4)",
    opacity: 30,
    margin: 5,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    
  },
  label: {
    fontSize: 16,
    color: "white",
  },
  value: {
    fontSize: 16,
    fontWeight: "200",
    color: "white",
  },
  button: {
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    margin: 15,
    bottom: 40,
    
  },
  buttonText: { 
    fontSize: 17, 
    fontWeight: "700",
  },
});
