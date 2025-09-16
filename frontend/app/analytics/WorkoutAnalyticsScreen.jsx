import React from 'react';
import { ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import AnalyticsLogScreen from '../../components/analytics/AnalyticsLogScreen';
import AnalyticsUniversalCard from '../../components/analytics/AnalyticsUniversalCard';
import { sampleEntries } from '../../components/common/SampleData';

export default function WorkoutAnalyticsScreen() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handleDelete = (id) => {
    console.log('Delete workout entry:', id);
  };

  return (
    <AnalyticsLogScreen
      title="Workout Logs"
      subtitle="Your previous logs."
      onBackPress={handleBack}
    >
      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {sampleEntries.workoutEntries.map((entry, index) => (
          <AnalyticsUniversalCard
            key={entry.id || index}
            entry={entry}
            type="workout"
            onDelete={handleDelete}
            showDeleteButton={false}
          />
        ))}
      </ScrollView>
    </AnalyticsLogScreen>
  );
}