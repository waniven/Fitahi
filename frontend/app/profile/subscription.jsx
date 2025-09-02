import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from "react-native";
import { Colors } from "../../constants/Colors";
import globalStyles from "../../styles/globalStyles";

const plans = [
  { id: "basic", name: "Basic", price: "Free", description: "Access limited workouts and features." },
  { id: "premium", name: "Premium", price: "$9.99 / month", description: "Unlock all workouts, tracking, and personalized plans." },
];

export default function Subscription() {
  const scheme = useColorScheme();
  const theme = Colors[scheme ?? "light"];
  const router = useRouter();

  const handleUpgrade = (planId) => {
    //payment logic?
    router.push("/paymentscreen");
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.contentContainer}>
      <Text style={[globalStyles.textBold, styles.title, { color: theme.textPrimary }]}>Choose Your Plan</Text>
      <Text style={[globalStyles.textRegular, styles.subtitle, { color: theme.textSecondary }]}>Upgrade anytime to unlock more features.</Text>

      {plans.map(({ id, name, price, description }) => (
        <View key={id} style={[styles.planCard, { borderColor: theme.tint, backgroundColor: theme.cardBackground }]}>
          <Text style={[globalStyles.textBold, styles.planName, { color: theme.textPrimary }]}>{name}</Text>
          <Text style={[globalStyles.textBold, styles.planPrice, { color: theme.tint }]}>{price}</Text>
          <Text style={[globalStyles.textRegular, styles.planDescription, { color: theme.textSecondary }]}>{description}</Text>

          <TouchableOpacity style={[styles.upgradeButton, { backgroundColor: theme.tint }]} onPress={() => handleUpgrade(id)}>
            <Text style={[globalStyles.textBold, styles.buttonText]}>Upgrade</Text>
          </TouchableOpacity>
        </View>
      ))}

      <Text style={[globalStyles.textRegular, styles.footerText, { color: theme.textSecondary }]}>
        Your current subscription benefits remain active until the end of your billing cycle.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { padding: 24, paddingBottom: 40 },
  title: { fontSize: 28, marginBottom: 6 },
  subtitle: { fontSize: 16, marginBottom: 24 },
  planCard: { borderWidth: 2, borderRadius: 14, padding: 20, marginBottom: 18 },
  planName: { fontSize: 22, marginBottom: 8 },
  planPrice: { fontSize: 18, marginBottom: 12 },
  planDescription: { fontSize: 14, marginBottom: 20 },
  upgradeButton: { paddingVertical: 12, borderRadius: 8, alignItems: "center" },
  buttonText: { color: "#fff", fontSize: 16 },
  footerText: { fontSize: 12, textAlign: "center", marginTop: 32, opacity: 0.7 },
});
