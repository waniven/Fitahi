import {
  useState,
  useContext,
  useLayoutEffect,
  useMemo,
  useEffect,
  useCallback,
} from "react";
import {
  Text,
  FlatList,
  StyleSheet,
  View,
  useColorScheme,
  Dimensions,
  Platform,
  TouchableOpacity,
} from "react-native";
import { useIsFocused } from "@react-navigation/native";
import SupplementsInput from "@/components/supplements/SupplementsInput";
import { Colors } from "@/constants/Colors";
import { Font } from "@/constants/Font";
import Fab from "@/components/FloatingActionButton";
import CustomButtonThree from "../../components/common/CustomButtonThree";
import { AIContext } from "../ai/AIContext";
import { useRouter } from "expo-router";
import ListCardItemGeneral from "@/components/ListCardItemGeneral";
import SupplementsLog from "@/components/supplements/models/SupplementsLog";
import BottomNav from "@/components/navbar/BottomNav";
import CustomToast from "@/components/common/CustomToast";

// Import API services for supplements and logs
import {
  getSupplements,
  createSupplement,
  updateSupplement,
  deleteSupplement,
} from "../../services/supplementService";
import {
  getTodaysSupplementLogs,
  createSupplementLog,
  updateSupplementLog,
} from "../../services/supplementLogService";

