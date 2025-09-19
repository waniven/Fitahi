import React, {
  useEffect,
  useRef,
  useState,
  useLayoutEffect,
  useContext,
} from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Linking,
  useColorScheme,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import CustomButtonThree from "../../components/common/CustomButtonThree";
import { Colors } from "@/constants/Colors";
import { Font } from "@/constants/Font";
import { AIContext } from "../ai/AIContext";

const GOOGLE_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

// ShowGymsFinder helps user locate nearest gyms to their locations
export default function ShowGymsFinder({ navigation }) {
  const router = useRouter();
  const mapRef = useRef(null);
  const { toggleChat } = useContext(AIContext);

  const scheme = useColorScheme();
  const theme = Colors[scheme ?? "light"];

  const DEFAULT_REGION = {
    latitude: 40.7128,
    longitude: -74.006,
    latitudeDelta: 0.06,
    longitudeDelta: 0.06,
  };

  const [search, setSearch] = useState("");
  const [region, setRegion] = useState(DEFAULT_REGION);
  const [coords, setCoords] = useState(null); // { latitude, longitude }
  const [gyms, setGyms] = useState([]); // Places results
  const [loading, setLoading] = useState(false);
  const [selectedPlaceId, setSelectedPlaceId] = useState(null);

  // useLayoutEffect sets go back Home button and set styles of AI button
  useLayoutEffect(() => {
    const goBackOrHome = () => {
      if (navigation.canGoBack()) navigation.goBack();
      else router.replace("/home/index");
    };
    navigation.setOptions({
      headerLeft: () => (
        <CustomButtonThree onPress={() => navigation.goBack()} />
      ),
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

  // Ask permission + get user location on mount
  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        console.log(status);
        if (status !== "granted") return;
        // Faster initial fix: last known (may be null)
        const last = await Location.getLastKnownPositionAsync();
        const loc =
          last ||
          (await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          }));

        const { latitude, longitude } = loc.coords;
        setCoords({ latitude, longitude });

        const next = {
          latitude,
          longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        };
        setRegion(next);

        // Move the map right away (don’t wait for Places)
        if (mapRef.current) {
          mapRef.current.animateToRegion(next, 350);
        }
      } catch (e) {
        console.warn("Location error", e);
      }
    })();
  }, []);

  // Helpers for Google Places
  const nearbyUrl = ({ lat, lng }) =>
    `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&rankby=distance&type=gym&key=${GOOGLE_KEY}`;
  const textSearchUrl = (query, { lat, lng }) =>
    `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
      query
    )}+gym&location=${lat},${lng}&radius=5000&key=${GOOGLE_KEY}`;

  async function fetchGyms(url) {
    if (!GOOGLE_KEY) {
      console.warn("Google Maps API key is missing!");
      setGyms([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(url);
      const json = await res.json();
      if (json.status !== "OK" && json.status !== "ZERO_RESULTS") {
        console.warn("Places error:", json.status, json.error_message);
      }
      const results = Array.isArray(json.results) ? json.results : [];
      setGyms(results);
      // Fit markers
      if (results.length && mapRef.current) {
        const points = results
          .map((r) => r.geometry?.location)
          .filter(Boolean)
          .map((ll) => ({ latitude: ll.lat, longitude: ll.lng }));
        if (coords) points.push(coords);
        if (points.length > 0) {
          mapRef.current.fitToCoordinates(points, {
            edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
            animated: true,
          });
        }
      }
    } catch (e) {
      console.warn("fetchGyms error", e);
    } finally {
      setLoading(false);
    }
  }

  // onNearestPress is used to find nearest gyms
  const onNearestPress = () => {
    if (!coords || !GOOGLE_KEY) return;
    fetchGyms(nearbyUrl({ lat: coords.latitude, lng: coords.longitude }));
  };

  // onSearchPress is used to search for gyms
  const onSearchPress = () => {
    if (!coords || !search.trim() || !GOOGLE_KEY) return;
    fetchGyms(
      textSearchUrl(search.trim(), {
        lat: coords.latitude,
        lng: coords.longitude,
      })
    );
  };

  const onSelectPlace = (place) => {
    setSelectedPlaceId(place.place_id);
    const ll = place.geometry?.location;
    if (!ll || !mapRef.current) return;
    mapRef.current.animateToRegion(
      {
        latitude: ll.lat,
        longitude: ll.lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      300
    );
  };

  const openInMaps = (place) => {
    const ll = place.geometry?.location;
    if (!ll) return;
    const label = encodeURIComponent(place.name || "Gym");
    const latLng = `${ll.lat},${ll.lng}`;
    const url =
      Platform.select({
        ios: `maps:0,0?q=${label}@${latLng}`,
        android: `geo:0,0?q=${latLng}(${label})`,
      }) || `https://www.google.com/maps/search/?api=1&query=${latLng}`;
    Linking.openURL(url);
  };

  const renderRow = ({ item }) => {
    const ll = item.geometry?.location;
    const isSelected = selectedPlaceId === item.place_id;
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => onSelectPlace(item)}
        style={[
          styles.rowCard,
          {
            borderColor: isSelected ? theme.tint : "transparent",
            backgroundColor: theme.card,
          },
        ]}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={[
              styles.rowTitle,
              { color: theme.textPrimary, fontFamily: Font.bold },
            ]}
            numberOfLines={1}
          >
            {item.name || "Gym"}
          </Text>
          <Text
            style={[
              styles.rowSubtitle,
              { color: theme.textSecondary, fontFamily: Font.regular },
            ]}
            numberOfLines={2}
          >
            {item.vicinity || item.formatted_address || "—"}
          </Text>
          <Text
            style={[
              styles.metaLine,
              { color: theme.tint, fontFamily: Font.regular },
            ]}
          >
            {item.rating ? `⭐ ${item.rating}  ·  ` : ""}
            {item.opening_hours?.open_now != null
              ? item.opening_hours.open_now
                ? "Open now"
                : "Closed"
              : ""}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => openInMaps(item)}
          style={[styles.rowBtn, { backgroundColor: theme.tint }]}
        >
          <Text
            style={{
              color: theme.textPrimary,
              fontFamily: Font.semibold,
              fontWeight: "700",
            }}
          >
            Map
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  // auto “nearest gyms” when we get coords (optional)
  useEffect(() => {
    if (coords) onNearestPress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coords?.latitude, coords?.longitude]);

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      {/* Search bar */}
      <View
        style={[
          styles.searchBar,
          { borderColor: theme.tint, fontFamily: Font.semibold },
        ]}
      >
        <View
          style={[
            styles.inputWrap,
            {
              borderColor: theme.tint,
              backgroundColor: theme.inputBg,
              fontFamily: Font.regular,
            },
          ]}
        >
          <TextInput
            placeholder="Search gyms…"
            placeholderTextColor={theme.textSecondary}
            value={search}
            onChangeText={setSearch}
            style={[
              styles.input,
              { color: theme.textPrimary, fontFamily: Font.regular },
            ]}
            returnKeyType="search"
            onSubmitEditing={onSearchPress}
          />
          <TouchableOpacity
            onPress={onSearchPress}
            style={[styles.actionBtn, { backgroundColor: theme.tint }]}
          >
            <Text
              style={[
                styles.input,
                { fontFamily: Font.semibold, color: theme.textPrimary },
              ]}
            >
              Search
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={onNearestPress}
          style={[styles.nearestBtn, { borderColor: theme.tint }]}
        >
          <Text style={{ color: theme.tint, fontFamily: Font.semibold }}>
            Nearest gyms
          </Text>
        </TouchableOpacity>
      </View>

      {/* Map */}
      <View style={styles.mapWrap}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFillObject}
          initialRegion={DEFAULT_REGION} // uncontrolled instead of region={region}
          onRegionChangeComplete={(r) => setRegion(r)} // track region but don’t lock map
          showsUserLocation
          loadingEnabled
        >
          {gyms.map((g) => {
            const ll = g.geometry?.location;
            if (!ll) return null;
            return (
              <Marker
                key={g.place_id}
                coordinate={{ latitude: ll.lat, longitude: ll.lng }}
                title={g.name}
                description={g.vicinity || g.formatted_address || ""}
                onPress={() => setSelectedPlaceId(g.place_id)}
              />
            );
          })}
        </MapView>

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={theme.tint} />
          </View>
        )}
      </View>

      {/* Results list */}
      <View style={styles.listWrap}>
        <FlatList
          data={gyms}
          keyExtractor={(item) => item.place_id}
          renderItem={renderRow}
          contentContainerStyle={{ padding: 12, paddingBottom: 24 }}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          ListEmptyComponent={
            !loading ? (
              <Text
                style={{
                  color: theme.textSecondary,
                  textAlign: "center",
                  marginTop: 16,
                }}
              >
                {coords
                  ? "No gyms found."
                  : "Enable location to find nearby gyms."}
              </Text>
            ) : null
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },

  // Top search area
  searchBar: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 6,
    gap: 8,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    padding: 6,
    gap: 6,
  },
  input: { flex: 1, padding: 10, fontSize: 16 },
  actionBtn: {
    paddingHorizontal: 14,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  nearestBtn: {
    alignSelf: "flex-start",
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  // Map takes ~55% of screen height
  mapWrap: {
    height: "55%",
    borderRadius: 12,
    marginHorizontal: 12,
    overflow: "hidden",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
  },

  // List fills rest
  listWrap: {
    flex: 1,
  },

  // Row card
  rowCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1.5,
    gap: 10,
  },
  rowTitle: { fontSize: 16 },
  rowSubtitle: { fontSize: 13, marginTop: 2 },
  metaLine: { fontSize: 12, marginTop: 6 },
  rowBtn: {
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});
