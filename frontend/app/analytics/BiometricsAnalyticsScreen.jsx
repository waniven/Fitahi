import React, { useEffect, useState, useMemo } from "react";
import { ScrollView, View, StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";
import AnalyticsLogScreen from "../../components/analytics/AnalyticsLogScreen";
import AnalyticsUniversalCard from "../../components/analytics/AnalyticsUniversalCard";
import DateRangeFilter from "../../components/analytics/filters/DateRangeFilter";
import BMICategoryFilter from "../../components/analytics/filters/BMICategoryFilter";
import BiometricsSortFilter from "../../components/analytics/filters/BiometricsSortFilter";
import ClearFiltersButton from "../../components/analytics/filters/ClearFiltersButton";
import { getBiometrics } from "../../services/biometricService";
import CustomToast from "@/components/common/CustomToast";
import {
  filterByDateRange,
  sortByDate,
  sortByNumericField,
} from "../../components/analytics/filters/DateUtils";

/**
 * BiometricsAnalyticsScreen
 * Screen that displays a scrollable, filterable list of biometric log entries.
 * Users can filter by date range, BMI category, and sort by various criteria.
 */
export default function BiometricsAnalyticsScreen() {
  // Router for navigation
  const router = useRouter();

  // Stores all fetched biometric entries (unfiltered)
  const [biometricEntries, setBiometricEntries] = useState([]);

  // Loading state for fetch process
  const [loading, setLoading] = useState(true);

  // Filter states with default values
  const [dateRange, setDateRange] = useState("all");
  const [bmiCategory, setBmiCategory] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");

  // Track which dropdown is currently open (only one at a time)
  const [openDropdown, setOpenDropdown] = useState(null);

  // Fetch biometric entries on component mount
  useEffect(() => {
    async function fetchBiometrics() {
      try {
        const data = await getBiometrics();
        setBiometricEntries(data);
      } catch (err) {
        CustomToast.error("Could not load Biometric logs", "Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchBiometrics();
  }, []);

  /**
   * Calculate BMI from weight and height
   */
  const calculateBMI = (entry) => {
    if (entry?.bmi != null) {
      const bmi = typeof entry.bmi === "string" ? Number(entry.bmi) : entry.bmi;
      return Number.isFinite(bmi) ? bmi : null;
    }
    if (entry?.weight != null && entry?.height != null) {
      const weight = Number(entry.weight);
      const heightInMeters = Number(entry.height) / 100;
      if (!isNaN(weight) && !isNaN(heightInMeters) && heightInMeters > 0) {
        return weight / (heightInMeters * heightInMeters);
      }
    }
    return null;
  };

  /**
   * Get BMI category from BMI value
   */
  const getBMICategory = (bmi) => {
    if (bmi == null) return null;
    if (bmi < 18.5) return "underweight";
    if (bmi < 25) return "normal";
    if (bmi < 30) return "overweight";
    return "obese";
  };

  /**
   * Apply all filters and sorting to biometric entries
   * Uses useMemo to prevent unnecessary recalculations
   */
  const filteredAndSortedEntries = useMemo(() => {
    let result = [...biometricEntries];

    // Step 1: Filter by date range
    result = filterByDateRange(result, dateRange, "timestamp");

    // Step 2: Filter by BMI category
    if (bmiCategory !== "all") {
      result = result.filter((entry) => {
        const bmi = calculateBMI(entry);
        const category = getBMICategory(bmi);
        return category === bmiCategory;
      });
    }

    // Step 3: Apply sorting
    if (sortBy.startsWith("date-")) {
      const order = sortBy.split("-")[1];
      result = sortByDate(result, order, "timestamp");
    } else if (sortBy.startsWith("weight-")) {
      const order = sortBy.split("-")[1];
      result = sortByNumericField(result, "weight", order);
    } else if (sortBy.startsWith("bmi-")) {
      const order = sortBy.split("-")[1];
      // Sort by calculated BMI
      result = [...result].sort((a, b) => {
        const bmiA = calculateBMI(a) || 0;
        const bmiB = calculateBMI(b) || 0;
        return order === "asc" ? bmiA - bmiB : bmiB - bmiA;
      });
    }

    return result;
  }, [biometricEntries, dateRange, bmiCategory, sortBy]);

  /**
   * Reset all filters to default values
   */
  const handleClearFilters = () => {
    setDateRange("all");
    setBmiCategory("all");
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
   * Render filter controls UI
   * Displayed between subtitle and log entries
   */
  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      {/* Row 1: Date Range and BMI Category - Higher z-index */}
      <View style={[styles.filterRow, { zIndex: 200 }]}>
        <DateRangeFilter
          value={dateRange}
          onChange={setDateRange}
          isOpen={openDropdown === "dateRange"}
          onToggle={(isOpen) => handleDropdownToggle("dateRange", isOpen)}
        />
        <BMICategoryFilter
          value={bmiCategory}
          onChange={setBmiCategory}
          isOpen={openDropdown === "bmiCategory"}
          onToggle={(isOpen) => handleDropdownToggle("bmiCategory", isOpen)}
        />
      </View>

      {/* Row 2: Sort By and Clear Filters - Lower z-index */}
      <View style={[styles.filterRow, { zIndex: 100 }]}>
        <BiometricsSortFilter
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
        title="Biometrics Logs"
        subtitle="Loading..."
        onBackPress={handleBack}
      />
    );
  }

  // Show empty state if no entries exist in database
  if (biometricEntries.length === 0) {
    return (
      <AnalyticsLogScreen
        title="Biometrics Logs"
        subtitle="No biometrics logs found."
        onBackPress={handleBack}
      />
    );
  }

  // Show filtered empty state if filters eliminate all results
  if (filteredAndSortedEntries.length === 0) {
    return (
      <AnalyticsLogScreen
        title="Biometrics Logs"
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

  // Render filtered and sorted biometric entries
  return (
    <AnalyticsLogScreen
      title="Biometrics Logs"
      subtitle="Your previous logs:"
      onBackPress={handleBack}
      filterComponent={renderFilters()}
    >
      {/* Scrollable container for all biometric cards */}
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
            type="biometric"
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

  // Row containing two filter buttons side by side
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