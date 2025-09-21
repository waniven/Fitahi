import { useState, useEffect } from "react";
import CustomToast from "@/components/common/CustomToast";
import * as reminderService from "../services/reminderService";
import * as notificationService from "../services/notificationService";

// Custom hook for calendar & reminder logic
export function useCalendarLogic() {
  const [reminders, setReminders] = useState([]);
  const [viewingDate, setViewingDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [editingReminder, setEditingReminder] = useState(null);

  const today = new Date();
  const formattedToday = today.toISOString().split("T")[0];

  // Load reminders
  useEffect(() => {
    const fetchReminders = async () => {
      try {
        const data = await reminderService.getReminders();
        setReminders(data);
      } catch (error) {
        CustomToast.error(
          "Failed to load reminders",
          error?.message || "Please try again later"
        );
      }
    };
    fetchReminders();
  }, []);

  const toLocalDateString = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  // MARKED DATES
  const getMarkedDates = (theme) => {
    const marked = {};
    reminders.forEach((r) => {
      const startDate = new Date(r.date);
      for (let i = 0; i < 90; i++) {
        let checkDate = new Date(startDate);

        if (r.repeat === "Daily") {
          checkDate.setDate(startDate.getDate() + i);
        } else if (r.repeat === "Weekly") {
          checkDate.setDate(startDate.getDate() + i);
          if (checkDate.getDay() !== startDate.getDay()) continue;
        } else if (r.repeat === "Monthly") {
          const monthIndex = startDate.getMonth() + i;
          const year = startDate.getFullYear() + Math.floor(monthIndex / 12);
          const month = monthIndex % 12;
          const day = Math.min(startDate.getDate(), new Date(year, month + 1, 0).getDate());
          checkDate.setFullYear(year, month, day);
        } else {
          checkDate = startDate;
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

  // REMINDERS FOR A DATE
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

  // SELECT DAY
  const handleDayPress = (day) => {
    const selected = new Date(day.dateString);
    if (selected < today) return; // disable past selection
    setViewingDate(day.dateString);
  };

  // CREATE / EDIT
  const handleCreateReminder = () => {
    setEditingReminder(null);
    return true;
  };
  const handleEditReminder = (reminder) => {
    setEditingReminder(reminder);
    return true;
  };

  // SAVE REMINDER + NOTIFICATIONS
  const handleSaveReminder = async (reminderData) => {
    try {
      let savedReminder;

      // Update
      if (reminderData._id) {
        savedReminder = await reminderService.updateReminder(reminderData._id, reminderData);
        if (savedReminder.notificationIds) {
          await notificationService.cancelNotifications(savedReminder.notificationIds);
        }
        setReminders((prev) =>
          prev.map((r) => (r._id === savedReminder._id ? savedReminder : r))
        );
        CustomToast.reminderUpdated(savedReminder.title);
      } else {
        // Create
        const { _id, ...dataWithoutId } = reminderData;
        savedReminder = await reminderService.createReminder(dataWithoutId);
        setReminders((prev) => [...prev, savedReminder]);
        CustomToast.reminderSaved(savedReminder.title);
      }

      // Schedule notifications
      const ids = await notificationService.scheduleReminderNotification(savedReminder, 90);
      savedReminder.notificationIds = ids;
      setReminders((prev) =>
        prev.map((r) => (r._id === savedReminder._id ? savedReminder : r))
      );
    } catch (error) {
      CustomToast.error(
        "Failed to save reminder",
        error?.message || "Please try again"
      );
      console.log(error);
    }
  };

  // DELETE REMINDER
  const handleDeleteReminder = async (id) => {
    try {
      const deleted = reminders.find((r) => r._id === id);
      await reminderService.deleteReminder(id);
      if (deleted?.notificationIds) {
        await notificationService.cancelNotifications(deleted.notificationIds);
      }
      setReminders((prev) => prev.filter((r) => r._id !== id));
      CustomToast.reminderDeleted(deleted?.title || "");
    } catch (error) {
      CustomToast.error(
        "Failed to delete reminder",
        error?.message || "Please try again"
      );
    }
  };

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
