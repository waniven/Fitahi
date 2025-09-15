import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants/Colors";
import FloatingAIButton from "../ai/FloatingAIButton";
import FitahiLogo from "../../constants/FitahiLogo";
import { Calendar } from "react-native-calendars";
import Toast from "react-native-toast-message";
import globalStyles from "../../styles/globalStyles";
import BottomNav from "@/components/navbar/BottomNav";
import ReminderModal from "@/components/reminders/ReminderModal";

const { width } = Dimensions.get("window");

export default function Home() {
  const theme = Colors["dark"];
  const router = useRouter();
  const cardWidth = (width - 60) / 2;

  // Premium banner for premium button
  const [showPremium, setShowPremium] = useState(true);
  // Reminder state - will require API fetch
  const [reminders, setReminders] = useState([]);
  // Modal control
  const [modalVisible, setModalVisible] = useState(false);
  // Date viewing and selection
  const [viewingDate, setViewingDate] = useState(new Date().toISOString().split("T")[0]);
  const [editingReminder, setEditingReminder] = useState(null);

  // Enhanced marked dates with better visual indicators
  const markedDates = reminders.reduce((acc, r) => {
    acc[r.date] = { marked: true, dotColor: theme.tint };
    return acc;
  }, {
    // Highlight today
    [new Date().toISOString().split("T")[0]]: {
      selected: true,
      selectedColor: theme.tint + '40',
    }
  });

  // Get reminders for the currently viewing date
  const getRemindersForDate = (date) => {
    return reminders.filter(r => r.date === date);
  };

  // Handle calendar day press - just for viewing
  const handleDayPress = (day) => {
    setViewingDate(day.dateString);
  };

  // Handle creating new reminder
  const handleCreateReminder = () => {
    setEditingReminder(null);
    setModalVisible(true);
  };

  // Handle editing existing reminder
  const handleEditReminder = (reminder) => {
    setEditingReminder(reminder);
    setModalVisible(true);
  };

  // Save or update a reminder
  const handleSaveReminder = (reminderData) => {
    if (reminderData.id && reminders.find(r => r.id === reminderData.id)) {
      // Update existing reminder
      setReminders(prev =>
        prev.map(r => r.id === reminderData.id ? reminderData : r)
      );
      Toast.show({
        type: "success",
        text1: "Reminder Updated",
        text2: reminderData.title,
      });
    } else {
      // Add new reminder
      setReminders(prev => [...prev, reminderData]);
      Toast.show({
        type: "success",
        text1: "Reminder Added",
        text2: reminderData.title,
      });
    }
  };

  // Delete reminder by ID
  const handleDeleteReminder = (id) => {
    const deleted = reminders.find(r => r.id === id);
    setReminders(prev => prev.filter(r => r.id !== id));
    Toast.show({
      type: "info",
      text1: "Reminder Deleted",
      text2: deleted?.title || "",
    });
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
            current={new Date().toISOString().split("T")[0]}
            hideExtraDays
            firstDay={1}
            enableSwipeMonths
            markedDates={markedDates}
            onDayPress={handleDayPress}
          />

          {/* Date Info Header */}
          <View style={styles.dateHeader}>
            <Text style={[globalStyles.cardText, { color: "#000", fontSize: 16 }]}>
              {new Date(viewingDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
            <TouchableOpacity
              style={styles.addReminderButton}
              onPress={handleCreateReminder}
            >
              <Ionicons name="add" size={20} color={theme.tint} />
              <Text style={{ color: theme.tint, marginLeft: 4 }}>Add Reminder</Text>
            </TouchableOpacity>
          </View>

          {/* Reminders Display */}
          <View style={styles.remindersContainer}>
            {(() => {
              const dayReminders = getRemindersForDate(viewingDate);

              if (dayReminders.length === 0) {
                return (
                  <View style={styles.emptyState}>
                    <Ionicons name="calendar-outline" size={32} color="#ccc" />
                    <Text style={{ color: "#888", marginTop: 8, textAlign: 'center' }}>
                      No reminders for this day
                    </Text>
                  </View>
                );
              }

              return dayReminders.map((reminder) => (
                <TouchableOpacity
                  key={reminder.id}
                  style={styles.reminderItem}
                  onPress={() => handleEditReminder(reminder)}
                >
                  <View style={styles.reminderContent}>
                    <View style={styles.reminderHeader}>
                      <Text style={[globalStyles.cardText, { color: "#000", flex: 1 }]}>
                        {reminder.title}
                      </Text>
                      <Text style={styles.reminderTime}>
                        {reminder.time || "No time"}
                      </Text>
                    </View>
                    
                    {reminder.notes && (
                      <Text style={styles.reminderNotes}>{reminder.notes}</Text>
                    )}
                    
                    {reminder.repeat !== "None" && (
                      <View style={styles.repeatBadge}>
                        <Ionicons name="repeat" size={12} color={theme.tint} />
                        <Text style={styles.repeatText}>{reminder.repeat}</Text>
                      </View>
                    )}
                  </View>
                  
                  <Ionicons name="chevron-forward" size={16} color="#ccc" />
                </TouchableOpacity>
              ));
            })()}
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

      {/* Reminder Modal */}
      <ReminderModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveReminder}
        onDelete={handleDeleteReminder}
        reminder={editingReminder}
        selectedDate={viewingDate}
      />

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

  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },

  addReminderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#f0f8ff',
  },

  remindersContainer: {
    marginTop: 8,
  },

  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },

  reminderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  reminderContent: {
    flex: 1,
  },

  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },

  reminderTime: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },

  reminderNotes: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },

  repeatBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  repeatText: {
    fontSize: 10,
    color: '#4A90E2',
    marginLeft: 2,
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
});