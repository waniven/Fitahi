import { useState, useEffect } from "react";
import CustomToast from "@/components/common/CustomToast";
import * as reminderService from "../services/reminderService";

// Custom hook for calendar & reminder logic
export function useCalendarLogic() {
  const [reminders, setReminders] = useState([]);
  const [viewingDate, setViewingDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [editingReminder, setEditingReminder] = useState(null);

  const formattedToday = new Date().toISOString().split("T")[0];

  // Load reminders from backend on mount
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

  // Marked dates for the calendar
  const getMarkedDates = (theme) => {
    return reminders.reduce(
      (acc, r) => {
        acc[r.date] = { marked: true, dotColor: theme.tint };
        return acc;
      },
      {
        [formattedToday]: { selected: true, selectedColor: theme.tint + "40" },
      }
    );
  };

  // Filter reminders for a specific date
  const getRemindersForDate = (date) => {
    return reminders.filter((r) => r.date === date);
  };

  // Handle selecting a day
  const handleDayPress = (day) => {
    const selected = new Date(day.dateString);
    if (selected < new Date(formattedToday)) return;
    setViewingDate(day.dateString);
  };

  // Start creating a new reminder
  const handleCreateReminder = () => {
    setEditingReminder(null);
    return true; // for modal open in Home
  };

  // Start editing an existing reminder
  const handleEditReminder = (reminder) => {
    setEditingReminder(reminder);
    return true; // for modal open in Home
  };

  // Save or update a reminder (backend integrated)
  const handleSaveReminder = async (reminderData) => {
    const now = new Date();
    const selected = new Date(
      reminderData.date + "T" + (reminderData.time || "00:00")
    );

    if (selected < now) {
      CustomToast.error(
        "Invalid Reminder",
        "Cannot set a reminder in the past"
      );
      return;
    }

    try {
      if (reminderData._id) {
        // Update existing reminder in backend
        const updated = await reminderService.updateReminder(
          reminderData._id,
          reminderData
        );
        setReminders((prev) =>
          prev.map((r) => (r._id === updated._id ? updated : r))
        );
        CustomToast.reminderUpdated(updated.title);
      } else {
        // Add new reminder in backend
        const { _id, ...dataWithoutId } = reminderData; // remove _id if present
        const created = await reminderService.createReminder(dataWithoutId);
        setReminders((prev) => [...prev, created]);
        CustomToast.reminderSaved(created.title);
      }
    } catch (error) {
      CustomToast.error(
        "Failed to save reminder",
        error?.message || "Please try again"
      );
    }
  };

  // Delete a reminder (backend integrated)
  const handleDeleteReminder = async (id) => {
    const deleted = reminders.find((r) => r._id === id);
    try {
      await reminderService.deleteReminder(id);
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
