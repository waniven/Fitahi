import { StyleSheet, Text, View, Pressable } from "react-native";

function WorkoutItem(props) {
  return (
    <View style={styles.workoutItem}>
      <Pressable
        android_ripple={{ color: "#95aeffff" }}
        // onPress={props.onDeleteItem.bind(this, props.id)}
        onPress={props.onPress}
      >
        <View style={styles.detailItem}>
          
          <Text style={styles.workoutName}>Workout Name</Text>
          <Text style={styles.workoutNameTitle}>{props.text}</Text>
          <Text style={styles.workoutText}>{props.workoutType}</Text>
        </View>
      </Pressable>
    </View>
  );
}

export default WorkoutItem;

const styles = StyleSheet.create({
  workoutItem: {
    flex: 2,
    margin: 3,
    borderRadius: 6,
    backgroundColor: "#d3deffff",
    color: "white",
    marginTop: 10,
  },

  detailItem: {
    margin: 4,
  },

  workoutName: {
    color: "#737373ff",
    fontSize: 13,
    marginLeft: 6,
  },

  workoutNameTitle: {
    color: "#black",
    fontSize: 18,
    margin: 6,
    fontWeight: "600",
  },

  workoutText: {
    color: "black",
    padding: 8,
  },
  
});
