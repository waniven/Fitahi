import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import CustomButton from "../../components/common/CustomButton";
import CustomButtonThree from "../../components/common/CustomButtonThree";
import BottomNav from "../../components/navbar/BottomNav";
import CustomToast from "@/components/common/CustomToast";
import { Colors } from "../../constants/Colors";
import { Font, TextVariants } from "@/constants/Font";
import avatar1 from "../../assets/Avatar/Avatar1-02.png";
import avatar2 from "../../assets/Avatar/Avatar1-03.png";
import avatar3 from "../../assets/Avatar/Avatar1-04.png";
import { updateMe } from "@/services/userService";

/**
 * Avatar selection screen.
 * Allows users to choose an avatar and background color.
 * Saves selection to backend and returns to AccountSettings.
 */
export default function AvatarPage() {
  const router = useRouter();

  // Selected avatar ID
  const [selectedAvatar, setSelectedAvatar] = useState(null);

  // Selected background color
  const [selectedColor, setSelectedColor] = useState(null);

  // Available avatar images
  const avatars = [
    { id: 1, source: avatar1 },
    { id: 2, source: avatar2 },
    { id: 3, source: avatar3 },
  ];

  // Available background colors
  const backgroundColors = [
    "#EB4D4D", "#FC7B5E", "#E96812", "#EAC617", "#C2E81B",
    "#1CEA34", "#31D8AB", "#65ECD4", "#16DDE7", "#144CE7",
    "#FF73E3", "#D71B5A", "#FFFFFF", "#8035E2", "#E24EF6",
    "#007C7C", "#F5D7B3", "#CBA0FF",
  ];

  /**
   * Saves selected avatar and color to backend.
   * Navigates back to AccountSettings on success.
   */
  const handleSave = async () => {
    try {
      const selected = avatars.find(a => a.id === selectedAvatar);
      const assetUri = Image.resolveAssetSource(selected.source)?.uri;

      console.log("Avatar URI:", assetUri);

      // Save avatar image URI and background color
      await updateMe({ pfp: assetUri, avatarColor: selectedColor });

      CustomToast.success("Saved!");
      router.push("/profile/AccountSettings");
    } catch (err) {
      console.error("Avatar save error:", err);
      CustomToast.error("Failed to save avatar.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header row with back button, title, and spacer */}
      <View style={styles.headerRow}>
        <CustomButtonThree
          onPress={() => router.push("/profile/AccountSettings")}
          size={36}
        />
        <Text style={styles.header}>Choose Avatar</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Instructional subheader */}
      <Text style={styles.subHeader}>
        Click the avatar you feel best represents you
      </Text>

      {/* Scrollable content container */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Avatar selection row */}
        <View style={styles.avatarRow}>
          {avatars.map(({ id, source }) => (
            <TouchableOpacity
              key={id}
              onPress={() => setSelectedAvatar(id)}
              style={[
                styles.avatarWrapper,
                selectedAvatar === id && {
                  backgroundColor: selectedColor || "#333",
                },
                selectedAvatar === id && styles.avatarSelected,
              ]}
            >
              <Image
                source={source}
                style={styles.avatarImage}
                resizeMode="contain"
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Background color selection */}
        <Text style={[styles.subHeader, { marginTop: 30 }]}>
          Choose your favourite background color
        </Text>
        <View style={styles.colorGrid}>
          {backgroundColors.map(color => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorCircle,
                { backgroundColor: color },
                selectedColor === color && styles.colorSelected,
              ]}
              onPress={() => setSelectedColor(color)}
            />
          ))}
        </View>
      </ScrollView>

      {/* Save button */}
      <View style={styles.saveButtonWrapper}>
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom navigation bar */}
      <BottomNav />
    </SafeAreaView>
  );
}

// Stylesheet for AvatarPage
const styles = StyleSheet.create({
  // Main screen container
  container: {
    flex: 1,
    backgroundColor: "#151924",
  },

  // Header row layout
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  // Title text using Montserrat bold
  header: {
    ...TextVariants.h1,
    color: "#fff",
    textAlign: "center",
    flex: 1,
  },

  // Subheader text using Montserrat regular
  subHeader: {
    ...TextVariants.body,
    color: "#aaa",
    marginLeft: 20,
    marginTop: 30,
  },

  // Scroll container padding
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 140,
  },

  // Avatar selection row
  avatarRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 30,
    marginBottom: 30,
  },

  // Avatar wrapper with border and padding
  avatarWrapper: {
    borderRadius: 50,
    padding: 12,
    borderWidth: 2,
    borderColor: "transparent",
    backgroundColor: "#1e1e1e", // Default background
  },

  // Highlighted avatar border
  avatarSelected: {
    borderColor: Colors.primary || "#007AFF",
  },

  // Avatar image sizing
  avatarImage: {
    width: 60,
    height: 60,
  },

  // Grid of background color options
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginVertical: 10,
    alignSelf: "center",
    marginTop: 30,
  },

  // Individual color circle
  colorCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 6,
    borderWidth: 2,
    borderColor: "transparent",
  },

  // Highlighted color border
  colorSelected: {
    borderColor: "#fff",
    borderWidth: 2,
  },

  // Save button wrapper positioning
  saveButtonWrapper: {
    position: "absolute",
    bottom: 120,
    width: "100%",
    alignItems: "center",
  },

  // Save button styling
  saveButton: {
    backgroundColor: "#4DA6FF", // lighter blue
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    width: "90%",
    alignItems: "center",
    justifyContent: "center",
  },

  // Save button text using Montserrat semibold
  saveButtonText: {
    ...TextVariants.body,
    fontFamily: Font.semibold,
    color: "black",
    fontSize: 16,
  },
});

