import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Font, Type, TextVariants } from "@/constants/Font";

/**
 * Popup modal for selecting profile image source.
 * Appears centered on screen with a dimmed background.
 *
 * Props:
 * - onClose: function to close the popup
 * - onGallery: function to trigger gallery selection
 * - onAvatar: function to navigate to avatar selection
 */
export default function ProfileImagePopup({ onClose, onGallery, onAvatar }) {
  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        {/* Header row with centered title and floating close icon */}
        <View style={styles.headerWrapper}>
          <Text style={styles.title}>Profile</Text>
          <TouchableOpacity style={styles.closeAbsolute} onPress={onClose}>
            <Ionicons name="close" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Option buttons for Gallery and Avatar */}
        <View style={styles.options}>
          <TouchableOpacity style={styles.option} onPress={onGallery}>
            <Ionicons name="image" size={24} color="white" />
            <Text style={styles.optionText}>Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.option} onPress={onAvatar}>
            <Ionicons name="person-circle" size={24} color="white" />
            <Text style={styles.optionText}>Avatar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Full-screen dimmed background
  overlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 50,
  },

  // Centered popup card container
  card: {
    backgroundColor: "#2c2c2e", // soft dark grey
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 20,
    width: 280,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },

  // Header wrapper with centered title and absolute close icon
  headerWrapper: {
    position: "relative",
    width: "100%",
    alignItems: "center",
    marginBottom: 24,
  },

  // Title text using Montserrat bold variant
  title: {
    ...TextVariants.h2,
    color: "#ffffff",
  },

  // Close icon positioned top-right
  closeAbsolute: {
    position: "absolute",
    top: 0,
    right: 0,
    padding: 6,
  },

  // Row of option buttons
  options: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },

  // Individual option button with icon and label
  option: {
    alignItems: "center",
    marginHorizontal: 16,
  },

  // Label under icon using Montserrat regular variant
  optionText: {
    ...TextVariants.body,
    color: "#ffffff",
    marginTop: 6,
  },
});
