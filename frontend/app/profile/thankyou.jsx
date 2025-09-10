// thank you page after quiz is done



import React from 'react';
import { StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';

export default function ThankYou() {
  const theme = Colors["dark"];
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Title */}
      <Text style={[styles.title, { color: theme.tint }]}>Thank you!</Text>

      {/* Subtitle */}
      <Text style={[styles.subtitle, { color: theme.textPrimary }]}>
        You're good to go!
      </Text>

      {/* Finish button */}
      <TouchableOpacity
        style={[styles.finishButton, { backgroundColor: theme.tint }]}
        onPress={() => router.replace('/home')}
      >
        <Text style={[styles.finishText, { color: theme.background }]}>
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
    alignItems: 'center', // center horizontally
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 60, // space before button
    textAlign: 'center',
  },
  finishButton: {
    width: '80%',
    paddingVertical: 16,
    borderRadius: 30, // curvy pill shape button
    alignItems: 'center',
  },
  finishText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
