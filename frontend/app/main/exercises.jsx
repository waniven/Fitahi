import { ScrollView, StyleSheet, Text, TouchableOpacity, useColorScheme } from 'react-native';
import { Colors } from "../../constants/Colors";
import globalStyles from "../../styles/globalStyles";

// Sample exercise data for demonstration purposes
const dummyExercises = [
  { id: '1', name: 'Push Ups', duration: '10 mins' },
  { id: '2', name: 'Squats', duration: '15 mins' },
  { id: '3', name: 'Plank', duration: '5 mins' },
];

/**
 * Component that displays a list of available exercises
 * Shows exercise cards with names and duration information
 */
export default function Exercises() {
  // Gets current color scheme and applies appropriate theme colors
  const scheme = useColorScheme();
  const theme = Colors[scheme ?? 'light'];

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[globalStyles.textBold, styles.title, { color: theme.tint }]}>
        Exercises 🏋️‍♀️
      </Text>

      {/* Renders clickable cards for each exercise with name and duration */}
      {dummyExercises.map((exercise) => (
        <TouchableOpacity
          key={exercise.id}
          activeOpacity={0.8}
          style={[styles.card, { backgroundColor: theme.backgroundAlt }]}
        >
          <Text style={[globalStyles.textBold, styles.cardTitle, { color: theme.textPrimary }]}>
            {exercise.name}
          </Text>
          <Text style={[globalStyles.textRegular, styles.cardSubtitle, { color: theme.textSecondary }]}>
            Duration: {exercise.duration}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 60,
  },
  title: {
    fontSize: 26,
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    padding: 18,
    borderRadius: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 14,
  },
});