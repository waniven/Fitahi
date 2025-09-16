// app/main/analytics.jsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { getAnalyticsData } from '../../components/common/SampleData';
import LogScreen from '../../components/common/LogScreen';
import AnalyticsDashboard from '../../components/analytics/AnalyticsDashboard';

/**
 * Analytics - Data visualization and progress tracking screen
 * Uses the reusable LogScreen component with analytics-specific configuration
 * Shows dashboard when entries exist from other features, otherwise shows initial log screen
 */
const Analytics = ({ navigation }) => { // Add navigation prop here
  const router = useRouter();
  const [showDashboard, setShowDashboard] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(getAnalyticsData());

  // Check for data on component mount
  useEffect(() => {
    const data = getAnalyticsData();
    setAnalyticsData(data);
    setShowDashboard(data.totalEntries >= 2);
  }, []);

  const handleBackPress = () => {
    if (showDashboard) {
      setShowDashboard(false);
    } else {
      router.back();
    }
  };

  const handleRefreshAnalytics = () => {
    // Refresh data from sample data
    const refreshedData = getAnalyticsData();
    setAnalyticsData(refreshedData);
    if (refreshedData.totalEntries >= 2) {
      setShowDashboard(true);
    }
  };

  // Show dashboard if we have 2+ entries and showDashboard is true
  if (showDashboard && analyticsData.totalEntries >= 2) {
    return (
      <AnalyticsDashboard
        navigation={navigation} // Pass navigation prop
        data={analyticsData}
        onBackPress={handleBackPress}
        onRefresh={handleRefreshAnalytics}
      />
    );
  }

  // Show initial log screen with message to make logs
  return (
    <LogScreen
      title="Your Analytics"
      subtitle="Make some logs and come back to get overviews!"
      showBackButton={true}
      showAddButton={false}
      onBackPress={handleBackPress}
      titleColor="#FFFFFF"
      subtitleColor="#CCCCCC"
    />
  );
};

export default Analytics;