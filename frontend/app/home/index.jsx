// app/home/index.jsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Dimensions, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, Modal, TextInput, } from "react-native";
import { Colors } from "../../constants/Colors";
import FloatingAIButton from "../ai/FloatingAIButton";
import FitahiLogo from "../../constants/FitahiLogo";
import { Calendar } from "react-native-calendars";
import Toast from "react-native-toast-message";
import globalStyles from "../../styles/globalStyles";

const { width } = Dimensions.get("window");

export default function Home() {
  const theme = Colors["dark"];
  const router = useRouter();
  const cardWidth = (width - 60) / 2; // Two cards per row with spacing

  const [showPremium, setShowPremium] = useState(true);
  const [reminders, setReminders] = useState([]); // All reminders
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(""); // Selected calendar date
  const [currentReminder, setCurrentReminder] = useState({ id: "", text: "" }); // Editing or adding reminders

  // Marked dates for the calendar
  const markedDates = reminders.reduce((acc, r) => {
    acc[r.date] = { marked: true, dotColor: theme.tint }; // Blue dot for reminders on calender
    return acc;
  }, {});

  // Save or update a reminder
  const saveReminder = () => {
    if (!currentReminder.text) return;

    if (currentReminder.id) {
      // Update existing reminder
      setReminders((prev) =>
        prev.map((r) =>
          r.id === currentReminder.id ? { ...r, text: currentReminder.text } : r
        )
      );
      Toast.show({
        type: "success",
        text1: "Reminder Updated",
        text2: `${currentReminder.text}`,
      });
    } else {
      // Add new reminder
      const newReminder = {
        id: Date.now().toString(),
        date: selectedDate,
        text: currentReminder.text,
      };
      setReminders((prev) => [...prev, newReminder]);
      Toast.show({
        type: "success",
        text1: "Reminder Added",
        text2: `${currentReminder.text}`,
      });
    }
    setModalVisible(false);
  };

  // Delete a reminder
  const deleteReminder = (id) => {
    const deleted = reminders.find((r) => r.id === id);
    setReminders((prev) => prev.filter((r) => r.id !== id));

    Toast.show({
      type: "info",
      text1: "Reminder Deleted",
      text2: `${deleted.text}`,
    });
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
        {/* logo */}
        <View style={styles.logoContainer}>
          <FitahiLogo width={320} height={140} fill="#FFFFFF" />
        </View>

        {/*calendars and reminders */}
        <View style={[styles.widgetCard, { backgroundColor: "#fff" }]}>
          <Calendar
            style={{ borderRadius: 16, backgroundColor: "#fff" }}
            theme={{
              backgroundColor: "#fff",          // calender background
              calendarBackground: "#fff",       // Calendar container 
              textSectionTitleColor: "#000",    // Weekday headers black
              todayTextColor: "#000",
              todayBackgroundColor: theme.tint, // highight current day
              dayTextColor: "#000",
              monthTextColor: "#000",
              arrowColor: theme.tint,           // Navigation arrows 
              textDisabledColor: "#999",
              textDayFontSize: 14,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 12,
              selectedDayBackgroundColor: theme.tint,
              selectedDayTextColor: "#fff",
            }}
            current={new Date().toISOString().split("T")[0]}
            hideExtraDays={true}
            firstDay={1}
            enableSwipeMonths={true}
            markedDates={markedDates}
            onDayPress={(day) => {
              setSelectedDate(day.dateString);
              setCurrentReminder({ id: "", text: "" });
              setModalVisible(true);
            }}
          />

          {/* Reminders next to calender*/}
          <View style={styles.remindersContainer}>
            <Text style={[globalStyles.cardText, { color: "#000" }]}>Reminders</Text>
            {reminders
              .filter((r) => r.date === selectedDate)
              .map((r) => (
                <TouchableOpacity
                  key={r.id}
                  style={styles.reminderItem}
                  onPress={() => {
                    setSelectedDate(r.date);
                    setCurrentReminder({ id: r.id, text: r.text });
                    setModalVisible(true);
                  }}
                >
                  <Text style={[globalStyles.cardText, { color: "#000" }]}>
                    {r.text} ({r.date})
                  </Text>
                </TouchableOpacity>
              ))}
          </View>
        </View>

        {/* premium card */}
        {showPremium && (
          <View style={[styles.premiumCard, { backgroundColor: "#fff" }]}>
            <Ionicons name="diamond-outline" size={20} color={theme.tint} />
            <Text style={[globalStyles.premiumText, { color: theme.tint }]}>Premium Membership</Text>
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowPremium(false)}>
              <Text style={{ color: theme.tint, fontWeight: "700" }}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* quick log cards */}
        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.card, { width: cardWidth, backgroundColor: "#fff" }]}
            onPress={() => router.push("/main/analytics")}
          >
            <Text style={[globalStyles.cardText, { color: theme.tint }]}>📊 Your Analytics</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.card, { width: cardWidth, backgroundColor: "#fff" }]}
            onPress={() => router.push("/main/reminders")}
          >
            <Text style={[globalStyles.cardText, { color: theme.tint }]}>🔔 Your Reminders</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.card, { width: cardWidth, backgroundColor: "#fff" }]}
            onPress={() => router.push("/main/workouts")}
          >
            <Text style={[globalStyles.cardText, { color: theme.tint }]}>🏋️ Workout Log</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.card, { width: cardWidth, backgroundColor: "#fff" }]}
            onPress={() => router.push("/main/nutrition")}
          >
            <Text style={[globalStyles.cardText, { color: theme.tint }]}>🍎 Nutrition Log</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.card, { width: cardWidth, backgroundColor: "#fff" }]}
            onPress={() => router.push("/main/supplements")}
          >
            <Text style={[globalStyles.cardText, { color: theme.tint }]}>💊 Supplement Log</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.card, { width: cardWidth, backgroundColor: "#fff" }]}
            onPress={() => router.push("/main/waterlog")}
          >
            <Text style={[globalStyles.cardText, { color: theme.tint }]}>💧 Water Log</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.card, { width: cardWidth, backgroundColor: "#fff" }]}
            onPress={() => router.push("/main/gymfinder")}
          >
            <Text style={[globalStyles.cardText, { color: theme.tint }]}>🗺️ Gym Finder</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.card, { width: cardWidth, backgroundColor: "#fff" }]}
            onPress={() => router.push("/main/biometrics")}
          >
            <Text style={[globalStyles.cardText, { color: theme.tint }]}>📏 Biometrics Log</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* bottom navigation */}
      <View style={[styles.bottomNav, { backgroundColor: "#fff" }]}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push("/home/index")}>
          <Ionicons name="home-outline" size={26} color={theme.tint} />
          <Text style={[globalStyles.navText, { color: theme.tint }]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.push("/main/analytics")}>
          <Ionicons name="stats-chart-outline" size={26} color={theme.tint} />
          <Text style={[globalStyles.navText, { color: theme.tint }]}>Analytics</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.push("/main/supplements")}>
          <Ionicons name="medkit-outline" size={26} color={theme.tint} />
          <Text style={[globalStyles.navText, { color: theme.tint }]}>Supplements</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.push("/profile/AccountSettings")}>
          <Ionicons name="settings-outline" size={26} color={theme.tint} />
          <Text style={[globalStyles.navText, { color: theme.tint }]}>Settings</Text>
        </TouchableOpacity>
      </View>

      {/* floating ai button */}
      <FloatingAIButton />

      {/* reminder modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={[styles.modalContent, { backgroundColor: "#fff" }]}>
            <Text style={[globalStyles.cardText, { color: "#000" }]}>
              {currentReminder.id ? "Edit Reminder" : "Add Reminder"}
            </Text>
            <TextInput
              placeholder="Reminder text"
              placeholderTextColor="#888"
              style={[globalStyles.input, { color: "#000", borderColor: theme.tint }]}
              value={currentReminder.text}
              onChangeText={(text) => setCurrentReminder({ ...currentReminder, text })}
            />

            <View style={styles.modalButtons}>
              {currentReminder.id && (
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: "#FF4D4D" }]}
                  onPress={() => deleteReminder(currentReminder.id)}
                >
                  <Text style={[globalStyles.cardText, { color: "#fff" }]}>Delete</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.tint }]}
                onPress={saveReminder}
              >
                <Text style={[globalStyles.cardText, { color: "#fff" }]}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#888" }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[globalStyles.cardText, { color: "#fff" }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Logo
  logoContainer: {
    alignItems: "center",
    marginVertical: 10,
    marginTop: 70
  },

  // Calendar + Reminders Card
  widgetCard: {
    borderRadius: 16,
    padding: 12,
    marginHorizontal: 20,
    marginVertical: 10,
    flexDirection: "row",
    backgroundColor: "#fff"
  },
  remindersContainer: {
    flex: 1,
    marginTop: 0
  },
  reminderItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#444"
  },

  // Premium card
  premiumCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: "#f3ededff",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    marginTop: 30
  },
  closeButton: {
    marginLeft: "auto"
  },

  // Quick log button grid
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 16
  },
  card: {
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3
  },

  // Bottom navigation
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: "absolute",
    bottom: 0,
    width: "100%"
  },
  navItem: {
    alignItems: "center"
  },

  // Modal
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 20
  },
  modalContent: {
    width: "100%",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 4
  },
});
