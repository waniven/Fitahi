import { useState, useEffect } from "react";
import CustomToast from "@/components/common/CustomToast";
import * as reminderService from "../services/reminderService";
import * as notificationService from "../services/notificationService";

// Custom hook for handling calendar & reminder logic
export function useCalendarLogic() {

  // All reminders from backend
  const [reminders, setReminders] = useState([]);

  const [viewingDate, setViewingDate] = useState(
    // Initial viewing date in YYYY-MM-DD format
    new Date().toLocaleDateString("en-CA")
  );

  // Reminder currently being edited
  const [editingReminder, setEditingReminder] = useState(null);

  const today = new Date();
  const formattedToday = today.toLocaleDateString("en-CA"); // Today's date as string

  // Load reminders from backend when hook mounts
  useEffect(() => {
    const fetchReminders = async () => {
      try {
        const data = await reminderService.getReminders();
        setReminders(data); // store fetched reminders in state
      } catch (error) {
        CustomToast.error("Failed to load reminders", "Please try again later");
      }
    };
    fetchReminders();
  }, []);

  // Helper: convert JS Date to YYYY-MM-DD string
  const toLocalDateString = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  // Marked dates: compute dates to mark in calendar
  const getMarkedDates = (theme) => {
    const marked = {};

    reminders.forEach((r) => {
      const startDate = new Date(r.date);

      // Compute marked dates up to 90 days
      for (let i = 0; i < 90; i++) {
        let checkDate = new Date(startDate);

        // Repeat logic
        if (r.repeat === "Daily") {
          checkDate.setDate(startDate.getDate() + i);
        } else if (r.repeat === "Weekly") {
          checkDate.setDate(startDate.getDate() + i);
          if (checkDate.getDay() !== startDate.getDay()) continue; // Only same weekday
        } else if (r.repeat === "Monthly") {
          const monthIndex = startDate.getMonth() + i;
          const year = startDate.getFullYear() + Math.floor(monthIndex / 12);
          const month = monthIndex % 12;
          const day = Math.min(
            startDate.getDate(),
            new Date(year, month + 1, 0).getDate()
          ); // Handle month overflow
          checkDate.setFullYear(year, month, day);
        } else {
          checkDate = startDate; // Non-repeating
        }

        const dateStr = toLocalDateString(checkDate);
        if (!marked[dateStr]) marked[dateStr] = {};
        marked[dateStr].marked = true;
        marked[dateStr].dotColor = theme.tint;
      }
    });

    // Always mark today as selected if not viewing another day
    marked[viewingDate] = marked[viewingDate] || {};
    marked[viewingDate].selected = true;
    marked[viewingDate].selectedColor = theme.tint;

    return marked;
  };

  // Filter reminders for a specific date
  const getRemindersForDate = (date) => {
    const day = new Date(date);
    return reminders.filter((r) => {
      const startDate = new Date(r.date);
      if (r.repeat === "None") return toLocalDateString(startDate) === toLocalDateString(day);
      if (r.repeat === "Daily") return day >= startDate;
      if (r.repeat === "Weekly") return day >= startDate && day.getDay() === startDate.getDay();
      if (r.repeat === "Monthly") return day >= startDate && day.getDate() === startDate.getDate();
      return false;
    });
  };

  // Select day: update currently viewed date
  const handleDayPress = (day) => {
    const selected = new Date(day.dateString);
    const selectedStr = toLocalDateString(selected);
    const todayStr = toLocalDateString(today);

    if (selectedStr < todayStr) return; // Block past days
    setViewingDate(day.dateString);
  };

  // Create/Edit reminders
  const handleCreateReminder = () => {
    setEditingReminder(null); // Reset editing reminder
    return true;
  };
  const handleEditReminder = (reminder) => {
    setEditingReminder(reminder); // Set reminder to edit
    return true;
  };

  // Save reminder and schedule notifications
  const handleSaveReminder = async (reminderData) => {
    try {
      let savedReminder;

      // Update existing reminder
      if (reminderData._id) {
        // Get old reminder from state
        const oldReminder = reminders.find(r => r._id === reminderData._id);

        // Update reminder
        savedReminder = await reminderService.updateReminder(reminderData._id, reminderData);

        // Cancel old notifications using the old reminder's notificationIds
        if (oldReminder?.notificationIds?.length) {
          await notificationService.cancelNotifications(oldReminder.notificationIds);
        }

        setReminders((prev) =>
          prev.map((r) => (r._id === savedReminder._id ? savedReminder : r))
        );
        CustomToast.reminderUpdated(savedReminder.title);
      } else {
        // Create new reminder
        const { _id, ...dataWithoutId } = reminderData;
        savedReminder = await reminderService.createReminder(dataWithoutId);
        setReminders((prev) => [...prev, savedReminder]);
        CustomToast.reminderSaved(savedReminder.title);
      }

      // Schedule notifications for next 90 days
      const ids = await notificationService.scheduleReminderNotification(savedReminder, 90);
      savedReminder.notificationIds = ids;
      setReminders((prev) =>
        prev.map((r) => (r._id === savedReminder._id ? savedReminder : r))
      );
    } catch (error) {
      CustomToast.error("Failed to save reminder", "Please try again");
      console.log(error);
    }
  };

  // Delete reminder
  const handleDeleteReminder = async (id) => {
    try {
      const deleted = reminders.find((r) => r._id === id);
      await reminderService.deleteReminder(id);

      // Cancel scheduled notifications
      if (deleted?.notificationIds) {
        await notificationService.cancelNotifications(deleted.notificationIds);
      }

      setReminders((prev) => prev.filter((r) => r._id !== id));
      CustomToast.reminderDeleted(deleted?.title || "");
    } catch (error) {
      CustomToast.error("Failed to delete reminder", "Please try again");
    }
  };

  // Return all state and handlers for the consuming component
  return {
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
  };
}