// Main screen for creating supplement plans and logging intake
function LogSupplements({ navigation }) {
  const scheme = useColorScheme();
  const theme = Colors[scheme ?? "light"];
  const { toggleChat } = useContext(AIContext);
  const router = useRouter();

  // Configure header buttons (back & AI chat) on screen mount
  useLayoutEffect(() => {
    const goBackOrHome = () => {
      if (navigation.canGoBack()) navigation.goBack();
      else router.replace("/home/index");
    };
    navigation.setOptions({
      headerLeft: () => (
        <CustomButtonThree onPress={() => navigation.goBack()} />
      ),
      headerRight: () => (
        <TouchableOpacity
          onPress={toggleChat}
          activeOpacity={0.85}
          style={{ paddingRight: 8 }}
        >
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: "#6761d7ff",
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 5,
            }}
          >
            <Text style={{ color: theme.background, fontSize: 18 }}>💬</Text>
          </View>
        </TouchableOpacity>
      ),
    });
  }, [navigation, theme, toggleChat]);

  // State for modal, plans, editing plan, and selected tab
  const [showInput, setShowInput] = useState(false);
  const [plans, setPlans] = useState([]); // list of supplements plans
  const [planToEdit, setPlanToEdit] = useState(null);
  const [tab, setTab] = useState("today"); // view: "today" or "all"
  const getId = (o) => String(o?.id ?? o?._id ?? "");

  const inFlight = new Set(); // prevent double API requests

  function keyFor(planId, date) {
    return `${planId}::${date}`;
  }

  const NAV_BAR_HEIGHT = 64;
  const BOX_MAX_HEIGHT = Math.round(Dimensions.get("window").height * 0.7);
  const isEmpty = plans.length === 0;

  // Open input modal to add a new supplement plan
  function openAdd() {
    setPlanToEdit(null);
    setShowInput(true);
  }

  // Close the input modal
  function closeInput() {
    setPlanToEdit(null);
    setShowInput(false);
  }

  // Load supplement plans from API
  const loadSupplements = useCallback(async () => {
    try {
      const data = await getSupplements();
      setPlans((prev) => {
        const normalized = Array.isArray(data)
          ? data.map(normalizePlanFromServer)
          : [];

        return normalized.map((newPlan) => {
          const existing = prev.find(
            (p) => String(p.id) === String(newPlan.id)
          );
          return existing ? { ...newPlan, logs: existing.logs ?? [] } : newPlan;
        });
      });
    } catch (err) {
      console.warn("Failed to load supplements:", err);
      CustomToast.error("Failed to load supplements", "Please try again soon.");
    }
  }, []);

  // Load today's supplement logs from API
  const loadSupplementsLogs = useCallback(async () => {
    try {
      const data = await getTodaysSupplementLogs();
      const todayStr = localISODate(new Date());

      setPlans((prev) =>
        prev.map((p) => {
          const matching = data
            .filter(
              (l) =>
                String(l.supplement_id?._id || l.supplement_id) === String(p.id)
            )
            .map((l) => ({
              ...l,
              id: l._id ?? l.id,
              supplement_id: String(l.supplement_id?._id || l.supplement_id),
              date: l.date || todayStr,
            }));

          // keep previous logs except today, then add today's logs
          const otherLogs = (p.logs || []).filter((l) => l.date !== todayStr);
          return { ...p, logs: [...otherLogs, ...matching] };
        })
      );
    } catch (err) {
      console.warn("Failed to load supplement logs:", err);
      CustomToast.error(
        "Failed to load supplement logs",
        "Please try again soon."
      );
    }
  }, []);

  // Load plans and logs on mount
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      (async () => {
        await loadSupplements();
        await loadSupplementsLogs(); // always refresh logs from DB
      })();
    }
  }, [isFocused, loadSupplements, loadSupplementsLogs]);

  // Save new or updated supplement plan
  async function saveSupplement(plan) {
    const id = getId(plan) || getId(planToEdit);
    const isUpdate = Boolean(id);

    if (isUpdate) {
      const prev = plans;
      try {
        await updateSupplement(planToEdit.id, plan);
        CustomToast.info(
          "Supplement updated successfully!",
          "Your changes have been saved."
        );
        loadSupplements();
      } catch (err) {
        console.warn("Update failed:", err?.message || err);
        CustomToast.error(
          "Failed to update Supplement",
          "Please try again soon."
        );
        setPlans(prev);
      }
    } else {
      const prev = plans;
      try {
        const created = await createSupplement(plan);
        const normalized = normalizePlanFromServer(created);
        setPlans((curr) => [...curr, normalized]);
        console.log("created plan:", normalized);
      } catch (err) {
        console.warn("Create failed:", err?.message || err);
        CustomToast.error(
          "Failed to create Supplement Log",
          "Please try again soon."
        );
        setPlans(prev);
      }
    }
  }

  // Delete a supplement plan
  async function deletePlan(id) {
    const prev = plans;
    setPlans((curr) => curr.filter((p) => String(p.id) !== String(id)));

    try {
      await deleteSupplement(id);
      CustomToast.info(
        "Supplement deleted successfully!",
        "Your changes have been saved."
      );
      loadSupplements();
    } catch (err) {
      console.warn("Delete failed:", err);
      CustomToast.error(
        "Failed to delete Supplement Log",
        "Please try again soon."
      );
      setPlans(prev);
    }
  }

  // Start editing a plan
  function startEditPlan(item) {
    setPlanToEdit(item);
    setShowInput(true);
  }

  // Today's date and index for filtering
  const todayStr = localISODate(new Date());
  const todayIdx = getMon0Sun6Index(new Date());

  // Get today's supplement plans with logs, sorted by time
  const todaysItems = useMemo(() => {
    const list = [];
    for (const p of plans) {
      if (!Array.isArray(p.selectedDays)) continue;
      if (!p.selectedDays.includes(todayIdx)) continue;

      const logs = Array.isArray(p.logs) ? p.logs : [];
      let log = logs.find((l) => l?.date === todayStr);
      if (!log) {
        log = new SupplementsLog(p.id, todayStr, "scheduled", null);
      }

      list.push({ plan: p, log, sortKey: timeToMinutes(p.timeOfDay) });
    }
    return list.sort((a, b) => a.sortKey - b.sortKey);
  }, [plans, todayIdx, todayStr]);

  const hasPlans = plans?.length > 0;
  const hasToday = (todaysItems?.length ?? 0) > 0;

  // Toggle today's supplement log status (taken, skipped)
  const markStatus = async (planId, newStatus) => {
    const todayStr = localISODate(new Date());
    const tempId = `tmp_${planId}_${todayStr}`;

    // Optimistically update UI
    setPlans((prev) =>
      prev.map((p) =>
        String(p.id) === String(planId)
          ? {
              ...p,
              logs: [
                ...(p.logs || []).filter((l) => l.date !== todayStr),
                {
                  id: tempId,
                  supplement_id: planId,
                  date: todayStr,
                  status: newStatus,
                },
              ],
            }
          : p
      )
    );

    try {
      let existingLog = null;
      setPlans((prev) => {
        const plan = prev.find((p) => String(p.id) === String(planId));
        if (plan) {
          existingLog = (plan.logs || []).find(
            (l) => l.date === todayStr && !String(l.id).startsWith("tmp_")
          );
        }
        return prev;
      });

      if (existingLog) {
        await updateSupplementLog(existingLog.id, {
          status: newStatus,
          date: todayStr,
        });
      } else {
        const created = await createSupplementLog({
          supplement_id: planId,
          status: newStatus,
          date: todayStr,
        });

        // Replace temporary log with real log id
        setPlans((prev) =>
          prev.map((p) =>
            String(p.id) === String(planId)
              ? {
                  ...p,
                  logs: p.logs.map((l) =>
                    l.id === tempId
                      ? { ...l, id: created._id ?? created.id }
                      : l
                  ),
                }
              : p
          )
        );
      }

      // Force refresh to always match DB
      await refreshTodayLogs();
    } catch (err) {
      console.warn("Failed to persist supplement log:", err);
      CustomToast.error(
        "Failed to save Supplement Log",
        "Please try again soon."
      );

      // Rollback on failure
      setPlans((prev) =>
        prev.map((p) =>
          String(p.id) === String(planId)
            ? {
                ...p,
                logs: (p.logs || []).filter((l) => l.id !== tempId),
              }
            : p
        )
      );
    }
  };

  // Refresh today's logs after saving to keep UI in sync with DB
  async function refreshTodayLogs() {
    try {
      await loadSupplementsLogs();
    } catch (err) {
      console.warn("Failed to refresh supplement logs:", err);
    }
  }

  // Render a single card for today's supplement
  const renderTodayCard = ({ item }) => {
    const { plan, log } = item;
    const isTaken = log.status === "taken";
    const isSkipped = log.status === "skipped";

    return (
      <View
        style={[
          styles.todayCard,
          {
            backgroundColor: theme.textPrimary,
          },
        ]}
      >
        {/* Column 1: Plan info */}
        <View style={{ flex: 1 }}>
          <Text
            style={[
              styles.smallLabel,
              { color: theme.background, fontFamily: Font.semibold },
            ]}
          >
            Supplement Name
          </Text>
          <Text
            style={[
              styles.bigName,
              { color: theme.background, fontFamily: Font.bold },
            ]}
          >
            {plan.name || "—"}
          </Text>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.smallLabel,
                  { color: theme.background, fontFamily: Font.semibold },
                ]}
              >
                Dosage
              </Text>
              <Text
                style={[
                  styles.value,
                  { color: theme.background, fontFamily: Font.semibold },
                ]}
              >
                {plan.dosage || "—"}g
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.smallLabel,
                  { color: theme.background, fontFamily: Font.semibold },
                ]}
              >
                Time
              </Text>
              <Text
                style={[
                  styles.value,
                  { color: theme.background, fontFamily: Font.semibold },
                ]}
              >
                {plan.timeOfDay || "—"}
              </Text>
            </View>
          </View>
        </View>

        {/* Column 2: Status toggles */}
        <View style={styles.col2}>
          <Text
            style={[
              styles.smallLabel,
              {
                color: theme.background,
                textAlign: "center",
                fontFamily: Font.semibold,
              },
            ]}
          >
            Taken?
          </Text>
          <TouchableOpacity
            onPress={() => markStatus(plan.id, isTaken ? "scheduled" : "taken")}
            activeOpacity={0.8}
            style={[
              styles.squareToggle,
              {
                borderColor: isTaken ? theme.tint : theme.background,
                backgroundColor: isTaken ? theme.tint : "transparent",
              },
            ]}
          />
          <Text
            style={[
              styles.smallLabel,
              {
                color: theme.background,
                textAlign: "center",
                marginTop: 10,
                fontFamily: Font.semibold,
              },
            ]}
          >
            Skipped?
          </Text>
          <TouchableOpacity
            onPress={() =>
              markStatus(plan.id, isSkipped ? "scheduled" : "skipped")
            }
            activeOpacity={0.8}
            style={[
              styles.squareToggle,
              {
                borderColor: isSkipped
                  ? theme.error || "#D9534F"
                  : theme.background,
                backgroundColor: isSkipped
                  ? theme.error || "#D9534F"
                  : "transparent",
              },
            ]}
          />
        </View>
      </View>
    );
  };

  // Render a row in "All logs" view
  const renderPlanRow = ({ item }) => {
    const dosageTime = [item.dosage || "", item.timeOfDay || ""]
      .filter(Boolean)
      .join(", ");
    return (
      <View style={{ marginVertical: -5 }}>
        <ListCardItemGeneral
          item={{
            id: item.id ?? item._id,
            name: item.name,
            type: `${dosageTime || "—"}`,
          }}
          days={item.selectedDays}
          onEdit={() => startEditPlan(item)}
          onDelete={() => deletePlan(item.id ?? item._id)}
          onStart={null}
          showStart={false}
          labelName="Name"
          labelType="Dosage & Time"
          labelDays="Days to be taken"
        />
      </View>
    );
  };

  // Render screen
  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        {/* Add/Edit supplement modal */}
        <SupplementsInput
          visible={showInput}
          onCancel={closeInput}
          onSaveSupplement={saveSupplement}
          entryToEdit={planToEdit}
        />

        {/* Toggle buttons for Today / All logs */}
        {hasPlans && (
          <View
            style={[
              styles.segmentBar,
              { borderColor: theme.overlayLight ?? "#00000022" },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.segmentBtn,
                tab === "today" && { backgroundColor: theme.tint },
              ]}
              onPress={() => setTab("today")}
              activeOpacity={0.9}
            >
              <Text
                style={[
                  styles.segmentText,
                  {
                    color:
                      tab === "today" ? theme.textPrimary : theme.textSecondary,
                  },
                ]}
              >
                Today
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.segmentBtn,
                tab === "all" && { backgroundColor: theme.tint },
              ]}
              onPress={() => setTab("all")}
              activeOpacity={0.9}
            >
              <Text
                style={[
                  styles.segmentText,
                  {
                    color:
                      tab === "all" ? theme.textPrimary : theme.textSecondary,
                  },
                ]}
              >
                All logs
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Main content: Today's items or All logs */}
        {hasPlans ? (
          tab === "today" ? (
            hasToday ? (
              <FlatList
                data={todaysItems}
                keyExtractor={(it) => `today-${it.plan.id}`}
                renderItem={renderTodayCard}
                contentContainerStyle={{ paddingBottom: 8 }}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <Text
                style={{
                  textAlign: "center",
                  color: theme.textSecondary,
                  fontFamily: Font.semibold,
                  marginTop: 190,
                  fontSize: 24,
                }}
              >
                Nothing to take today!
              </Text>
            )
          ) : (
            <View style={[styles.invisibleBox, { maxHeight: BOX_MAX_HEIGHT }]}>
              <FlatList
                data={plans}
                keyExtractor={(item) => String(item.id)}
                renderItem={renderPlanRow}
                contentContainerStyle={[
                  styles.listContent,
                  { paddingBottom: NAV_BAR_HEIGHT + 120 },
                ]}
                showsVerticalScrollIndicator
              />
            </View>
          )
        ) : (
          // Empty state
          <View style={styles.fabContainerEmpty}>
            <Text
              style={[
                styles.emptyText,
                { color: theme.textPrimary, fontFamily: Font.semibold },
              ]}
            >
              Keep on top of your intake.
            </Text>
            <Fab
              floating={false}
              onPress={openAdd}
              color={theme.tint}
              iconColor={theme.textPrimary}
              accessibilityLabel="Create supplement"
            />
          </View>
        )}

        {/* Spacer for FAB and bottom nav */}
        <View style={{ height: NAV_BAR_HEIGHT + 28 }} />

        {/* Floating Add button */}
        {hasPlans && (
          <Fab
            onPress={openAdd}
            color={theme.tint}
            iconColor={theme.textPrimary}
            bottom={NAV_BAR_HEIGHT + 25}
            accessibilityLabel="Create supplement"
          />
        )}
      </View>

      {/* Bottom navigation */}
      <BottomNav />
    </View>
  );
}

