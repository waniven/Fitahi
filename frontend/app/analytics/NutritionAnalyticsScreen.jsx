import React, { useEffect, useState, useMemo } from "react";
import { ScrollView, View, StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";
import AnalyticsLogScreen from "../../components/analytics/AnalyticsLogScreen";
import AnalyticsNutritionCard from "../../components/analytics/AnalyticsNutritionCard";
import DateRangeFilter from "../../components/analytics/filters/DateRangeFilter";
import MealTypeFilter from "../../components/analytics/filters/MealTypeFilter";
import SortFilter from "../../components/analytics/filters/SortFilter";
import ClearFiltersButton from "../../components/analytics/filters/ClearFiltersButton";
import { getAllNutrition } from "../../services/nutritionService";
import CustomToast from "@/components/common/CustomToast";
import {
  filterByDateRange,
  sortByDate,
  sortByNumericField,
  sortByStringField,
} from "../../components/analytics/filters/DateUtils";

/**
 * NutritionAnalyticsScreen
 * Screen that displays a scrollable, filterable list of nutrition log entries.
 * Users can filter by date range, meal type, and sort by various criteria.
 */
export default function NutritionAnalyticsScreen() {
  // Router for navigation
  const router = useRouter();

  // Stores all fetched nutrition entries (unfiltered)
  const [nutritionEntries, setNutritionEntries] = useState([]);

  // Loading state for fetch process
  const [loading, setLoading] = useState(true);

  // Filter states with default values
  const [dateRange, setDateRange] = useState("all"); // "all", "today", "yesterday", "last7days"
  const [mealType, setMealType] = useState("all"); // "all", "breakfast", "lunch", "dinner", "snack"
  const [sortBy, setSortBy] = useState("date-desc"); // "date-desc", "date-asc", "calories-desc", etc.

  // Track which dropdown is currently open (only one can be open at a time)
  const [openDropdown, setOpenDropdown] = useState(null); // null | "dateRange" | "mealType" | "sortBy"

  // Fetch nutrition entries on component mount
  useEffect(() => {
    async function fetchNutrition() {
      try {
        const data = await getAllNutrition();
        setNutritionEntries(data); // Save fetched data to state
      } catch (err) {
        CustomToast.error("Could not load Nutrition logs", "Please try again.");
      } finally {
        setLoading(false); // Stop loading state
      }
    }

    fetchNutrition();
  }, []);

  /**
   * Apply all filters and sorting to nutrition entries
   * Uses useMemo to prevent unnecessary recalculations
   */
  const filteredAndSortedEntries = useMemo(() => {
    let result = [...nutritionEntries];

    // Step 1: Filter by date range
    result = filterByDateRange(result, dateRange, "createdAt");

    // Step 2: Filter by meal type
    if (mealType !== "all") {
      result = result.filter(
        (entry) => entry.type?.toLowerCase() === mealType.toLowerCase()
      );
    }

    // Step 3: Apply sorting
    if (sortBy.startsWith("date-")) {
      const order = sortBy.split("-")[1]; // "asc" or "desc"
      result = sortByDate(result, order, "createdAt");
    } else if (sortBy.startsWith("calories-")) {
      const order = sortBy.split("-")[1]; // "asc" or "desc"
      result = sortByNumericField(result, "calories", order);
    } else if (sortBy.startsWith("name-")) {
      const order = sortBy.split("-")[1]; // "asc" or "desc"
      result = sortByStringField(result, "name", order);
    }

    return result;
  }, [nutritionEntries, dateRange, mealType, sortBy]);

  /**
   * Reset all filters to default values
   */
  const handleClearFilters = () => {
    setDateRange("all");
    setMealType("all");
    setSortBy("date-desc");
  };

  /**
   * Handle dropdown toggle - ensures only one dropdown is open at a time
   * @param {string} dropdownName - Name of the dropdown ("dateRange", "mealType", "sortBy")
   * @param {boolean} isOpen - Whether to open or close the dropdown
   */
  const handleDropdownToggle = (dropdownName, isOpen) => {
    if (isOpen) {
      // Open this dropdown and close others
      setOpenDropdown(dropdownName);
    } else {
      // Close the dropdown
      setOpenDropdown(null);
    }
  };

  /**
   * Navigate back to previous screen
   */
  const handleBack = () => router.back();

  /**
   * Render filter controls UI
   * Displayed between subtitle and log entries
   */
  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      {/* Row 1: Date Range and Meal Type - Higher z-index so dropdowns appear above row 2 */}
      <View style={[styles.filterRow, { zIndex: 200 }]}>
        <DateRangeFilter
          value={dateRange}
          onChange={setDateRange}
          isOpen={openDropdown === "dateRange"}
          onToggle={(isOpen) => handleDropdownToggle("dateRange", isOpen)}
        />
        <MealTypeFilter
          value={mealType}
          onChange={setMealType}
          isOpen={openDropdown === "mealType"}
          onToggle={(isOpen) => handleDropdownToggle("mealType", isOpen)}
        />
      </View>

      {/* Row 2: Sort By and Clear Filters - Lower z-index */}
      <View style={[styles.filterRow, { zIndex: 100 }]}>
        <SortFilter
          value={sortBy}
          onChange={setSortBy}
          isOpen={openDropdown === "sortBy"}
          onToggle={(isOpen) => handleDropdownToggle("sortBy", isOpen)}
        />
        <ClearFiltersButton onPress={handleClearFilters} />
      </View>
    </View>
  );

  // Show loading screen while fetching data
  if (loading) {
    return (
      <AnalyticsLogScreen
        title="Nutrition Logs"
        subtitle="Loading..."
        onBackPress={handleBack}
      />
    );
  }

  // Show empty state if no entries exist in database
  if (nutritionEntries.length === 0) {
    return (
      <AnalyticsLogScreen
        title="Nutrition Logs"
        subtitle="No nutrition logs found."
        onBackPress={handleBack}
      />
    );
  }

  // Show filtered empty state if filters eliminate all results
  if (filteredAndSortedEntries.length === 0) {
    return (
      <AnalyticsLogScreen
        title="Nutrition Logs"
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

  // Render filtered and sorted nutrition entries
  return (
    <AnalyticsLogScreen
      title="Nutrition Logs"
      subtitle="Your previous logs:"
      onBackPress={handleBack}
      filterComponent={renderFilters()}
    >
      {/* Scrollable container for all nutrition cards */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Map over filtered entries and render as cards */}
        {filteredAndSortedEntries.map((entry, index) => (
          <AnalyticsNutritionCard key={entry._id || index} entry={entry} />
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

  // Row containing two filter buttons side by side
  filterRow: {
    flexDirection: "row",
    gap: 10,
  },

  // ScrollView wrapper
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
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