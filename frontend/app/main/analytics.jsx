import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from "react-native";
import { Colors } from "../../constants/Colors";
import globalStyles from "../../styles/globalStyles";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from "expo-router";

export default function AnalyticsScreen() {
  const scheme = useColorScheme();
  const theme = Colors[scheme ?? "dark"];
  const router = useRouter();

  // Stats icons
  const stats = [
    { id: 1, icon: 'walk', title: 'Steps' },
    { id: 2, icon: 'flame', title: 'Calories Burned' },
    { id: 3, icon: 'bar-chart', title: 'Workout Time' },
    { id: 4, icon: 'fitness', title: 'Active Days' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Back Button */}
      <TouchableOpacity
        onPress={() => router.push('/home/index')}
        style={{ position: 'absolute', top: 10, left: 10, zIndex: 10 }}
      >
        <Ionicons name="arrow-back" size={28} color={theme.tint} />
      </TouchableOpacity>

      <ScrollView style={{ paddingHorizontal: 20, paddingTop: 60 }}>
        {/* Page Header */}
        <Text style={[globalStyles.textBold, styles.header, { color: theme.tint }]}>
          Analytics
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
                style={[globalStyles.textBold, styles.statTitle, { color: theme.textPrimary }]}
              >
                {stat.title}
              </Text>
              <Text
                style={[globalStyles.textRegular, styles.statPlaceholder, { color: theme.textSecondary }]}
              >
                ---
              </Text>
            </View>
          ))}
        </View>

        {/* Clickable Chart Placeholders */}
        <TouchableOpacity
          onPress={() => router.push('/main/WeeklyProgress')}
          style={[styles.chartPlaceholder, { backgroundColor: theme.backgroundAlt }]}
        >
          <Text style={[globalStyles.textRegular, styles.chartText, { color: theme.textSecondary }]}>
            [Weekly Progress Chart Placeholder]
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/main/CaloriesBurned')}
          style={[styles.chartPlaceholder, { backgroundColor: theme.backgroundAlt }]}
        >
          <Text style={[globalStyles.textRegular, styles.chartText, { color: theme.textSecondary }]}>
            [Calories Burned Chart Placeholder]
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/main/WorkoutDuration')}
          style={[styles.chartPlaceholder, { backgroundColor: theme.backgroundAlt }]}
        >
          <Text style={[globalStyles.textRegular, styles.chartText, { color: theme.textSecondary }]}>
            [Workout Duration Chart Placeholder]
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
