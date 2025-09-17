import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Font } from '../../constants/Font';

export default function ThankYou() {
  const theme = Colors["dark"];
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Title */}
      <Text style={{ fontFamily: Font.extrabold, fontSize: 28, color: theme.tint, marginBottom: 20 }}>
        Thank you!
      </Text>

      {/* Subtitle */}
      <Text style={{ fontFamily: Font.semibold, fontSize: 20, color: theme.textPrimary, marginBottom: 60 }}>
        You're good to go!
      </Text>

      {/* Finish button */}
      <TouchableOpacity
        style={[styles.finishButton, { backgroundColor: theme.tint }]}
        onPress={() => router.replace('/home')}
      >
        <Text style={{ fontFamily: Font.bold, fontSize: 16, color: theme.background }}>
          Finish Setting Up
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center', // center vertically
    alignItems: 'center',     // center horizontally
    padding: 20,
  },
  finishButton: {
    width: '80%',
    paddingVertical: 16,
    borderRadius: 30, // pill-shaped button
    alignItems: 'center',
  },
});
