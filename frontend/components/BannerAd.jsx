import React, { useState } from "react";
import { StyleSheet, View, useColorScheme } from "react-native";
import { BannerAd, BannerAdSize, TestIds } from "react-native-google-mobile-ads";
import ModalCloseButton from "@/components/ModalCloseButton";
import { Colors } from "@/constants/Colors";

/**
 * ReminderBannerAd
 * - Compact banner card shown under reminders
 * - Uses Google TEST ad unit (safe for dev/university projects)
 * - Dismissible via an X button
 */
export default function ReminderBannerAd() {
  const [hidden, setHidden] = useState(false);
  const scheme = useColorScheme();
  const theme = Colors[scheme ?? "light"];

  // Don't render after user closes it
  if (hidden) return null;

  // ✅ Use Google's test banner ID in development
  // NOTE: Some versions only expose TestIds.BANNER (prefer that if ADAPTIVE_BANNER isn't available)
  const unitId = TestIds.ADAPTIVE_BANNER; // Always use Google test id in dev

  // Taller than standard banner; adjust to taste
  const size = BannerAdSize.LARGE_BANNER;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.textPrimary ?? "#121212",
          // optional shadow on iOS
          shadowColor: theme.background,
          shadowOpacity: 0.12,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 6 },
          // elevation on Android
          elevation: 3,
        },
      ]}
    >
      {/* Black X button */}
      <ModalCloseButton onPress={() => setHidden(true)} size={29} top={6} right={6} color={theme.background} />

      <View style={styles.adWrap}>
        <BannerAd
          unitId={unitId}
          size={size}
          requestOptions={{ requestNonPersonalizedAdsOnly: true }}
          onAdFailedToLoad={(e) => console.log("Banner failed:", e?.message)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: "center",
    width: "92%",        // make length a bit shorter than full width
    marginTop: 10,
    borderRadius: 16,    // rounded corners like your other cards
    paddingTop: 6,       // space for X button
    paddingBottom: 7,
    marginBottom: 15,
    overflow: "hidden",  // clip ad + background to rounded corners
  },
  adWrap: {
    minHeight: 100,      // matches LARGE_BANNER height visually
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
});