export default LogSupplements;

/* ---------- helpers ---------- */

// Returns day index: Monday=0 … Sunday=6
function getMon0Sun6Index(d) {
  return (d.getDay() + 6) % 7;
}

// Normalize server response for supplements plan
function normalizePlanFromServer(p) {
  const serverId = String(p._id ?? p.id);
  return {
    ...p,
    _id: serverId,
    id: serverId,
    timeOfDay: p.timeOfDay ?? p.time ?? "",
    selectedDays: Array.isArray(p.selectedDays) ? p.selectedDays : [],
    logs: Array.isArray(p.logs) ? p.logs : [],
  };
}

// Format date to YYYY-MM-DD
function localISODate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Convert time string (hh:mm AM/PM) to total minutes
function timeToMinutes(str) {
  if (!str) return 10 ** 6;
  const ampm = str.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
  if (ampm) {
    let h = parseInt(ampm[1], 10);
    const m = parseInt(ampm[2], 10);
    const ap = ampm[3].toUpperCase();
    if (ap === "PM" && h < 12) h += 12;
    if (ap === "AM" && h === 12) h = 0;
    return h * 60 + m;
  }
  const hhmm = str.match(/^(\d{2}):(\d{2})$/);
  if (hhmm) return parseInt(hhmm[1], 10) * 60 + parseInt(hhmm[2], 10);
  return 10 ** 6;
}

