import React, { useEffect, useState, useMemo } from "react";
import { ScrollView, View, StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";
import AnalyticsLogScreen from "@/components/analytics/AnalyticsLogScreen";
import AnalyticsUniversalCard from "@/components/analytics/AnalyticsUniversalCard";
import DateRangeFilter from "../../components/analytics/filters/DateRangeFilter";
import WaterAmountFilter from "../../components/analytics/filters/WaterAmountFilter";
import WaterSortFilter from "../../components/analytics/filters/WaterSortFilter";
import ClearFiltersButton from "../../components/analytics/filters/ClearFiltersButton";
import { getAllWater } from "@/services/waterServices";
import CustomToast from "@/components/common/CustomToast";
import {
  filterByDateRange,
  sortByDate,
  sortByNumericField,
} from "../../components/analytics/filters/DateUtils";

/**
 * WaterAnalyticsScreen
 * Screen that displays a scrollable, filterable list of water intake log entries.
 * Users can filter by date range, water amount, and sort by various criteria.
 */
export default function WaterAnalyticsScreen() {
  // Router for navigation
  const router = useRouter();

  // Stores all fetched water entries (unfiltered)
  const [waterEntries, setWaterEntries] = useState([]);

  // Loading state for fetch process
  const [loading, setLoading] = useState(true);

  // Filter states with default values
  const [dateRange, setDateRange] = useState("all");
  const [amountRange, setAmountRange] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");

  // Track which dropdown is currently open (only one at a time)
  const [openDropdown, setOpenDropdown] = useState(null);

  // Fetch water entries on component mount
  useEffect(() => {
    async function fetchWater() {
      try {
        const data = await getAllWater();
        setWaterEntries(data);
      } catch (err) {
        CustomToast.error("Could not load Water logs", "Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchWater();
  }, []);

  /**
   * Apply all filters and sorting to water entries
   * Uses useMemo to prevent unnecessary recalculations
   */
  const filteredAndSortedEntries = useMemo(() => {
    let result = [...waterEntries];

    // Step 1: Filter by date range
    result = filterByDateRange(result, dateRange, "time");

    // Step 2: Filter by amount range
    if (amountRange !== "all") {
      result = result.filter((entry) => {
        const amount = Number(entry.amount) || 0;
        switch (amountRange) {
          case "small":
            return amount < 500;
          case "medium":
            return amount >= 500 && amount <= 1000;
          case "large":
            return amount > 1000;
          default:
            return true;
        }
      });
    }

    // Step 3: Apply sorting
    if (sortBy.startsWith("date-")) {
      const order = sortBy.split("-")[1];
      result = sortByDate(result, order, "time");
    } else if (sortBy.startsWith("amount-")) {
      const order = sortBy.split("-")[1];
      result = sortByNumericField(result, "amount", order);
    }

    return result;
  }, [waterEntries, dateRange, amountRange, sortBy]);

  /**
   * Reset all filters to default values
   */
  const handleClearFilters = () => {
    setDateRange("all");
    setAmountRange("all");
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
      {/* Row 1: Date Range and Amount - Higher z-index */}
      <View style={[styles.filterRow, { zIndex: 200 }]}>
        <DateRangeFilter
          value={dateRange}
          onChange={setDateRange}
          isOpen={openDropdown === "dateRange"}
          onToggle={(isOpen) => handleDropdownToggle("dateRange", isOpen)}
        />
        <WaterAmountFilter
          value={amountRange}
          onChange={setAmountRange}
          isOpen={openDropdown === "amountRange"}
          onToggle={(isOpen) => handleDropdownToggle("amountRange", isOpen)}
        />
      </View>

      {/* Row 2: Sort By and Clear Filters - Lower z-index */}
      <View style={[styles.filterRow, { zIndex: 100 }]}>
        <WaterSortFilter
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
        title="Water Logs"
        subtitle="Loading..."
        onBackPress={handleBack}
      />
    );
  }

  // Show empty state if no entries exist in database
  if (waterEntries.length === 0) {
    return (
      <AnalyticsLogScreen
        title="Water Logs"
        subtitle="No water logs found."
        onBackPress={handleBack}
      />
    );
  }

  // Show filtered empty state if filters eliminate all results
  if (filteredAndSortedEntries.length === 0) {
    return (
      <AnalyticsLogScreen
        title="Water Logs"
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

  // Render filtered and sorted water entries
  return (
    <AnalyticsLogScreen
      title="Water Logs"
      subtitle="Your previous logs:"
      onBackPress={handleBack}
      filterComponent={renderFilters()}
    >
      {/* Scrollable container for all water cards */}
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
            type="water"
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