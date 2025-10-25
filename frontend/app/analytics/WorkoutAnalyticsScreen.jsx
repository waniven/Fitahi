import React, { useEffect, useState, useMemo } from "react";
import { ScrollView, View, StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";
import AnalyticsLogScreen from "../../components/analytics/AnalyticsLogScreen";
import AnalyticsUniversalCard from "../../components/analytics/AnalyticsUniversalCard";
import DateRangeFilter from "../../components/analytics/filters/DateRangeFilter";
import WorkoutSortFilter from "../../components/analytics/filters/WorkoutSortFilter";
import ClearFiltersButton from "../../components/analytics/filters/ClearFiltersButton";
import { getWorkoutResults } from "../../services/workoutResultService";
import CustomToast from "@/components/common/CustomToast";
import {
  filterByDateRange,
  sortByDate,
  sortByNumericField,
} from "../../components/analytics/filters/DateUtils";

/**
 * WorkoutAnalyticsScreen
 * Screen that displays a scrollable, filterable list of workout log entries.
 * Users can filter by date range and sort by date or duration.
 */
export default function WorkoutAnalyticsScreen() {
  // Router for navigation
  const router = useRouter();

  // Stores all fetched workout entries (unfiltered)
  const [workoutEntries, setWorkoutEntries] = useState([]);

  // Loading state for fetch process
  const [loading, setLoading] = useState(true);

  // Filter states with default values
  const [dateRange, setDateRange] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");

  // Track which dropdown is currently open (only one at a time)
  const [openDropdown, setOpenDropdown] = useState(null);

  // Fetch workout entries on component mount
  useEffect(() => {
    async function fetchWorkouts() {
      try {
        const data = await getWorkoutResults();
        setWorkoutEntries(data);
      } catch (err) {
        CustomToast.error("Could not load Workout logs", "Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchWorkouts();
  }, []);

  /**
   * Apply all filters and sorting to workout entries
   * Uses useMemo to prevent unnecessary recalculations
   */
  const filteredAndSortedEntries = useMemo(() => {
    let result = [...workoutEntries];

    // Step 1: Filter by date range
    result = filterByDateRange(result, dateRange, "dateCompleted");

    // Step 2: Apply sorting
    if (sortBy.startsWith("date-")) {
      const order = sortBy.split("-")[1];
      result = sortByDate(result, order, "dateCompleted");
    } else if (sortBy.startsWith("duration-")) {
      const order = sortBy.split("-")[1];
      result = sortByNumericField(result, "totalTimeSpent", order);
    }

    return result;
  }, [workoutEntries, dateRange, sortBy]);

  /**
   * Reset all filters to default values
   */
  const handleClearFilters = () => {
    setDateRange("all");
    setSortBy("date-desc");
  };

  /**
   * Handle dropdown toggle - ensures only one dropdown is open at a time
   */
  const handleDropdownToggle = (dropdownName, isOpen) => {
    if (isOpen) {
      setOpenDropdown(dropdownName);
    } else {
      setOpenDropdown(null);
    }
  };

  /**
   * Navigate back to previous screen
   */
  const handleBack = () => router.back();

  /**
   * Handler for pressing a specific workout entry
   */
  const handleWorkoutPress = (workoutEntry) => {
    router.push({
      pathname: "/analytics/WorkoutResult",
      params: {
        workoutData: JSON.stringify(workoutEntry),
        returnTo: "analytics",
      },
    });
  };

  /**
   * Render filter controls UI
   * Displayed between subtitle and log entries
   */
  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      {/* Row 1: Date Range and Sort By - Higher z-index */}
      <View style={[styles.filterRow, { zIndex: 200 }]}>
        <DateRangeFilter
          value={dateRange}
          onChange={setDateRange}
          isOpen={openDropdown === "dateRange"}
          onToggle={(isOpen) => handleDropdownToggle("dateRange", isOpen)}
        />
        <WorkoutSortFilter
          value={sortBy}
          onChange={setSortBy}
          isOpen={openDropdown === "sortBy"}
          onToggle={(isOpen) => handleDropdownToggle("sortBy", isOpen)}
        />
      </View>

      {/* Row 2: Clear Filters - Lower z-index */}
      <View style={[styles.filterRow, { zIndex: 100 }]}>
        <ClearFiltersButton onPress={handleClearFilters} />
      </View>
    </View>
  );

  // Show loading screen while fetching data
  if (loading) {
    return (
      <AnalyticsLogScreen
        title="Workout Logs"
        subtitle="Loading..."
        onBackPress={handleBack}
      />
    );
  }

  // Show empty state if no entries exist in database
  if (workoutEntries.length === 0) {
    return (
      <AnalyticsLogScreen
        title="Workout Logs"
        subtitle="No workout logs found."
        onBackPress={handleBack}
      />
    );
  }

  // Show filtered empty state if filters eliminate all results
  if (filteredAndSortedEntries.length === 0) {
    return (
      <AnalyticsLogScreen
        title="Workout Logs"
        subtitle="Your previous logs:"
        onBackPress={handleBack}
        filterComponent={renderFilters()}
      >
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            No logs match your current filters.
          </Text>
          <Text style={styles.emptySubtext}>
            Try adjusting your filters or clear them to see all logs.
          </Text>
        </View>
      </AnalyticsLogScreen>
    );
  }

  // Render filtered and sorted workout entries
  return (
    <AnalyticsLogScreen
      title="Workout Logs"
      subtitle="Your previous logs:"
      onBackPress={handleBack}
      filterComponent={renderFilters()}
    >
      {/* Scrollable container for all workout cards */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Map over filtered entries and render as cards */}
        {filteredAndSortedEntries.map((entry, index) => (
          <AnalyticsUniversalCard
            key={entry._id || index}
            entry={entry}
            type="workout"
            onPress={handleWorkoutPress}
          />
        ))}
      </ScrollView>
    </AnalyticsLogScreen>
  );
}

const styles = StyleSheet.create({
  // Container for all filter buttons
  filtersContainer: {
    gap: 10,
    marginBottom: 10,
  },

  // Row containing filter buttons
  filterRow: {
    flexDirection: "row",
    gap: 10,
  },

  // ScrollView wrapper
  scrollView: {
    flex: 1,
  },

  // ScrollView content padding
  scrollContent: {
    paddingBottom: 20,
  },

  // Empty state container
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingTop: 60,
  },

  // Empty state main text
  emptyText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    marginBottom: 8,
  },

  // Empty state subtext
  emptySubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
});