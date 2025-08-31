import { useRouter, useSearchParams } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, useColorScheme, View } from "react-native";
import { Colors } from "../../constants/Colors";
import globalStyles from "../../styles/globalStyles";

export default function Profile() {
  const router = useRouter();
  const scheme = useColorScheme();
  const theme = Colors[scheme ?? "light"];
  const params = useSearchParams();
  const userData = params.userData ? JSON.parse(params.userData) : {};

  const handleUpgrade = () => router.push("/subscription");

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[globalStyles.textBold, styles.header, { color: theme.primary }]}>
        Profile & Subscription
      </Text>

      <View style={[styles.card, { backgroundColor: theme.backgroundAlt }]}>
        <View style={styles.infoRow}>
          <Text style={[globalStyles.textBold, styles.label, { color: theme.warning }]}>Name</Text>
          <Text style={[globalStyles.textRegular, styles.value, { color: theme.textPrimary }]}>{userData.name || 'Natalie'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={[globalStyles.textBold, styles.label, { color: theme.warning }]}>Email</Text>
          <Text style={[globalStyles.textRegular, styles.value, { color: theme.textPrimary }]}>{userData.email || 'natalie@example.com'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={[globalStyles.textBold, styles.label, { color: theme.warning }]}>Subscription</Text>
          <Text style={[globalStyles.textRegular, styles.value, { color: theme.primary }]}>{userData.subscription || 'Basic'}</Text>
        </View>
      </View>

      <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary }]} onPress={() => router.push("/edit-profile")}>
        <Text style={[globalStyles.textBold, styles.buttonText, { color: theme.background }]}>Edit Info</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, { backgroundColor: theme.tint }]} onPress={handleUpgrade}>
        <Text style={[globalStyles.textBold, styles.buttonText, { color: theme.background }]}>Upgrade Plan</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, { backgroundColor: "#ff4d4d" }]} onPress={() => router.replace("/auth/login")}>
        <Text style={[globalStyles.textBold, styles.buttonText, { color: theme.background }]}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60 },
  header: { fontSize: 22, marginBottom: 20, textAlign: "center" },
  card: { padding: 18, borderRadius: 14, marginBottom: 20 },
  infoRow: { marginBottom: 12 },
  label: { fontSize: 12, marginBottom: 2 },
  value: { fontSize: 16 },
  button: { marginTop: 12, paddingVertical: 14, borderRadius: 10, alignItems: "center" },
  buttonText: { fontSize: 16 },
});
