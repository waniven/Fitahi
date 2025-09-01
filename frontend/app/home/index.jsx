import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { Colors } from "../../constants/Colors";
import FloatingAIButton from "../ai/FloatingAIButton";

// screen width to calculate card sizes
const { width } = Dimensions.get("window");

export default function Home() {
  const theme = Colors[useColorScheme() ?? "light"];
  const router = useRouter();

  // grid card width (2 per row with spacing)
  const cardWidth = (width - 60) / 2;

  // example days for calendar row
  const days = [
    { day: "Mon", date: 5 },
    { day: "Tue", date: 6 },
    { day: "Wed", date: 7 },
    { day: "Thu", date: 8 },
    { day: "Fri", date: 9 },
    { day: "Sat", date: 10 },
    { day: "Sun", date: 11 },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header: Welcome text (left) + Profile button (right) */}
      <View style={styles.header}>
        <Text style={[styles.welcomeText, { color: theme.textPrimary }]}>
          Welcome back
        </Text>
        <TouchableOpacity
          style={styles.profileCircle}
          onPress={() => router.push("/main/profile")}
        >
          <Text style={{ color: theme.background, fontWeight: "700" }}>P</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
        {/* Calendar-style date selector */}
        <View style={styles.dateRow}>
          {days.map((d) => (
            <TouchableOpacity
              key={d.date}
              style={[
                styles.dateCircle,
                d.date === 8 && styles.dateCircleActive, // highlight today
              ]}
            >
              <Text style={[styles.dayText, { color: theme.textPrimary }]}>
                {d.day}
              </Text>
              <Text
                style={{
                  color: d.date === 8 ? "#fff" : theme.textPrimary,
                  fontWeight: d.date === 8 ? "700" : "400",
                }}
              >
                {d.date}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Banner with full-size logo2 image */}
        <Image source={require("../../assets/images/logo2.png")} style={styles.bannerImage} resizeMode="cover" />

        {/* Premium membership card */}
        <TouchableOpacity
          style={[styles.premiumCard, { backgroundColor: theme.backgroundAlt }]}
        >
          <Ionicons name="diamond-outline" size={20} color={theme.tint} />
          <Text style={[styles.premiumText, { color: theme.textPrimary }]}>
            Premium Membership
          </Text>
        </TouchableOpacity>

        {/* Grid of cards (grey buttons) */}
        {/* Row 1: Analytics + Workouts */}
        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.card, { width: cardWidth, backgroundColor: theme.backgroundAlt }]}
            onPress={() => router.push("/main/analytics")}
          >
            <Text style={[styles.cardText, { color: theme.textPrimary }]}>
              Analytics
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.card, { width: cardWidth, backgroundColor: theme.backgroundAlt }]}
            onPress={() => router.push("/main/workouts")}
          >
            <Text style={[styles.cardText, { color: theme.textPrimary }]}>
              Workouts
            </Text>
          </TouchableOpacity>
        </View>

        {/* Row 2: Water Log + Medication */}
        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.card, { width: cardWidth, backgroundColor: theme.backgroundAlt }]}
            onPress={() => router.push("/main/waterlog")}
          >
            <Text style={[styles.cardText, { color: theme.textPrimary }]}>
              Water Log
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.card, { width: cardWidth, backgroundColor: theme.backgroundAlt }]}
            onPress={() => router.push("/main/medication")}
          >
            <Text style={[styles.cardText, { color: theme.textPrimary }]}>
              Medication
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom navigation bar */}
      <View style={[styles.bottomNav, { backgroundColor: theme.backgroundAlt }]}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home-outline" size={26} color={theme.tint} />
          <Text style={[styles.navText, { color: theme.textPrimary }]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/main/biometrics")} // Only functional nav tab
        >
          <Ionicons name="fitness-outline" size={26} color={theme.tint} />
          <Text style={[styles.navText, { color: theme.textPrimary }]}>Biometrics</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="stats-chart-outline" size={26} color={theme.tint} />
          <Text style={[styles.navText, { color: theme.textPrimary }]}>Analytics</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="settings-outline" size={26} color={theme.tint} />
          <Text style={[styles.navText, { color: theme.textPrimary }]}>Settings</Text>
        </TouchableOpacity>
      </View>

      {/* Floating AI Assistant */}
      <FloatingAIButton />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 10,
  },
  welcomeText: { fontWeight: "600", fontSize: 18 },
  profileCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#096686",
    justifyContent: "center",
    alignItems: "center",
  },

  // Date selector
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 12,
    marginTop: 10,
  },
  dateCircle: {
    width: 50,
    height: 60,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  dateCircleActive: { backgroundColor: "#444" },
  dayText: { fontSize: 12, marginBottom: 2 },

  // Banner
  bannerImage: {
    width: "90%",
    height: 180,
    borderRadius: 12,
    alignSelf: "center",
    marginVertical: 12,
  },

  // Premium card
  premiumCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    alignSelf: "center",
    width: "90%",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  premiumText: { marginLeft: 8, fontSize: 16, fontWeight: "600" },

  // Grid
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardText: { fontWeight: "600", fontSize: 16 },

  // Bottom nav
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
  navItem: { alignItems: "center" },
  navText: { fontSize: 12, marginTop: 2 },
});
