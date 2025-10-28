import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  BackHandler,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants/Colors";
import FloatingAIButton from "../ai/FloatingAIButton";
import FitahiLogo from "../../constants/FitahiLogo";
import { Calendar } from "react-native-calendars";
import Toast from "react-native-toast-message";
import globalStyles from "../../styles/globalStyles";
import BottomNav from "@/components/navbar/BottomNav";
import ReminderModal from "@/components/reminders/ReminderModal";
import LogCards from "@/components/logcards/LogCards";
import { useCalendarLogic } from "@/hooks/useCalendarLogic";
import * as Notifications from "@/services/notificationService";
import { scheduleWaterNotifications } from "@/services/waterNotifications";
import { useInactivityMonitor } from "@/services/inactivityNotifications";
import { Font } from "@/constants/Font";
import mobileAds, { MaxAdContentRating } from "react-native-google-mobile-ads";
import ReminderBannerAd from "@/components/googleAds/BannerAd";
import { shouldShowStreakScreen } from "@/constants/utils/streakLogic";
import StreakScreen from "../streak/StreakScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Main dashboard screen displaying calendar, reminders, and quick navigation cards
 * Serves as the central hub for fitness tracking and planning features
 */
export default function Home() {
  const theme = Colors["dark"];
  const router = useRouter();
  const [adsReady, setAdsReady] = useState(false);
  const [showStreak, setShowStreak] = useState(false);
  
  // Initialise AdMob once 
  useEffect(() => {
    mobileAds()
      .setRequestConfiguration({
        maxAdContentRating: MaxAdContentRating.G,
        tagForChildDirectedTreatment: false,
        tagForUnderAgeOfConsent: false,
      })
      .then(() => mobileAds().initialize())
      .then(() => setAdsReady(true))
      .catch((e) => console.log("AdMob init error:", e));
  }, []);

  // Start inactivity monitor for AI check-in notifications + conversations
  useInactivityMonitor();

  // Request notification permissions on mount and reschedule reminders
  useEffect(() => {
    async function init() {
      await Notifications.requestNotificationPermissions();

      // Re-schedule all reminders once on app start
      if (reminders.length > 0) {
        await Notifications.rescheduleUpcomingNotifications(reminders);
      }
    }
    init();
  }, []);

  useEffect(() => {
    async function init() {
      await Notifications.requestNotificationPermissions();

      // Check if streak screen should show
      const show = await shouldShowStreakScreen();
      setShowStreak(show);

      // Reschedule reminders if any exist
      if (reminders.length > 0) {
        await Notifications.rescheduleUpcomingNotifications(reminders);
      }
    }
    init();
  }, []);

  //useEffect runs once home component mounts
  useEffect(() =>{
    //Async to check if streak screen should pop out if it hasnt already
    const checkStreakPopup = async () => {
      //get date when they streak pop was last shown from AsyncStorage
      const lastShown = await AsyncStorage.getItem("lastStreakPopup");
      const today = new Date().toDateString(); //get todays date as a string

      if (lastShown !== today){
        //show streak popup once a day
        setShowStreak(true);
        //save todays date in AsyncStorage
        await AsyncStorage.setItem("lastStreakPopup", today);
      }
    };
    checkStreakPopup(); //call async function immediately
  }, []);

  // Schedule water intake notifications
  scheduleWaterNotifications();

  // Prevent users from navigating back from the home screen on Android
  useEffect(() => {
    const backAction = () => true;
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );
    return () => subscription.remove();
  }, []);

  // Modal visibility control for reminder creation/editing
  const [modalVisible, setModalVisible] = useState(false);

  // Calendar and reminder functionality from custom hook
  const {
    reminders,
    viewingDate,
    editingReminder,
    formattedToday,
    getMarkedDates,
    getRemindersForDate,
    handleDayPress,
    handleCreateReminder,
    handleEditReminder,
    handleSaveReminder,
    handleDeleteReminder,
    setViewingDate,
  } = useCalendarLogic();

  // Sync viewing date to today when Home mounts
  useEffect(() => {
    setViewingDate(formattedToday);
  }, [formattedToday]);

  // Navigation cards for quick access to main app features
  const quickLogCards = [
    {
      title: "Your Analytics",
      icon: "📊",
      color: theme.tint,
      onPress: () => router.push("/main/analytics"),
    },
    {
      title: "Workout Log",
      icon: "🏋️",
      color: theme.tint,
      onPress: () => router.push("/main/workouts"),
    },
    {
      title: "Nutrition Log",
      icon: "🍎",
      color: theme.tint,
      onPress: () => router.push("/main/nutrition"),
    },
    {
      title: "Supplement Log",
      icon: "💊",
      color: theme.tint,
      onPress: () => router.push("/main/supplements"),
    },
    {
      title: "Water Log",
      icon: "💧",
      color: theme.tint,
      onPress: () => router.push("/main/water"),
    },
    {
      title: "Gym Finder",
      icon: "🗺️",
      color: theme.tint,
      onPress: () => router.push("/main/gymsFinder"),
    },
    {
      title: "Biometrics Log",
      icon: "📏",
      color: theme.tint,
      onPress: () => router.push("/main/biometrics"),
    },
  ];

  return (
  <>

    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 140 }}>
        {/* Render app branding/logo section */}
        <View style={styles.logoContainer}>
          <FitahiLogo width={320} height={140} fill="#FFFFFF" />
        </View>

        {/* Render calendar widget with reminder functionality */}
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
            current={viewingDate}
            hideExtraDays
            firstDay={1}
            enableSwipeMonths={true}
            markedDates={getMarkedDates(theme)}
            minDate={formattedToday}
            onDayPress={handleDayPress}
          />

          {/* Render selected date display and add reminder button */}
          <View style={styles.dateHeader}>
            <Text
              style={[
                globalStyles.cardText,
                { color: "#000", fontSize: 16, flex: 1 },
              ]}
            >
              {new Date(viewingDate).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
            <TouchableOpacity
              style={styles.addReminderButton}
              onPress={() => {
                handleCreateReminder();
                setModalVisible(true);
              }}
            >
              <Ionicons name="add" size={16} color={theme.tint} />
              <Text style={styles.addReminderText}>Add reminder</Text>
            </TouchableOpacity>
          </View>

          {/* Render list of reminders for the selected date */}
          <View style={styles.remindersContainer}>
            {(() => {
              const dayReminders = getRemindersForDate(viewingDate);
              if (dayReminders.length === 0) {
                return (
                  <View style={styles.emptyState}>
                    <Ionicons name="calendar-outline" size={32} color="#ccc" />
                    <Text
                      style={{
                        color: "#888",
                        marginTop: 8,
                        textAlign: "center",
                      }}
                    >
                      No reminders for this day
                    </Text>
                  </View>
                );
              }

              return (
                <ScrollView
                  style={styles.remindersScroll}
                  contentContainerStyle={{ paddingVertical: 4 }}
                  nestedScrollEnabled={true}
                  showsVerticalScrollIndicator={true}
                >
                  {dayReminders.map((reminder) => (
                    <TouchableOpacity
                      key={reminder._id}
                      style={styles.reminderItem}
                      onPress={() => {
                        handleEditReminder(reminder);
                        setModalVisible(true);
                      }}
                    >
                      <View style={styles.reminderContent}>
                        <View style={styles.reminderHeader}>
                          <Text
                            style={[
                              globalStyles.cardText,
                              { color: "#000", flex: 1 },
                            ]}
                          >
                            {reminder.title}
                          </Text>
                          <Text style={styles.reminderTime}>
                            {reminder.time || "No time"}
                          </Text>
                        </View>
                        {reminder.notes && (
                          <Text style={styles.reminderNotes}>
                            {reminder.notes}
                          </Text>
                        )}
                        {reminder.repeat !== "None" && (
                          <View style={styles.repeatBadge}>
                            <Ionicons
                              name="repeat"
                              size={12}
                              color={theme.tint}
                            />
                            <Text style={styles.repeatText}>
                              {reminder.repeat}
                            </Text>
                          </View>
                        )}
                      </View>
                      <Ionicons name="chevron-forward" size={16} color="#ccc" />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              );
            })()}
          </View>
        </View>

        {/* Ad below reminders */}
        {adsReady && <ReminderBannerAd />}

        {/* Render quick access navigation cards */}
        <LogCards cards={quickLogCards} />
      </ScrollView>

      {/* Render reminder modal for creating/editing reminders */}
      <ReminderModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          handleEditReminder(null);
        }}
        onSave={handleSaveReminder}
        onDelete={handleDeleteReminder}
        reminder={editingReminder}
        selectedDate={viewingDate}
      />

      {/* Render bottom navigation bar and floating AI assistant button */}
      <BottomNav />
      <FloatingAIButton />

      {/* Render global toast notifications */}
      <Toast />
       {/* -----------------------
        StreakScreen overlay
        -----------------------
        Only shows if showStreak is true
        Fades out when user taps Continue
    ----------------------- */}
    {showStreak &&(
      <View style = {styles.Overlay}>
        <StreakScreen onContinue = {() => setShowStreak(false)}/>
      </View>
    )}
    </SafeAreaView>
  </>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
  },
  reminderItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  remindersScroll: {
    maxHeight: 180,
    marginTop: 4,
  },
  reminderContent: {
    flex: 1,
  },
  reminderHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  reminderTime: {
    fontSize: 12,
    color: "#666",
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  reminderNotes: {
    fontSize: 12,
    color: "#888",
    marginBottom: 4,
  },
  repeatBadge: {
    flexDirection: "row",
    alignItems: "center",
  },
  repeatText: {
    fontSize: 10,
    color: "#4A90E2",
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
  dateHeader: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  addReminderText: {
    marginLeft: 4,
    fontSize: 11,
    fontWeight: "600",
    fontFamily: Font.bold,
  },
  addReminderButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 12,
    backgroundColor: "#f0f8ff",
  },
  Overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.9)", // darker backdrop
    zIndex: 9999,
    justifyContent: "center",
    alignItems: "center",
  },
  yesterdayCircle: {
  borderColor: "#1E90FF80", // light blue border
  backgroundColor: "#1E90FF20", // soft glow
},

});
