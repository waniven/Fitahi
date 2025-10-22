import React, { useState } from "react";
import { StyleSheet, View, useColorScheme } from "react-native";
import { BannerAd, BannerAdSize, TestIds } from "react-native-google-mobile-ads";
import ModalCloseButton from "@/components/ModalCloseButton";
import { Colors } from "@/constants/Colors";

export default function ReminderBannerAd() {
  const [hidden, setHidden] = useState(false);
  const scheme = useColorScheme();
  const theme = Colors[scheme ?? "light"];

  if (hidden) return null;

  const unitId = TestIds.ADAPTIVE_BANNER; // Always use Google test id in dev

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