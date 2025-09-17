import React from 'react';
import { ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import AnalyticsLogScreen from '../../components/analytics/AnalyticsLogScreen';
import AnalyticsNutritionCard from '../../components/analytics/AnalyticsNutritionCard';
import { sampleEntries } from '../../components/common/SampleData';

export default function NutritionAnalyticsScreen() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handleDelete = (id) => {
    console.log('Delete nutrition entry:', id);
  };

  return (
    <AnalyticsLogScreen
      title="Nutrition Logs"
      subtitle="Your previous logs."
      onBackPress={handleBack}
    >
      <ScrollView 
        style={{ flex: 1, paddingHorizontal: 20 }} 
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {sampleEntries.nutritionEntries.map((entry, index) => (
          <AnalyticsNutritionCard
            key={entry.id || index}
            entry={entry}
            onDelete={handleDelete}
            showDeleteButton={false}
          />
        ))}
      </ScrollView>
    </AnalyticsLogScreen>
  );
}