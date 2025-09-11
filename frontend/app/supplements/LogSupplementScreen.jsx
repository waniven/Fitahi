import { useState, useContext, useLayoutEffect, useMemo } from "react";
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
import SupplementsInput from "@/components/supplements/SupplementsInput";
import { Colors } from "@/constants/Colors";
import { Font } from "@/constants/Font";
import Fab from "@/components/FloatingActionButton";
import BackButton from "@/components/BackButton";
import { Ionicons } from "@expo/vector-icons";
import globalStyles from "@/styles/globalStyles";
import { AIContext } from "../ai/AIContext";
import { useRouter } from "expo-router";
import ListCardItemGeneral from "@/components/ListCardItemGeneral";
import SupplementsLog from "@/components/supplements/models/SupplementsLog";

function LogSupplements({ navigation }) {
  const scheme = useColorScheme();
  const theme = Colors[scheme ?? "light"];
  const { toggleChat } = useContext(AIContext);
  const router = useRouter();

  useLayoutEffect(() => {
    const goBackOrHome = () => {
      if (navigation.canGoBack()) navigation.goBack();
      else router.replace("/home/index");
    };
    navigation.setOptions({
      headerLeft: () => <BackButton onPress={goBackOrHome} />,
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

  // ---------------- state ----------------
  const [showInput, setShowInput] = useState(false);
  const [plans, setPlans] = useState([]); // SupplementsPlan[]
  const [planToEdit, setPlanToEdit] = useState(null);
  const [tab, setTab] = useState("today"); // <--- NEW: "today" | "all"

  const NAV_BAR_HEIGHT = 64;
  const BOX_MAX_HEIGHT = Math.round(Dimensions.get("window").height * 0.7);
  const isEmpty = plans.length === 0;

  // ---------------- modal handlers ----------------
  function openAdd() {
    setPlanToEdit(null);
    setShowInput(true);
  }
  function closeInput() {
    setPlanToEdit(null);
    setShowInput(false);
  }

  function saveSupplement(plan) {
    setPlans((curr) => {
      const idx = curr.findIndex((p) => String(p.id) === String(plan.id));
      if (idx >= 0) {
        const copy = [...curr];
        copy[idx] = plan;
        return copy;
      }
      return [...curr, plan];
    });
    closeInput();
  }

  function deletePlan(id) {
    setPlans((curr) => curr.filter((p) => p.id !== id));
  }
  function startEditPlan(item) {
    setPlanToEdit(item);
    setShowInput(true);
  }

  // ---------------- today's intake ----------------
  const todayStr = localISODate(new Date());
  const todayIdx = getMon0Sun6Index(new Date());

  const todaysItems = useMemo(() => {
    const list = [];
    for (const p of plans) {
      if (!Array.isArray(p.selectedDays)) continue;
      if (!p.selectedDays.includes(todayIdx)) continue;

      const logs = Array.isArray(p.logs) ? p.logs : [];
      let log = logs.find((l) => l?.date === todayStr);
      if (!log) {
        log = new SupplementsLog(
          `log_${p.id}_${todayStr}`,
          p.id,
          todayStr,
          "scheduled",
          null
        );
      }

      list.push({ plan: p, log, sortKey: timeToMinutes(p.timeOfDay) });
    }
    return list.sort((a, b) => a.sortKey - b.sortKey);
  }, [plans, todayIdx, todayStr]);

  const hasPlans = plans?.length > 0;
  const hasToday = (todaysItems?.length ?? 0) > 0;

  function markStatus(planId, status) {
    setPlans((prev) =>
      prev.map((plan) => {
        if (String(plan.id) !== String(planId)) return plan;
        const logs = Array.isArray(plan.logs) ? [...plan.logs] : [];
        const i = logs.findIndex((l) => l?.date === todayStr);

        const newLog = new SupplementsLog(
          i >= 0 ? logs[i].id : `log_${plan.id}_${todayStr}`,
          plan.id,
          todayStr,
          status,
          status === "taken" ? Date.now() : null
        );

        if (i >= 0) logs[i] = newLog;
        else logs.push(newLog);
        return { ...plan, logs };
      })
    );
  }

  // ---------------- render rows ----------------
  const renderTodayCard = ({ item }) => {
    const { plan, log } = item;
    const isTaken = log.status === "taken";
    const isSkipped = log.status === "skipped";

    return (
      <View
        style={[
          styles.todayCard,
          {
            backgroundColor: theme.textPrimary /* match ListCardItemGeneral */,
          },
        ]}
      >
        {/* Column 1 */}
        <View style={{ flex: 1 }}>
          <Text
            style={[
              styles.smallLabel,
              { color: theme.background, fontFamily: Font.semibold }, // text = theme.background
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

        {/* Column 2 */}
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

  const renderPlanRow = ({ item }) => {
    const dosageTime = [item.dosage || "", item.timeOfDay || ""]
      .filter(Boolean)
      .join(", ");
    const days = item.selectedDays || [];
    const daysLine = toDayLabels(days || []);

    return (
      <View style={{ marginVertical: -5 }}>
        <ListCardItemGeneral
          item={{
            id: item.id,
            name: item.name,
            type: `${dosageTime || "—"}`,
          }}
          days={item.selectedDays} // <-- pass days here
          onEdit={() => startEditPlan(item)}
          onDelete={() => deletePlan(item.id)}
          onStart={null}
          showStart={false}
          labelName="Name"
          labelType="Dosage & Time"
          labelDays="Days to be taken"
        />
      </View>
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        {/* Add/Edit Modal */}
        <SupplementsInput
          visible={showInput}
          onCancel={closeInput}
          onSaveSupplement={saveSupplement}
          entryToEdit={planToEdit}
        />

        {/* Top toggle buttons — only show after we have at least one plan */}
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

        {/* Content area */}
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
                  { paddingBottom: NAV_BAR_HEIGHT + 120 }, // Room for FAB + nav
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
              Keep on top of your intake (we will remind you)
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

        {/* Spacer so content doesn't collide with FAB/nav */}
        <View style={{ height: NAV_BAR_HEIGHT + 28 }} />

        {/* FAB */}
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

      {/* Bottom nav */}
      <View style={[styles.bottomNav, { backgroundColor: "#fff" }]}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/home/index")}
        >
          <Ionicons name="home-outline" size={26} color={theme.tint} />
          <Text style={[globalStyles.navText, { color: theme.tint }]}>
            Home
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/main/analytics")}
        >
          <Ionicons name="stats-chart-outline" size={26} color={theme.tint} />
          <Text style={[globalStyles.navText, { color: theme.tint }]}>
            Analytics
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.replace("/main/supplements")}
        >
          <Ionicons name="medkit-outline" size={26} color={theme.tint} />
          <Text style={[globalStyles.navText, { color: theme.tint }]}>
            Supplements
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/profile/AccountSettings")}
        >
          <Ionicons name="settings-outline" size={26} color={theme.tint} />
          <Text style={[globalStyles.navText, { color: theme.tint }]}>
            Settings
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default LogSupplements;

/* ---------- helpers ---------- */
function getMon0Sun6Index(d) {
  return (d.getDay() + 6) % 7;
}
function localISODate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
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

// Map 0..6 -> Mon..Sun labels
const DAY_LABELS = ["M", "T", "W", "Th", "F", "Sa", "Su"];

/**
 * Turn an array of weekday indices into a label string.
 * Examples:
 *   toDayLabels([0,2,4]) -> "M, W, F"
 *   toDayLabels([0,1,2,3,4,5,6]) -> "Every day"
 */
function toDayLabels(indices = []) {
  if (!Array.isArray(indices)) return "";
  // dedupe + keep only valid 0..6
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

  // segmented
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
  segmentText: {
    fontFamily: Font.bold,
    fontSize: 14,
  },

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
  navItem: { alignItems: "center" },

  // TODAY card (now matches ListCardItemGeneral background)
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
