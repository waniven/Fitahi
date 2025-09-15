//app/main/analytics.jsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import LogScreen from '../../components/common/LogScreen';
import AnalyticsDashboard from '../../components/analytics/AnalyticsDashboard';

/**
 * Analytics - Data visualization and progress tracking screen
 * Uses the reusable LogScreen component with analytics-specific configuration
 * Shows dashboard when entries exist from other features, otherwise shows initial log screen
 */
const Analytics = () => {
  const router = useRouter();
  const [showDashboard, setShowDashboard] = useState(false);
  const [analyticsData, setAnalyticsData] = useState({
    waterEntries: [],
    nutritionEntries: [],
    workoutEntries: [],
    supplementEntries: [],
    biometricEntries: [],
    totalEntries: 0
  });

  // Mock function to simulate getting data from other features
  // In real implementation, this would fetch from your app's state management or API
  const fetchAnalyticsData = () => {
    // This would be replaced with actual data fetching logic
    const mockData = {
      waterEntries: [], // Would come from water feature
      nutritionEntries: [], // Would come from nutrition feature
      workoutEntries: [], // Would come from workout feature
      supplementEntries: [], // Would come from supplement feature
      biometricEntries: [], // Would come from biometric feature
    };

    const totalEntries = Object.values(mockData).reduce((total, entries) => total + entries.length, 0);
    
    setAnalyticsData({
      ...mockData,
      totalEntries
    });

    // Show dashboard if we have 2 or more total entries
    setShowDashboard(totalEntries >= 2);
  };

  // Check for data on component mount
  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const handleBackPress = () => {
    if (showDashboard) {
      setShowDashboard(false);
    } else {
      router.back();
    }
  };

  const handleViewAnalytics = () => {
    // Refresh data and show dashboard if we have enough entries
    fetchAnalyticsData();
    if (analyticsData.totalEntries >= 2) {
      setShowDashboard(true);
    }
  };

  // Show dashboard if we have 2+ entries and showDashboard is true
  if (showDashboard && analyticsData.totalEntries >= 2) {
    return (
      <AnalyticsDashboard
        data={analyticsData}
        onBackPress={handleBackPress}
        onRefresh={fetchAnalyticsData}
      />
    );
  }

  // Show initial log screen with message to make logs
  return (
    <LogScreen
      title="Your Analytics"
      subtitle="Make some logs and come back to get overviews!"
      showBackButton={true}
      showAddButton={false} // No add button for analytics
      onBackPress={handleBackPress}
      titleColor="#FFFFFF"
      subtitleColor="#CCCCCC"
    />
  );
};

export default Analytics;
