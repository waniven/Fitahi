import React from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Type } from "@/constants/Font";

export default function CheckEmailModal({ onClose }) {
  return (
    //modal component creates a floating layer above the current screen
    <Modal
      transparent //makes background seethrough so overlay can show
      animationType="fade"
    >
      {/* Full-screen overlay with semi-transparent dark background */}
      <View style={styles.overlay}>
        {/* Centered box containing modal content */}
        <View style={styles.box}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={{ color: "white", fontSize: 18 }}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Check your email</Text>
          {/* Instructional message for the user */}
          <Text style={styles.message}>
            You should receive an email with instructions for resetting your
            password.
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  box: {
    backgroundColor: "#1A1A1A",
    padding: 25,
    borderRadius: 20,
    width: "80%",
    alignItems: "center",
  },
  closeBtn: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  title: {
    fontFamily: Type.bold.fontFamily,
    color: "#00A2FF",
    fontSize: 22,
    marginBottom: 10,
  },
  message: {
    fontFamily: Type.regular.fontFamily,
    color: "white",
    fontSize: 15,
    textAlign: "center",
  },
});
