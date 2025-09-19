import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/Colors";
import { Type } from "../../constants/Font";
import CustomButton from "../common/CustomButton";
import CustomToast from "../common/CustomToast";
import Toast from "react-native-toast-message";

// Configuration constants
const VALIDATION_CONFIG = {
  title: { minLength: 2, maxLength: 100 },
  time: { required: true },
};

// Local text styles using Font constants
const textStyles = {
  heading1: { fontSize: 28, ...Type.bold },
  bodyMedium: { fontSize: 16, ...Type.bold },
  bodySmall: { fontSize: 16, ...Type.regular },
  caption: { fontSize: 12, ...Type.regular },
};

/**
 * ReminderModal - Modal for entering reminder data
 * Shows title, notes, date, time, and repeat options
 */
export default function ReminderModal({
  visible,
  onClose,
  onSave,
  onDelete,
  reminder = null,
  selectedDate = null,
  validationConfig = VALIDATION_CONFIG,
}) {
  const [currentReminder, setCurrentReminder] = useState({
    id: "",
    title: "",
    notes: "",
    date: "",
    time: "",
    repeat: "None",
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Initialize reminder when modal opens
  useEffect(() => {
    if (visible) {
      if (reminder) {
        // consistent id field
        setCurrentReminder({
          id: reminder._id || reminder.id || "",
          title: reminder.title || "",
          notes: reminder.notes || "",
          date:
            reminder.date ||
            selectedDate ||
            new Date().toISOString().split("T")[0],
          time: reminder.time || "",
          repeat: reminder.repeat || "None",
        });
      } else {
        // creating new reminder
        setCurrentReminder({
          id: "",
          title: "",
          notes: "",
          date: selectedDate || new Date().toISOString().split("T")[0],
          time: "",
          repeat: "None",
        });
      }
    }
  }, [visible, reminder, selectedDate]);

  /**
   * Clears validation errors for title
   */
  const handleTitleChange = (value) => {
    setCurrentReminder((prev) => ({ ...prev, title: value }));
    if (validationErrors.title) {
      setValidationErrors((prev) => ({ ...prev, title: null }));
    }
  };

  /**
   * Validates title input
   */
  const validateTitle = (value) => {
    if (!value?.trim()) return "Title is required";
    if (value.trim().length < validationConfig.title.minLength) {
      return `Title must be at least ${validationConfig.title.minLength} characters`;
    }
    if (value.trim().length > validationConfig.title.maxLength) {
      return `Title must be less than ${validationConfig.title.maxLength} characters`;
    }
    return null;
  };

  /**
   * Format date for display
   */
  const formatDisplayDate = (dateString) => {
    if (!dateString) return "Pick Date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  /**
   * Format time for display
   */
  const formatDisplayTime = (timeString) => {
    if (!timeString) return "Pick Time";
    const [hours, minutes] = timeString.split(":");
    const hour12 = hours % 12 || 12;
    const ampm = hours >= 12 ? "PM" : "AM";
    return `${hour12}:${minutes} ${ampm}`;
  };

  /**
   * Handle date picker changes
   */
  const handleDateChange = (event, selectedDateObj) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }

    if (event.type === "set" && selectedDateObj) {
      const formattedDate = selectedDateObj.toISOString().split("T")[0];
      setCurrentReminder((prev) => ({ ...prev, date: formattedDate }));
    }
  };

  /**
   * Handle time picker changes
   */
  const handleTimeChange = (event, selectedTimeObj) => {
    if (Platform.OS === "android") {
      setShowTimePicker(false);
    }

    if (event.type === "set" && selectedTimeObj) {
      const hours = selectedTimeObj.getHours().toString().padStart(2, "0");
      const minutes = selectedTimeObj.getMinutes().toString().padStart(2, "0");
      const formattedTime = `${hours}:${minutes}`;
      setCurrentReminder((prev) => ({ ...prev, time: formattedTime }));
    }
  };

  /**
   * Validate that time has been selected
   */
  const validateTime = (value) => {
    if (!value || !value.trim()) return "Time is required";
    return null;
  };

  /**
   * Handle date picker confirm (iOS)
   */
  const handleDateConfirm = () => {
    setShowDatePicker(false);
  };

  /**
   * Handle time picker confirm (iOS)
   */
  const handleTimeConfirm = () => {
    setShowTimePicker(false);
  };

  /**
   * Checks if user has entered any data
   */
  const hasUserData = () => {
    return (
      currentReminder.title.trim() ||
      currentReminder.notes.trim() ||
      currentReminder.time
    );
  };

  /**
   * Closes modal and resets form state
   */
  const closeModal = () => {
    setCurrentReminder({
      id: "",
      title: "",
      notes: "",
      date: "",
      time: "",
      repeat: "None",
    });
    setValidationErrors({});
    onClose();
  };

  /**
   * Validates all form fields
   */
  const validateForm = () => {
    const errors = {};

    const titleError = validateTitle(currentReminder.title);
    if (titleError) errors.title = titleError;

    const timeError = validateTime(currentReminder.time);
    if (timeError) errors.time = timeError;

    return errors;
  };

  /**
   * Validates and submits reminder data
   */
  const submitReminder = () => {
    const currentValidationErrors = validateForm();
    setValidationErrors(currentValidationErrors);

    if (Object.keys(currentValidationErrors).length === 0) {
      // Only include id if editing
      const reminderToSave = {
        title: currentReminder.title.trim(),
        notes: currentReminder.notes,
        date: currentReminder.date,
        time: currentReminder.time,
        repeat: currentReminder.repeat,
        ...(currentReminder.id ? { _id: currentReminder.id } : {}),
      };

      if (onSave) {
        onSave(reminderToSave);
      }
      closeModal();
    } else {
      CustomToast.validationError();
    }
  };

  /**
   * Handle delete reminder
   */
  const handleDelete = () => {
    if (currentReminder.id && onDelete) {
      onDelete(currentReminder.id);
    }
    closeModal();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={closeModal}
    >
      {/* Background overlay */}
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.backgroundTouchable}
          activeOpacity={1}
          onPress={closeModal}
        />

        {/* Modal content */}
        <View style={styles.modalContainer}>
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <View style={styles.modalContent}>
              {/* Modal header with title and close button */}
              <View style={styles.modalHeaderSection}>
                <Text style={[textStyles.heading1, styles.modalTitleText]}>
                  {currentReminder.id ? "Edit Reminder" : "Add Reminder"}
                </Text>
                <TouchableOpacity
                  onPress={closeModal}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={28} color="#666" />
                </TouchableOpacity>
              </View>

              <Text style={[textStyles.bodyMedium, styles.modalSubtitleText]}>
                What would you like to be reminded about?
              </Text>

              {/* Title input section */}
              <View style={styles.inputSection}>
                <Text style={[textStyles.bodyMedium, styles.inputLabel]}>
                  REMINDER TITLE *
                </Text>
                <View
                  style={[
                    styles.inputContainer,
                    validationErrors.title && styles.inputError,
                  ]}
                >
                  <TextInput
                    style={[textStyles.bodySmall, styles.textInput]}
                    placeholder="Enter reminder title"
                    placeholderTextColor="#A0A0A0"
                    value={currentReminder.title}
                    onChangeText={handleTitleChange}
                    returnKeyType="next"
                  />
                </View>
                {validationErrors.title && (
                  <Text style={[textStyles.bodySmall, styles.errorText]}>
                    {validationErrors.title}
                  </Text>
                )}
              </View>

              {/* Notes input section */}
              <View style={styles.inputSection}>
                <Text style={[textStyles.bodyMedium, styles.inputLabel]}>
                  NOTES (OPTIONAL)
                </Text>
                <View style={[styles.inputContainer, styles.notesContainer]}>
                  <TextInput
                    style={[
                      textStyles.bodySmall,
                      styles.textInput,
                      styles.notesInput,
                    ]}
                    placeholder="Add additional notes"
                    placeholderTextColor="#A0A0A0"
                    value={currentReminder.notes}
                    onChangeText={(text) =>
                      setCurrentReminder((prev) => ({ ...prev, notes: text }))
                    }
                    multiline
                    textAlignVertical="top"
                    returnKeyType="done"
                  />
                </View>
              </View>

              {/* Date and Time picker section */}
              <View style={styles.dateTimeSection}>
                <Text style={[textStyles.bodyMedium, styles.inputLabel]}>
                  DATE & TIME
                </Text>

                <View style={styles.dateTimeRow}>
                  {/* Date picker */}
                  <View style={styles.dateTimeColumn}>
                    <Text style={[textStyles.caption, styles.dateTimeLabel]}>
                      DATE
                    </Text>
                    <TouchableOpacity
                      style={styles.pickerContainer}
                      onPress={() => setShowDatePicker(true)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.pickerContent}>
                        <Ionicons
                          name="calendar-outline"
                          size={20}
                          color="#4A90E2"
                        />
                        <Text style={[textStyles.bodySmall, styles.pickerText]}>
                          {formatDisplayDate(currentReminder.date)}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>

                  {/* Time picker */}
                  <View style={styles.dateTimeColumn}>
                    <Text style={[textStyles.caption, styles.dateTimeLabel]}>
                      TIME
                    </Text>

                    <TouchableOpacity
                      style={[
                        styles.pickerContainer,
                        validationErrors.time && styles.inputError,
                      ]}
                      onPress={() => setShowTimePicker(true)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.pickerContent}>
                        <Ionicons
                          name="time-outline"
                          size={20}
                          color="#4A90E2"
                        />
                        <Text style={[textStyles.bodySmall, styles.pickerText]}>
                          {formatDisplayTime(currentReminder.time)}
                        </Text>
                      </View>
                    </TouchableOpacity>

                    {/* Error message below, like title field */}
                    {validationErrors.time && (
                      <Text style={[textStyles.bodySmall, styles.errorText]}>
                        {validationErrors.time}
                      </Text>
                    )}
                  </View>
                </View>
              </View>

              {/* Repeat options section */}
              <View style={styles.inputSection}>
                <Text style={[textStyles.bodyMedium, styles.inputLabel]}>
                  REPEAT
                </Text>
                <View style={styles.repeatContainer}>
                  {["None", "Daily", "Weekly", "Monthly"].map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.repeatButton,
                        currentReminder.repeat === option &&
                          styles.repeatButtonSelected,
                      ]}
                      onPress={() =>
                        setCurrentReminder((prev) => ({
                          ...prev,
                          repeat: option,
                        }))
                      }
                    >
                      <Text
                        style={[
                          textStyles.bodySmall,
                          styles.repeatButtonText,
                          currentReminder.repeat === option &&
                            styles.repeatButtonTextSelected,
                        ]}
                      >
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Action buttons section */}
              <View style={styles.actionButtonsSection}>
                {currentReminder.id && (
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={handleDelete}
                  >
                    <Text
                      style={[textStyles.bodyMedium, styles.deleteButtonText]}
                    >
                      Delete Reminder
                    </Text>
                  </TouchableOpacity>
                )}

                <CustomButton
                  title={currentReminder.id ? "Save Changes" : "Add Reminder"}
                  onPress={submitReminder}
                  variant="primary"
                  size="large"
                  style={styles.submitButton}
                />
              </View>
            </View>
          </ScrollView>
        </View>

        {/* iOS Date Picker Modal */}
        {showDatePicker && Platform.OS === "ios" && (
          <View style={styles.pickerOverlay}>
            <View style={styles.pickerModal}>
              <View style={styles.pickerHeader}>
                <TouchableOpacity
                  onPress={() => setShowDatePicker(false)}
                  style={styles.pickerButton}
                >
                  <Text
                    style={[textStyles.bodyMedium, styles.pickerButtonText]}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleDateConfirm}
                  style={styles.pickerButton}
                >
                  <Text
                    style={[
                      textStyles.bodyMedium,
                      styles.pickerButtonText,
                      styles.confirmButton,
                    ]}
                  >
                    Done
                  </Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={
                  currentReminder.date
                    ? new Date(currentReminder.date)
                    : new Date()
                }
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                style={styles.picker}
                textColor="#000000"
                themeVariant="light"
              />
            </View>
          </View>
        )}

        {/* iOS Time Picker Modal */}
        {showTimePicker && Platform.OS === "ios" && (
          <View style={styles.pickerOverlay}>
            <View style={styles.pickerModal}>
              <View style={styles.pickerHeader}>
                <TouchableOpacity
                  onPress={() => setShowTimePicker(false)}
                  style={styles.pickerButton}
                >
                  <Text
                    style={[textStyles.bodyMedium, styles.pickerButtonText]}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleTimeConfirm}
                  style={styles.pickerButton}
                >
                  <Text
                    style={[
                      textStyles.bodyMedium,
                      styles.pickerButtonText,
                      styles.confirmButton,
                    ]}
                  >
                    Done
                  </Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={
                  currentReminder.time
                    ? new Date(
                        `${currentReminder.date}T${currentReminder.time}`
                      )
                    : new Date()
                }
                mode="time"
                display="spinner"
                onChange={handleTimeChange}
                style={styles.picker}
                textColor="#000000"
                themeVariant="light"
              />
            </View>
          </View>
        )}

        {/* Android Date Picker */}
        {showDatePicker && Platform.OS === "android" && (
          <DateTimePicker
            value={
              currentReminder.date ? new Date(currentReminder.date) : new Date()
            }
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}

        {/* Android Time Picker */}
        {showTimePicker && Platform.OS === "android" && (
          <DateTimePicker
            value={
              currentReminder.time
                ? new Date(`${currentReminder.date}T${currentReminder.time}`)
                : new Date()
            }
            mode="time"
            display="default"
            onChange={handleTimeChange}
          />
        )}
      </View>
      <Toast />
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  backgroundTouchable: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
  },
  scrollView: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  modalContent: {
    paddingBottom: 40,
  },
  modalHeaderSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitleText: {
    color: "#000",
  },
  closeButton: {
    padding: 4,
  },
  modalSubtitleText: {
    color: "#666",
    marginBottom: 32,
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    color: "#000",
    marginBottom: 8,
  },
  inputContainer: {
    backgroundColor: "#E4F8FF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: "transparent",
    minHeight: 56,
  },
  notesContainer: {
    minHeight: 80,
  },
  textInput: {
    color: "#000",
    padding: 0,
    margin: 0,
    flex: 1,
    minHeight: 20,
  },
  notesInput: {
    minHeight: 44,
    textAlignVertical: "top",
  },
  dateTimeSection: {
    marginBottom: 24,
  },
  dateTimeRow: {
    flexDirection: "row",
    gap: 12,
  },
  dateTimeColumn: {
    flex: 1,
  },
  dateTimeLabel: {
    color: "#000",
    marginBottom: 8,
  },
  pickerContainer: {
    backgroundColor: "#E4F8FF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: "transparent",
    minHeight: 56,
    justifyContent: "center",
  },
  pickerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  pickerText: {
    color: "#000",
    flex: 1,
  },
  repeatContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  repeatButton: {
    backgroundColor: "#E4F8FF",
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 16,
    minWidth: "47%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  repeatButtonSelected: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  repeatButtonText: {
    fontWeight: "600",
    color: "#000",
  },
  repeatButtonTextSelected: {
    color: "#fff",
  },
  actionButtonsSection: {
    marginTop: 16,
    paddingBottom: 20,
  },
  deleteButton: {
    backgroundColor: "#FF4D4D",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  deleteButtonText: {
    color: "#fff",
  },
  submitButton: {
    width: "100%",
    minHeight: 50,
  },
  inputError: {
    borderColor: "#FF5252",
    borderWidth: 2,
  },
  errorText: {
    color: "#FF5252",
    marginTop: 4,
  },
  pickerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
    zIndex: 1000,
  },
  pickerModal: {
    backgroundColor: "#F8F9FA",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingBottom: 34,
  },
  pickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E7",
    backgroundColor: "#F8F9FA",
  },
  pickerButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  pickerButtonText: {
    color: "#007AFF",
  },
  confirmButton: {
    fontWeight: "600",
  },
  picker: {
    backgroundColor: "#F8F9FA",
    height: 216,
    alignSelf: "center",
    width: "100%",
  },
});
