import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View,Modal,TextInput,} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants/Colors";
import FloatingAIButton from "../ai/FloatingAIButton";
import FitahiLogo from "../../constants/FitahiLogo";
import { Calendar } from "react-native-calendars";
import Toast from "react-native-toast-message";
import DateTimePicker from "@react-native-community/datetimepicker";
import globalStyles from "../../styles/globalStyles";
<<<<<<< HEAD
import BottomNav from "@/components/navbar/BottomNav";
=======
import BottomNav from "@/components/navbar/Bottomnav";
>>>>>>> 68a93c8c (index)

const { width } = Dimensions.get("window");

export default function Home() {
  const theme = Colors["dark"];
  const router = useRouter();
  const cardWidth = (width - 60) / 2;

  // Premium banner for premium button
  const [showPremium, setShowPremium] = useState(true);
  // Reminder state - will requir AP fetch
  const [reminders, setReminders] = useState([]);
  // Modal control
  const [modalVisible, setModalVisible] = useState(false);
  // Date selected from calendar
  const [selectedDate, setSelectedDate] = useState("");
  // Current reminder being created/edited
  const [currentReminder, setCurrentReminder] = useState({
    id: "",
    title: "",
    notes: "",
    date: "",
    time: "",
    repeat: "None",
  });

  // Controls for showing pickers
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  // Marked dates for the calendar (highlights reminder days)
  const markedDates = reminders.reduce((acc, r) => {
    acc[r.date] = { marked: true, dotColor: theme.tint };
    return acc;
  }, {});
  // Save or update a reminder
  const saveReminder = () => {
    if (!currentReminder.title) return; // prevent empty reminders

    if (currentReminder.id) {
      // Update existing reminder
      setReminders((prev) =>
        prev.map((r) =>
          r.id === currentReminder.id ? { ...r, ...currentReminder } : r
        )
      );
      Toast.show({
        type: "success",
        text1: "Reminder Updated",
        text2: `${currentReminder.title}`,
      });
    } else {
      // Add new reminder
      const newReminder = {
        ...currentReminder,
        id: Date.now().toString(), // quick unique I - backend to do for ID
        date: selectedDate, // ensures reminder ties to calendar date
      };
      setReminders((prev) => [...prev, newReminder]);
      Toast.show({
        type: "success",
        text1: "Reminder Added",
        text2: `${currentReminder.title}`,
      });
    }
    setModalVisible(false); // close modal after action
  };

  // Delete reminder by ID
  const deleteReminder = (id) => {
    const deleted = reminders.find((r) => r.id === id);
    setReminders((prev) => prev.filter((r) => r.id !== id));

    Toast.show({
      type: "info",
      text1: "Reminder Deleted",
      text2: deleted?.title || "",
    });
    setModalVisible(false);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 140 }}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <FitahiLogo width={320} height={140} fill="#FFFFFF" />
        </View>

        {/* Calendar + Reminders */}
        <View style={[styles.widgetCard, { backgroundColor: "#fff" }]}>
          <Calendar
            style={{ borderRadius: 16, backgroundColor: "#fff" }}
            theme={{
              backgroundColor: "#fff",
              calendarBackground: "#fff",
              textSectionTitleColor: "#000",
              todayTextColor: "#000",
              todayBackgroundColor: theme.tint,
              dayTextColor: "#000",
              monthTextColor: "#000",
              arrowColor: theme.tint,
              textDisabledColor: "#999",
              textDayFontSize: 14,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 12,
              selectedDayBackgroundColor: theme.tint,
              selectedDayTextColor: "#fff",
            }}
            current={new Date().toISOString().split("T")[0]} // highlight today
            hideExtraDays
            firstDay={1}
            enableSwipeMonths
            markedDates={markedDates} // dates with reminders show dots
            onDayPress={(day) => {
              // open modal when a day is clicked
              setSelectedDate(day.dateString);
              setCurrentReminder({
                id: "",
                title: "",
                notes: "",
                date: day.dateString,
                time: "",
                repeat: "None",
              });
              setModalVisible(true);
            }}
          />

          {/* Reminders below calendar */}
          <View style={styles.remindersContainer}>
            <Text style={[globalStyles.cardText, { color: "#000", marginTop: 12 }]}>
              Reminders
            </Text>
            {reminders
              // Only show reminders for the selected date
              .filter((r) => r.date === selectedDate)
              // Limit to 3 reminders (closest first)
              .slice(0, 3)
              .map((r) => (
                <TouchableOpacity
                  key={r.id}
                  style={styles.reminderItem}
                  onPress={() => {
                    // open modal for editing reminder
                    setSelectedDate(r.date);
                    setCurrentReminder(r);
                    setModalVisible(true);
                  }}
                >
                  <Text style={[globalStyles.cardText, { color: "#000" }]}>
                    {r.title} ({r.time || "No time"})
                  </Text>
                  {r.notes ? (
                    <Text style={{ fontSize: 12, color: "#555" }}>{r.notes}</Text>
                  ) : null}
                </TouchableOpacity>
              ))}
          </View>
        </View>

        {/* Premium card */}
        {showPremium && (
          <View style={[styles.premiumCard, { backgroundColor: "#fff" }]}>
            <Ionicons name="diamond-outline" size={20} color={theme.tint} />
            <Text style={[globalStyles.premiumText, { color: theme.tint }]}>
              Premium Membership
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowPremium(false)}
            >
              <Text style={{ color: theme.tint, fontWeight: "700" }}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Quick log cards */}
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
            onPress={() => router.push("/main/water")}
          >
            <Text style={[globalStyles.cardText, { color: theme.tint }]}>💧 Water Log</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.card, { width: cardWidth, backgroundColor: "#fff" }]}
            onPress={() => router.push("/main/gymsFinder")}
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

      {/* Date Picker (drop-down style) */}
      {showDatePicker && (
        <DateTimePicker
          value={
            currentReminder.date
              ? new Date(currentReminder.date)
              : new Date()
          }
          mode="date"
          display="default"
          onChange={(event, selectedDateObj) => {
            setShowDatePicker(false);
            if (selectedDateObj) {
              const formattedDate = selectedDateObj.toISOString().split("T")[0];
              setCurrentReminder({ ...currentReminder, date: formattedDate });
            }
          }}
        />
      )}

      {/* Time Picker (drop-down style) */}
      {showTimePicker && (
        <DateTimePicker
          value={
            currentReminder.time
              ? new Date(`${currentReminder.date}T${currentReminder.time}`)
              : new Date()
          }
          mode="time"
          display="default"
          onChange={(event, selectedTimeObj) => {
            setShowTimePicker(false);
            if (selectedTimeObj) {
              const hours = selectedTimeObj.getHours().toString().padStart(2, "0");
              const minutes = selectedTimeObj
                .getMinutes()
                .toString()
                .padStart(2, "0");
              const formattedTime = `${hours}:${minutes}`;
              setCurrentReminder({ ...currentReminder, time: formattedTime });
            }
          }}
        />
      )}

      {/* Reminder modal (Add/Edit) */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={[styles.modalContent, { backgroundColor: "#fff" }]}>
            <Text style={[globalStyles.cardText, { color: "#000", marginBottom: 10 }]}>
              {currentReminder.id ? "Edit Reminder" : "Add Reminder"}
            </Text>

            {/* Title */}
            <TextInput
              placeholder="Title"
              placeholderTextColor="#888"
              style={[globalStyles.input, { color: "#000", borderColor: theme.tint }]}
              value={currentReminder.title}
              onChangeText={(text) =>
                setCurrentReminder({ ...currentReminder, title: text })
              }
            />

            {/* Notes */}
            <TextInput
              placeholder="Notes"
              placeholderTextColor="#888"
              style={[
                globalStyles.input,
                {
                  color: "#000",
                  borderColor: theme.tint,
                  height: 80,
                  textAlignVertical: "top",
                },
              ]}
              multiline
              value={currentReminder.notes}
              onChangeText={(text) =>
                setCurrentReminder({ ...currentReminder, notes: text })
              }
            />

            {/* Date + Time */}
            <View style={styles.dateTimeRow}>
              {/* Date button */}
              <TouchableOpacity
                style={[styles.modalButton, { flex: 1, backgroundColor: "#eee" }]}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={16} color="#000" />
                <Text style={{ color: "#000", marginLeft: 6 }}>
                  {currentReminder.date || selectedDate || "Pick Date"}
                </Text>
              </TouchableOpacity>

              {/* Time button */}
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  { flex: 1, backgroundColor: "#eee", marginLeft: 8 },
                ]}
                onPress={() => setShowTimePicker(true)}
              >
                <Ionicons name="time-outline" size={16} color="#000" />
                <Text style={{ color: "#000", marginLeft: 6 }}>
                  {currentReminder.time || "Pick Time"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Repeat option */}
            <View style={{ marginBottom: 10 }}>
              <Text style={{ color: "#000", marginBottom: 4 }}>Repeat</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {["None", "Daily", "Weekly", "Monthly"].map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    style={[
                      styles.modalButton,
                      {
                        backgroundColor:
                          currentReminder.repeat === opt ? theme.tint : "#eee",
                        marginRight: 7,
                        paddingHorizontal: 16,
                      },
                    ]}
                    onPress={() =>
                      setCurrentReminder({ ...currentReminder, repeat: opt })
                    }
                  >
                    <Text
                      style={{
                        color: currentReminder.repeat === opt ? "#fff" : "#000",
                      }}
                    >
                      {opt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Action buttons */}
            <View style={styles.modalButtons}>
              {currentReminder.id && (
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: "#FF4D4D" }]}
                  onPress={() => deleteReminder(currentReminder.id)}
                >
                  <Text style={[globalStyles.cardText, { color: "#fff" }]}>
                    Delete
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.tint }]}
                onPress={saveReminder}
              >
                <Text style={[globalStyles.cardText, { color: "#fff" }]}>
                  {currentReminder.id ? "Save" : "Add"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#888" }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[globalStyles.cardText, { color: "#fff" }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bottom navigation + AI button */}
      <BottomNav />
      <FloatingAIButton />

      {/* Global toast notifications */}
      <Toast />
    </SafeAreaView>
  );
}

// Styles
const styles = StyleSheet.create({
  container: { flex: 1 },

  logoContainer: {
    alignItems: "center",
    marginVertical: 10,
    marginTop: 70,
  },

  widgetCard: {
    borderRadius: 16,
    padding: 12,
    marginHorizontal: 20,
    marginVertical: 10,
    backgroundColor: "#fff",
  },
  remindersContainer: {
    marginTop: 8,
  },
  reminderItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },

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
    marginTop: 30,
  },
  closeButton: {
    marginLeft: "auto",
  },

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
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },

  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 20,
  },
  modalContent: {
    width: "100%",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  modalButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  dateTimeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },
});
