import React, { useEffect, useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Modal,
  Text,
  TouchableOpacity,
  useColorScheme,
  Alert,
  ScrollView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import { Font } from "@/constants/Font";
import ModalCloseButton from "../ModalCloseButton";
import PrimaryButton from "../PrimaryButton";
import SupplementsPlan from "./models/SupplementsPlan";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";

// Labels only; index still maps 0=Mon ... 6=Sun
const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

const DECIMAL_RE = /^\d*\.?\d*$/; // allows "", "5", "5.", "5.4"

// SupplementsInput show the filling form to plan supplement
export default function SupplementsInput({
  visible,
  onCancel,
  onSaveSupplement, // (plan: SupplementsPlan) => void
  entryToEdit, // optional existing plan
}) {
  const scheme = useColorScheme();
  const theme = Colors[scheme ?? "light"];
  const insets = useSafeAreaInsets();

  // Form state
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState(""); // "5g"
  const [timeOfDay, setTimeOfDay] = useState(""); // "08:00 AM"
  const [selectedDays, setSelectedDays] = useState([]);
  const [showErrors, setShowErrors] = useState(false);

  // Time state
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [timeValue, setTimeValue] = useState(new Date());

  // Keep the bottom content clear of the floating button
  const BTN_HEIGHT = 56;
  const EXTRA_BOTTOM = 40;
  const bottomGutter = BTN_HEIGHT + EXTRA_BOTTOM + insets.bottom + 8;

  // Prefill on edit
  useEffect(() => {
    if (!visible) return;
    if (entryToEdit) {
      setName(entryToEdit.name ?? "");
      setDosage(entryToEdit.dosage ?? "");
      const parsed = parseTimeString(entryToEdit.timeOfDay);
      if (parsed) {
        setTimeOfDay(formatTime(parsed));
      } else {
        setTimeValue(new Date());
        setTimeOfDay(entryToEdit.timeOfDay ?? "");
      }
      setSelectedDays(
        Array.isArray(entryToEdit.selectedDays) ? entryToEdit.selectedDays : []
      );
      setShowErrors(false);
    } else {
      resetForm();
    }
  }, [visible, entryToEdit]);

  function handleDosageChange(text) {
  // normalize comma to dot if someone types "5,4"
  const v = text.replace(",", ".");
  if (DECIMAL_RE.test(v)) {
    setDosage(v);
  }
}

  // resetForm is used to reset form to blank
  function resetForm() {
    setName("");
    setDosage("");
    setTimeOfDay("");
    setSelectedDays([]);
    setShowErrors(false);
  }

  // toggleDay is used to choose days
  function toggleDay(idx) {
    setSelectedDays((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  }

  // handleCancel: cancel inpur form and go back to main screen
  function handleCancel() {
    resetForm();
    onCancel?.();
  }

  // handleSave to save the input
  function handleSave() {
    const isNameValid = name.trim().length > 0;
    const isTimeValid = timeOfDay.trim().length > 0;
    const isDaysValid = selectedDays.length > 0;
    // dosage: must be a number > 0 (supports "5" or "5.4")
    const cleaned = dosage.trim().replace(",", ".");
    const isDosageValid = /^\d*\.?\d+$/.test(cleaned) && Number(cleaned) > 0;

    setShowErrors(true);
    if (!isNameValid || !isDosageValid || !isTimeValid || !isDaysValid) {
      const missing = [];
      if (!isNameValid) missing.push("supplement name");
      if (!isDosageValid) missing.push("dosage");
      if (!isTimeValid) missing.push("time to take");
      if (!isDaysValid) missing.push("days to take");

      return;
    }

    const plan = new SupplementsPlan(
      entryToEdit,
        //`supp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name.trim(),
      cleaned,
      timeOfDay.trim(),
      [...selectedDays],
      entryToEdit?.logs || [] // preserve logs if editing
    );

    onSaveSupplement?.(plan);
    resetForm();
    onCancel?.();
  }

  // formatTime formats time to the right format
  function formatTime(date) {
    const h24 = date.getHours();
    const m = date.getMinutes();
    const ampm = h24 >= 12 ? "PM" : "AM";
    const h12 = h24 % 12 || 12;
    const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
    return `${h12}:${pad(m)} ${ampm}`;
  }

  // Accepts "HH:mm" or "h:mm AM/PM"
  function parseTimeString(str) {
    if (!str || typeof str !== "string") return null;

    // h:mm AM/PM
    const ampmMatch = str.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
    if (ampmMatch) {
      let h = parseInt(ampmMatch[1], 10);
      const m = parseInt(ampmMatch[2], 10);
      const ampm = ampmMatch[3].toUpperCase();
      if (ampm === "PM" && h < 12) h += 12;
      if (ampm === "AM" && h === 12) h = 0;
      const d = new Date();
      d.setHours(h, m, 0, 0);
      return d;
    }

    // HH:mm
    const hhmm = str.match(/^(\d{2}):(\d{2})$/);
    if (hhmm) {
      const h = parseInt(hhmm[1], 10);
      const m = parseInt(hhmm[2], 10);
      const d = new Date();
      d.setHours(h, m, 0, 0);
      return d;
    }

    return null;
    // If nothing matched, return null and keep defaults
  }

  const TextOnDark = { color: theme.background };

  const nameErr = showErrors && name.trim().length === 0;
  const dosageErr = showErrors && dosage.trim().length === 0;
  const timeErr = showErrors && timeOfDay.trim().length === 0;
  const daysErr = showErrors && selectedDays.length === 0;
  const dosageFormatErr =
    showErrors &&
    dosage.trim().length > 0 &&
    !/^\d*\.?\d+$/.test(dosage.trim()); // must have at least one digit if not empty

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.textPrimary,
              paddingBottom: Platform.OS === "ios" ? 14 : 14,
            },
          ]}
        >
          <ModalCloseButton onPress={handleCancel} />

          <Text style={[styles.header, TextOnDark, { fontFamily: Font.bold }]}>
            Log a Supplement
          </Text>
          <Text style={[styles.sub, TextOnDark, { fontFamily: Font.regular }]}>
            What will you be taking?
          </Text>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: bottomGutter }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator
          >
            {/* Name */}
            <Text
              style={[styles.label, TextOnDark, { fontFamily: Font.semibold }]}
            >
              SUPPLEMENT NAME *
            </Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: theme.inputField, fontFamily: Font.regular },
                nameErr && { borderColor: theme.error, marginBottom: 6 },
              ]}
              placeholder="e.g., Creatine"
              placeholderTextColor="#4C5A6A"
              value={name}
              onChangeText={setName}
              returnKeyType="next"
            />
            {nameErr ? (
              <Text style={err(theme)}>Please enter a name</Text>
            ) : null}

            {/* Dosage */}
            <Text
              style={[styles.label, TextOnDark, { fontFamily: Font.semibold }]}
            >
              WHAT IS THE DOSAGE (IN GRAMS)? *
            </Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: theme.inputField, fontFamily: Font.regular },
                (dosageErr || dosageFormatErr) && {
                  borderColor: theme.error,
                  marginBottom: 6,
                },
              ]}
              placeholder="e.g., 5"
              placeholderTextColor="#4C5A6A"
              value={dosage}
              onChangeText={handleDosageChange}
              onBlur={() => {
                // tidy up: strip trailing dot like "5."
                setDosage((d) => (d && d.endsWith(".") ? d.slice(0, -1) : d));
              }}
              keyboardType={Platform.OS === "ios" ? "decimal-pad" : "numeric"}
              returnKeyType="next"
            />
            {dosageErr ? (
              <Text style={err(theme)}>Please enter a dosage</Text>
            ) : dosageFormatErr ? (
              <Text style={err(theme)}>Only numbers like 5 or 5.4</Text>
            ) : null}

            {/* Time of day (picker) */}
            <Text
              style={[styles.label, TextOnDark, { fontFamily: Font.semibold }]}
            >
              WHAT TIME DO YOU WANT TO TAKE THIS? *
            </Text>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setShowTimePicker(true)}
              accessibilityRole="button"
              accessibilityLabel="Select time to take supplement"
              accessibilityHint="Opens a time picker"
              style={[
                styles.input,
                {
                  backgroundColor: theme.inputField,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                },
                timeErr && { borderColor: theme.error, marginBottom: 6 },
              ]}
            >
              <Text
                style={{
                  color: timeOfDay ? "#0B2239" : "#4C5A6A",
                  fontFamily: Font.regular,
                  flex: 1,
                }}
                numberOfLines={1}
              >
                {timeOfDay || "Select a time"}
              </Text>

              {/* Visual affordance only to indicate the field is clickable */}
              <Ionicons
                name="chevron-down"
                size={20}
                color={timeOfDay ? theme.background : "#4C5A6A"}
                style={{ marginLeft: 8 }}
              />
            </TouchableOpacity>

            {timeErr ? (
              <Text style={err(theme)}>Please select a time</Text>
            ) : null}

            {/* Native time picker */}
            {showTimePicker && (
              <>
                <DateTimePicker
                  value={timeValue}
                  mode="time"
                  is24Hour={false}
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={(event, selected) => {
                    if (Platform.OS === "android") {
                      setShowTimePicker(false);
                    }
                    if (selected) {
                      setTimeValue(selected);
                      setTimeOfDay(formatTime(selected));
                    }
                  }}
                />
                {Platform.OS === "ios" && (
                  <View style={styles.iosBar}>
                    <TouchableOpacity
                      onPress={() => {
                        setTimeOfDay(formatTime(timeValue));
                        setShowTimePicker(false);
                      }}
                      style={[styles.iosBarBtn, { borderColor: theme.tint }]}
                      activeOpacity={0.85}
                    >
                      <Text
                        style={{ color: theme.tint, fontFamily: Font.bold }}
                      >
                        Done
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setShowTimePicker(false)}
                      style={[
                        styles.iosBarBtn,
                        { borderColor: theme.overlayLight },
                      ]}
                      activeOpacity={0.85}
                    >
                      <Text
                        style={{
                          color: theme.overlayLight,
                          fontFamily: Font.bold,
                        }}
                      >
                        Cancel
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}

            {/* Days */}
            <Text
              style={[
                styles.sub,
                TextOnDark,
                { fontFamily: Font.semibold, marginBottom: 8, marginTop: 8 },
              ]}
            >
              WHAT DAYS WILL YOU TAKE THIS? *
            </Text>
            <View
              style={[
                styles.daysRow,
                daysErr && {
                  borderWidth: 1,
                  borderColor: theme.error,
                  borderRadius: 8,
                  paddingVertical: 6,
                  marginTop: 1,
                },
              ]}
            >
              {DAYS.map((label, idx) => {
                const active = selectedDays.includes(idx);
                return (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => toggleDay(idx)}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    style={[
                      styles.dayBox,
                      {
                        backgroundColor: active ? theme.tint : theme.inputField,
                        borderColor: active ? theme.tint : theme.inputField,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: active ? theme.background : "#0B2239",
                        fontFamily: Font.bold,
                        fontSize: 16,
                      }}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {daysErr ? (
              <Text style={err(theme)}>Please choose at least one day</Text>
            ) : null}

            {/* Supplement reminder note */}
            <View style={styles.reminderSection}>
              <View
                style={[
                  styles.reminderContainer,
                  { borderLeftColor: theme.tint, borderColor: theme.tint },
                ]}
              >
                <Ionicons
                  name="notifications"
                  size={16}
                  color={theme.tint}
                  style={styles.reminderIcon}
                />
                <Text
                  style={[
                    styles.reminderText,
                    { fontFamily: Font.regular, color: theme.tint },
                  ]}
                >
                  By default, you will be reminded one hour before, and once
                  more at the time you specified.
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Floating Save */}
          <PrimaryButton
            title={
              entryToEdit ? "Update Supplement Entry" : "Save Supplement Entry"
            }
            onPress={handleSave}
            floating
            extraBottom={EXTRA_BOTTOM}
            tabBarHeight={0}
            insetLR={14}
            style={{ width: "100%" }}
          />
        </View>
      </View>
    </Modal>
  );
}

function err(theme) {
  return {
    color: theme.error,
    marginLeft: 10,
    marginTop: 2,
    fontFamily: Font.regular,
    fontSize: 12,
  };
}



const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end", // bottom sheet
  },
  sheet: {
    height: "90%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 14,
  },
  header: { fontSize: 22, margin: 8, paddingTop: 6 },
  sub: { fontSize: 14, marginBottom: 16, paddingLeft: 12 },
  label: { fontSize: 14, marginBottom: 6, paddingLeft: 12 },

  input: {
    borderWidth: 1,
    borderColor: "#ffffff",
    backgroundColor: "#ffffff",
    color: "#120438",
    borderRadius: 8,
    width: "97%",
    padding: 14,
    margin: 5,
    marginBottom: 14,
  },

  daysRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 6,
    marginBottom: 8,
    justifyContent: "center",
  },
  dayBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  
  reminderText: {
    fontSize: 12,
    textAlign: "center",
    opacity: 0.8,
    flex: 1,
    lineHeight: 20,
  },
  reminderSection: {
    marginBottom: 20,
    marginTop: 20,
  },

  reminderContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    backgroundColor: "#F0F8FF",
  },

  reminderIcon: {
    marginRight: 8,
    marginTop: 2,
  },

});
