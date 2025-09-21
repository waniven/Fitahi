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
    const marked = {
      [formattedToday]: { selected: true, selectedColor: theme.tint + "40" },
    };

    reminders.forEach((r) => {
      const startDate = new Date(r.date);
      const today = new Date();

      // Mark dates in the next 90 days
      for (let i = 0; i < 90; i++) {
        const checkDate = new Date();
        checkDate.setDate(today.getDate() + i);
        const dateStr = checkDate.toISOString().split("T")[0];

        if (
          r.repeat === 'Daily' && checkDate >= startDate ||
          r.repeat === 'Weekly' && checkDate >= startDate && checkDate.getDay() === startDate.getDay() ||
          r.repeat === 'Monthly' && checkDate >= startDate && checkDate.getDate() === startDate.getDate() ||
          r.repeat === 'None' && r.date === dateStr
        ) {
          marked[dateStr] = { marked: true, dotColor: theme.tint };
        }
      }
    });

    return marked;
  };


  // Filter reminders for a specific date
  const getRemindersForDate = (date) => {
    const day = new Date(date);
    return reminders.filter((r) => {
      const reminderDate = new Date(r.date);

      if (r.repeat === 'None') {
        return r.date === date;
      }

      if (r.repeat === 'Daily') {
        return day >= reminderDate;
      }

      if (r.repeat === 'Weekly') {
        return day >= reminderDate && day.getDay() === reminderDate.getDay();
      }

      if (r.repeat === 'Monthly') {
        return day >= reminderDate && day.getDate() === reminderDate.getDate();
      }

      return false;
    });
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
