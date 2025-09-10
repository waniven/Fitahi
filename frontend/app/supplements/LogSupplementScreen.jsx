import { useState, useContext, useLayoutEffect } from "react";
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

//LogSupplements allows user to fill out their supplement plan and log it
function LogSupplements({ navigation }) {
  const scheme = useColorScheme();
  const theme = Colors[scheme ?? "light"];
  const { toggleChat } = useContext(AIContext);
  const router = useRouter();

  // Header: back + AI button near title
  useLayoutEffect(() => {
    const goBackOrHome = () => {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        router.replace("/home/index"); // go back to home
      }
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
              backgroundColor: theme.tint,
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

  // Supplement state
  const [showInput, setShowInput] = useState(false);
  const [plans, setPlans] = useState([]); // array of SupplementsPlan 
  const [planToEdit, setPlanToEdit] = useState(null);

  const NAV_BAR_HEIGHT = 64;
  const BOX_MAX_HEIGHT = Math.round(Dimensions.get("window").height * 0.7);

  const isEmpty = plans.length === 0;

  // openAdd allows users to add supplement by popping up filling form
  function openAdd() {
    setPlanToEdit(null);
    setShowInput(true);
  }

  // closeInput allows users to close Supplement log form 
  function closeInput() {
    setPlanToEdit(null);
    setShowInput(false);
  }

  function saveSupplement(plan) {
    // Replace if editing; otherwise append
    setPlans((curr) => {
      const idx = curr.findIndex((p) => p.id === plan.id);
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

  // Render card for each supplement
  function renderItem({ item }) {
    const dayStr = toDayLabels(item.selectedDays);
    return (
      <View
        style={[
          styles.card,
          { backgroundColor: theme.backgroundAlt ?? "#0E1622" },
        ]}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: theme.textPrimary,
              fontFamily: Font.bold,
              fontSize: 16,
            }}
          >
            {item.name || "Supplement"}
          </Text>
          <Text
            style={{
              color: theme.textSecondary,
              fontFamily: Font.regular,
              marginTop: 2,
            }}
          >
            {item.dosage ? `Dosage: ${item.dosage}` : "Dosage: —"}
          </Text>
          <Text
            style={{
              color: theme.textSecondary,
              fontFamily: Font.regular,
              marginTop: 2,
            }}
          >
            {item.timeOfDay ? `Time: ${item.timeOfDay}` : "Time: —"}
          </Text>
          <Text
            style={{
              color: theme.textSecondary,
              fontFamily: Font.regular,
              marginTop: 2,
            }}
          >
            {dayStr ? `Days: ${dayStr}` : "Days: —"}
          </Text>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity
            onPress={() => startEditPlan(item)}
            style={styles.smallBtn}
          >
            <Text style={[styles.smallBtnText, { color: theme.tint }]}>
              Edit
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => deletePlan(item.id)}
            style={styles.smallBtn}
          >
            <Text
              style={[styles.smallBtnText, { color: theme.error || "#D9534F" }]}
            >
              Delete
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const TextFont = {
    color: theme.textPrimary,
    fontFamily: Font.semibold,
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        {/* Add / Edit modal */}
        <SupplementsInput
          visible={showInput}
          onCancel={closeInput}
          onSaveSupplement={saveSupplement}
          entryToEdit={planToEdit}
        />

        {/* List of supplements */}
        {!isEmpty && (
          <View style={[styles.invisibleBox, { maxHeight: BOX_MAX_HEIGHT }]}>
            <FlatList
              data={plans}
              keyExtractor={(item) => String(item.id)}
              renderItem={renderItem}
              contentContainerStyle={[
                styles.listContent,
                { paddingBottom: NAV_BAR_HEIGHT + 120 },
              ]}
              showsVerticalScrollIndicator
            />
          </View>
        )}

        {/* Spacer so content doesn't collide with FAB/nav */}
        <View style={{ height: NAV_BAR_HEIGHT + 28 }} />

        {/* No supplement log yet */}
        {isEmpty ? (
          <View style={styles.fabContainerEmpty}>
            <Text style={[styles.emptyText, TextFont]}>
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
        ) : (
          // FAB when list exists
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


function toDayLabels(indices = []) {
  const map = ["M", "T", "W", "Th", "F", "Sa", "Su"];
  return indices
    .slice()
    .sort((a, b) => a - b)
    .map((i) => map[i] ?? "")
    .filter(Boolean)
    .join(", ");
}


const styles = StyleSheet.create({
  screen: { flex: 1, paddingTop: 12 },
  content: { flex: 1, paddingHorizontal: 16 },

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
  emptyText: { fontSize: 24, margin: 20, textAlign: "center"},

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

  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 4,
    gap: 10,
  },
  cardActions: { justifyContent: "center", gap: 6 },
  smallBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "transparent",
  },
  smallBtnText: {
    fontFamily: Font.bold,
    fontSize: 14,
  },
});
