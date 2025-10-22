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
import RatingFilter from "@/components/RatingFilter";
import NearestGymsButton from "@/components/NearestGymsButton";
import GymSearchBar from "@/components/GymSearchBar";
import GymListItem from "@/components/GymListItem";
import HoursFilter from "@/components/HoursFilter";
import ClearFiltersButton from "@/components/ClearFilter";

// Google Maps Places API key (injected via Expo env)
const GOOGLE_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

/* =======================================================================================
   Module-scope cache & helpers
   ======================================================================================= */

/**
 * In-memory cache of opening-hours "periods" for each place_id.
 * - Avoids refetching for every render/list change
 * - Populated after a nearby/text search returns results
 */

// ---- module-scope cache & helpers ----
const detailsCache = new Map();

/**
 * Fetch opening hours for a place using Google Places Details endpoint.
 * We request only 'opening_hours' (periods) to keep payloads small.
 */
async function fetchPlaceDetails(placeId, key) {
  if (detailsCache.has(placeId)) return detailsCache.get(placeId);
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=opening_hours&key=${key}`;
  const res = await fetch(url);
  const json = await res.json();
  const periods = json?.result?.opening_hours?.periods ?? null;
  detailsCache.set(placeId, periods);
  return periods;
}

/**
 * Simple concurrency-limited executor for promises.
 * Use this to fetch many place details without overloading the network/API.
 */
async function pAllLimited(tasks, limit = 3) {
  const out = [];
  let i = 0;
  async function worker() {
    while (i < tasks.length) {
      const idx = i++;
      out[idx] = await tasks[idx]();
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(limit, tasks.length) }, worker)
  );
  return out;
}

/** Convert a Date object (today) to minutes since midnight (0–1440). */
const toMinutes = (date) => date.getHours() * 60 + date.getMinutes();

/** Convert Places "HHmm" string (e.g., "0830") to minutes since midnight. */
function hhmmToMinutes(hhmm) {
  const h = parseInt(hhmm.slice(0, 2), 10);
  const m = parseInt(hhmm.slice(2, 4), 10);
  return h * 60 + m;
}

/**
 * Convert minutes since midnight to "h:mm AM/PM" for display.
 * Handles 24:00 by normalizing back into 0..1439 range.
 */
function minutesToLabel(m) {
  // normalize 24:00 -> 00:00 next day for display
  const total = m % (24 * 60);
  let h = Math.floor(total / 60);
  const min = total % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  let h12 = h % 12;
  if (h12 === 0) h12 = 12;
  const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
  return `${h12}:${pad(min)} ${ampm}`;
}

/**
 * Given stored "periods", produce a user-friendly "Open: .. · Close: .." string for today.
 * - Selects earliest open & latest close interval for the current day.
 */
function getTodayOpenCloseText(placeId) {
  const periods = detailsCache.get(placeId);
  if (!periods) return null; // not loaded yet

  const todayIdx = new Date().getDay(); // 0..6
  const intervals = buildDayIntervals(periods, todayIdx); // already merged
  if (!intervals.length) return "Hours: —";

  // Earliest open today and latest close today (merged)
  const first = intervals[0];
  const last = intervals[intervals.length - 1];

  const openLabel = minutesToLabel(first[0]);
  const closeLabel = minutesToLabel(last[1]); // handles 1440 etc

  return `Open: ${openLabel}  ·  Close: ${closeLabel}`;
}

/**
 * Build merged open intervals (in minutes) for a given weekday.
 * - Google "periods" can span midnight; we split/merge to get clean intervals per day
 * - Returns sorted, merged non-overlapping intervals: [[startMin, endMin], ...]
 */
function buildDayIntervals(periods, dayIndex) {
  if (!Array.isArray(periods)) return [];
  const todays = [];
  for (const p of periods) {
    if (!p.open?.time) continue;
    const openDay = p.open.day;
    const closeDay = p.close?.day ?? openDay; // close day may differ if spans midnight
    const openMin = hhmmToMinutes(p.open.time);
    // If no close time, interpret as closing at midnight (24:00) for display
    const closeMin = p.close?.time ? hhmmToMinutes(p.close.time) : 24 * 60;

    if (openDay === closeDay) {
      // Interval fully in the same day
      if (openDay === dayIndex) todays.push([openMin, closeMin]);
    } else {
      // Spans midnight: split into [open -> 24:00] for open day,
      // and [0 -> close] for the next day
      if (openDay === dayIndex) todays.push([openMin, 24 * 60]);
      const nextDay = (openDay + 1) % 7;
      if (nextDay === dayIndex) todays.push([0, closeMin]);
    }
  }
  // Sort by start time
  todays.sort((a, b) => a[0] - b[0]);
  const merged = [];
  for (const it of todays) {
    if (!merged.length || it[0] > merged[merged.length - 1][1]) {
      merged.push(it);
    } else {
      merged[merged.length - 1][1] = Math.max(
        merged[merged.length - 1][1],
        it[1]
      );
    }
  }
  return merged;
}

/**
 * Return true if a place is open at ANY time within the selected [selStart, selEnd] window.
 * - If window wraps past midnight (selEnd < selStart), we check today + next day segments.
 */
function isOpenDuringWindow(periods, selStart, selEnd, todayIndex) {
  const intervals = buildDayIntervals(periods, todayIndex);
  if (!intervals.length) return false;

  // Window wraps midnight: split into [selStart .. 24:00] today and [0 .. selEnd] next day
  if (selEnd < selStart) {
    const part1 = intervals.some(([a, b]) => !(b <= selStart || a >= 24 * 60));
    if (part1) return true;
    const tomorrowIntervals = buildDayIntervals(periods, (todayIndex + 1) % 7);
    return tomorrowIntervals.some(([a, b]) => !(b <= 0 || a >= selEnd));
  }

  // Simple overlap test with today's intervals
  return intervals.some(([a, b]) => !(b <= selStart || a >= selEnd));
}

export default function ShowGymsFinder({ navigation }) {
  const router = useRouter();
  const mapRef = useRef(null);
  const { toggleChat } = useContext(AIContext);
  const [selectedRating, setSelectedRating] = useState(null); // null = Any rating
  const [hours, setHours] = useState({ open: null, close: null });

  /**
   * "detailsVersion" is a bumping integer we increment after background
   * "opening_hours" fetches complete; forces recompute/re-render to show hours text.
   */
  const [detailsVersion, setDetailsVersion] = useState(0);

  // Theming
  const scheme = useColorScheme();
  const theme = Colors[scheme ?? "light"];

  // Default map region centered on AUCK
  const DEFAULT_REGION = {
    latitude: -36.8485,
    longitude: 174.7633,
    latitudeDelta: 0.06,
    longitudeDelta: 0.06,
  };

  // Search UI state
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState(DEFAULT_REGION);
  const [coords, setCoords] = useState(null);

  // Results & selection state
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlaceId, setSelectedPlaceId] = useState(null);

  /**
   * Header buttons (back + AI chat).
   * Using useLayoutEffect so the header updates immediately with the screen mount.
   */
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
  }, [navigation, theme, toggleChat, router]);

  /**
   * On mount: ask for foreground location permission & center map.
   * - Uses last known location if available; otherwise requests current position.
   */
  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") return;

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

        if (mapRef.current) {
          mapRef.current.animateToRegion(next, 350);
        }
      } catch (e) {
        console.warn("Location error", e);
      }
    })();
  }, []);

  const nearbyUrl = ({ lat, lng }) =>
    `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&rankby=distance&type=gym&key=${GOOGLE_KEY}`;
  const textSearchUrl = (query, { lat, lng }) =>
    `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
      query
    )}+gym&location=${lat},${lng}&radius=5000&key=${GOOGLE_KEY}`;

  /**
   * Fetch a list of gyms with a given Places endpoint (nearby/text).
   * - Populates "gyms"
   * - Kicks off background requests to fetch opening_hours for each place,
   *   then bumps "detailsVersion" so hour labels & filters update.
   * - Fits map viewport to results (plus user location when available).
   */
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

      // fetch opening hours in background, then bump detailsVersion
      pAllLimited(
        results.map((g) => () => fetchPlaceDetails(g.place_id, GOOGLE_KEY)),
        3
      )
        .catch(() => {})
        .finally(() => setDetailsVersion((v) => v + 1));

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

  /** Ensure numeric rating; treat missing as 0 for sorting/filtering. */
  const normRating = (r) => (typeof r === "number" ? r : parseFloat(r)) || 0;

  /**
   * Compute the list displayed in the FlatList:
   * - Apply rating threshold filter (if set)
   * - Apply hours window filter (if both open & close chosen and we have periods)
   * - Sort by rating ascending (you can flip to descending if desired)
   */
  const displayedGyms = React.useMemo(() => {
    let arr = gyms.slice();

    // Rating filter
    if (selectedRating != null) {
      arr = arr.filter((g) => normRating(g.rating) >= selectedRating);
    }

    // Hours window filter (only when user selected both start & end)
    const hasWindow = hours.open && hours.close;
    if (hasWindow) {
      const selStart = toMinutes(hours.open);
      const selEnd = toMinutes(hours.close);
      const todayIdx = new Date().getDay();

      arr = arr.filter((g) => {
        const periods = detailsCache.get(g.place_id);
        // If hours not yet fetched for this place, exclude it (strict) —
        // You can change to "true" here to include until loaded.
        if (!periods) return false; // or `true` if you want to include until loaded
        return isOpenDuringWindow(periods, selStart, selEnd, todayIdx);
      });
    }

    // Sort by rating (ascending). Change to (b - a) if you want highest first.
    arr.sort((a, b) => normRating(a.rating) - normRating(b.rating));
    return arr;
  }, [gyms, selectedRating, hours, detailsVersion]);

  /* ----------------------- UI handlers ----------------------- */

  /** Reset all filters and search text. */
  const onClearFilters = () => {
    setSelectedRating(null);
    setHours({ open: null, close: null });
    setSearch("");
    // optionally refetch nearest after clearing:
    // if (coords) fetchGyms(nearbyUrl({ lat: coords.latitude, lng: coords.longitude }));
  };

  /** Fetch nearest gyms based on current coords. */
  const onNearestPress = () => {
    if (!coords || !GOOGLE_KEY) return;
    fetchGyms(nearbyUrl({ lat: coords.latitude, lng: coords.longitude }));
  };

  /** Text search for "<query> gym" near current coords. */
  const onSearchPress = (query) => {
    const q = (query ?? search).trim();
    if (!coords || !q || !GOOGLE_KEY) return;
    fetchGyms(
      textSearchUrl(q, { lat: coords.latitude, lng: coords.longitude })
    );
  };

  /** Select a list item & pan/zoom map to it. */
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

  /** Open the selected place in Apple/Google Maps (platform-specific). */
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

  /**
   * Render a row for FlatList:
   * - Computes displayable "Open/Close" text from cached periods (if available)
   * - Passes theme/fonts + click handlers into GymListItem
   */
  const renderRow = React.useCallback(
    ({ item }) => {
      const isSelected = selectedPlaceId === item.place_id;
      const hoursText = getTodayOpenCloseText(item.place_id); // 👈 new

      return (
        <GymListItem
          item={item}
          selected={isSelected}
          onPress={() => onSelectPlace(item)}
          onOpenMaps={() => openInMaps(item)}
          hoursText={hoursText} // 👈 new
          colors={{
            textPrimary: theme.textPrimary,
            textSecondary: theme.textSecondary,
            tint: theme.tint,
            card: theme.card,
          }}
          font={{
            regular: Font.regular,
            semibold: Font.semibold,
            bold: Font.bold,
          }}
        />
      );
    },
    [selectedPlaceId, theme, detailsVersion] // include detailsVersion
  );

  /**
   * On first successful location retrieval, auto-run "Nearest" to populate list.
   */
  useEffect(() => {
    if (coords) onNearestPress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coords?.latitude, coords?.longitude]);

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <View
        style={[
          styles.searchBar,
          { borderColor: theme.tint, backgroundColor: theme.background },
        ]}
      >
        <GymSearchBar
          value={search}
          onChangeText={setSearch}
          onSearch={onSearchPress}
        />

        {/* Row 1: Rating + Nearest */}
        <View style={styles.filtersRow}>
          <View style={{ flex: 1 }}>
            <RatingFilter
              value={selectedRating}
              onChange={setSelectedRating}
              themeColors={{
                tint: theme.tint,
                textPrimary: theme.textPrimary,
                card: theme.card,
              }}
              font={{
                regular: Font.regular,
                semibold: Font.semibold,
                bold: Font.bold,
              }}
            />
          </View>
          <NearestGymsButton
            onPress={onNearestPress}
            tint={theme.tint}
            textColor={theme.textPrimary}
            font={{ semibold: Font.semibold }}
          />
        </View>

        {/* Row 2: Hours + Clear */}
        <View style={styles.filtersRow}>
          <View style={{ flex: 1, marginRight: 0 }}>
            <HoursFilter value={hours} onChange={setHours} />
          </View>
          <View style={{ flex: 1 }}>
            <ClearFiltersButton
              onPress={onClearFilters}
              style={{ height: 40 }}
            />
          </View>
        </View>
      </View>

      <View style={styles.mapWrap}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFillObject}
          initialRegion={DEFAULT_REGION}
          onRegionChangeComplete={(r) => setRegion(r)}
          showsUserLocation
          loadingEnabled
        >
          {displayedGyms.map((g) => {
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

      <View style={styles.listWrap}>
        <FlatList
          data={displayedGyms}
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

  filtersRow: {
    flexDirection: "row",
    alignItems: "center",
    alignItems: "stretch",
    gap: 8,
  },

  searchBar: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 6,
    gap: 8,
    position: "relative",
    zIndex: 10,
    overflow: "visible",
    ...(Platform.OS === "android" ? { elevation: 2 } : {}),
    marginBottom: 10,
    backgroundColor: "#0000", // will be overridden below
  },

  mapWrap: {
    height: "45%",
    borderRadius: 12,
    marginHorizontal: 12,
    overflow: "hidden",
    zIndex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
  },

  listWrap: {
    flex: 1,
  },
});
