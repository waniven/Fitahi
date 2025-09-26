import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Font } from '../../constants/Font';

/**
 * Completion screen shown after successful quiz submission
 * Provides confirmation and navigation to the main application
 */
export default function ThankYou() {
  const theme = Colors["dark"];
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Success confirmation message */}
      <Text style={{ fontFamily: Font.extrabold, fontSize: 28, color: theme.tint, marginBottom: 20 }}>
        Thank you!
      </Text>

      {/* Ready-to-proceed message */}
      <Text style={{ fontFamily: Font.semibold, fontSize: 20, color: theme.textPrimary, marginBottom: 60 }}>
        You're good to go!
      </Text>

      {/* Navigation button to complete onboarding and enter main app */}
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  finishButton: {
    width: '80%',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
});