// Weekday labels
const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

// Convert array of indices to readable day labels
function toDayLabels(indices = []) {
  if (!Array.isArray(indices)) return "";
  const uniq = [...new Set(indices)].filter((i) => i >= 0 && i <= 6);
  if (uniq.length === 7) return "Every day";
  return uniq
    .sort((a, b) => a - b)
    .map((i) => DAY_LABELS[i])
    .join(", ");
}

/* ---------- styles ---------- */
const styles = StyleSheet.create({
  screen: { flex: 1, paddingTop: 12 },
  content: { flex: 1, paddingHorizontal: 16 },
  segmentBar: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 10,
    overflow: "hidden",
    marginHorizontal: 4,
    marginBottom: 10,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentText: { fontFamily: Font.bold, fontSize: 14 },
  invisibleBox: { overflow: "hidden" },
  listContent: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  fabContainerEmpty: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 64,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    ...(Platform.OS === "android" ? { elevation: 10 } : {}),
  },
  emptyText: { fontSize: 24, margin: 20, textAlign: "center" },
  bottomNav: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    zIndex: 1000,
    ...(Platform.OS === "android" ? { elevation: 20 } : {}),
  },
  todayCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 4,
    marginBottom: 10,
    gap: 12,
  },
  row: { flexDirection: "row", gap: 16, marginTop: 10 },
  smallLabel: { fontSize: 12 },
  bigName: { fontSize: 18, marginTop: 2 },
  value: { fontSize: 16, marginTop: 2 },
  col2: { width: 90, alignItems: "center" },
  squareToggle: {
    width: 28,
    height: 28,
    borderWidth: 2,
    borderRadius: 20,
    marginTop: 6,
  },
});
