import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { Colors } from "../../constants/Colors";
import globalStyles from "../../styles/globalStyles";

export default function AnalyticsScreen() {
  const scheme = useColorScheme();
  const theme = Colors[scheme ?? 'light'];

  // Simplified stats (just titles/icons, values are placeholders)
  const stats = [
    { id: 1, icon: 'walk', title: 'Steps' },
    { id: 2, icon: 'flame', title: 'Calories Burned' },
    { id: 3, icon: 'bar-chart', title: 'Workout Time' },
    { id: 4, icon: 'fitness', title: 'Active Days' },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Page header */}
      <Text style={[globalStyles.textBold, styles.header, { color: theme.tint }]}>
       Analytics Dashboard
      </Text>

      {/* Stats Cards */}
      <View style={styles.statsRow}>
        {stats.map((stat) => (
          <View
            key={stat.id}
            style={[styles.statCard, { backgroundColor: theme.backgroundAlt }]}
          >
            <Ionicons name={stat.icon} size={28} color={theme.tint} />
            <Text
              style={[
                globalStyles.textBold,
                styles.statTitle,
                { color: theme.textPrimary },
              ]}
            >
              {stat.title}
            </Text>
            {/* Placeholder instead of numbers */}
            <Text
              style={[
                globalStyles.textRegular,
                styles.statPlaceholder,
                { color: theme.textSecondary },
              ]}
            >
              ---
            </Text>
          </View>
        ))}
      </View>

      {/* Progress Chart Placeholder */}
      <View style={[styles.chartPlaceholder, { backgroundColor: theme.backgroundAlt }]}>
        <Text
          style={[
            globalStyles.textRegular,
            styles.chartText,
            { color: theme.textSecondary },
          ]}
        >
          [Weekly Progress Chart Placeholder]
        </Text>
      </View>

      {/* Additional Charts */}
      <View style={[styles.chartPlaceholder, { backgroundColor: theme.backgroundAlt }]}>
        <Text
          style={[
            globalStyles.textRegular,
            styles.chartText,
            { color: theme.textSecondary },
          ]}
        >
          [Calories Burned Chart Placeholder]
        </Text>
      </View>

      <View style={[styles.chartPlaceholder, { backgroundColor: theme.backgroundAlt }]}>
        <Text
          style={[
            globalStyles.textRegular,
            styles.chartText,
            { color: theme.textSecondary },
          ]}
        >
          [Workout Duration Chart Placeholder]
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 40 },
  header: { fontSize: 28, marginBottom: 24, textAlign: 'center' },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    alignItems: 'center',
  },
  statTitle: { fontSize: 16, marginTop: 8, textAlign: 'center' },
  statPlaceholder: { fontSize: 18, marginTop: 6, fontStyle: 'italic' },

  // Charts
  chartPlaceholder: {
    height: 180,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  chartText: { fontSize: 14, fontStyle: 'italic' },
});
