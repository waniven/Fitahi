// app/main/water.jsx
import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import LogScreen from '../../components/common/LogScreen';
import WaterEntryModal from '../../components/water/WaterEntryModal';
import WaterDashboard from '../../components/water/WaterDashboard';
import CustomToast from '../../components/common/CustomToast';
import { sampleEntries } from '../../components/common/SampleData';
import { getWater, postWater, deleteWater } from '@/services/waterServices';


/**
 * Water - Water intake logging screen
 * Uses the reusable LogScreen component with water-specific configuration
 * Shows dashboard when entries exist, otherwise shows initial log screen
 */

//helper to save time to date
const timeToDate = (hhmm) => {
  const m = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(String(hhmm).trim());
  const d = new Date();
  if (!m) return d.toISOString(); //fallback to now if invalid
  const h = Number(m[1]);
  const min = Number(m[2]);
  d.setSeconds(0, 0);
  d.setHours(h, min, 0, 0); 
  return d.toISOString();
};

//helper to turn date into time "7:55pm"
const dateToTime = (ts) => {
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return '';
  let h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  const ampm = h >= 12 ? 'pm' : 'am';
  h = h % 12 || 12;
  return `${h}:${m}${ampm}`;
};

//normlise data from api for components
const normalizeDataFromApi = (doc) => {
  const ts = doc.timestamp ?? doc.time ?? new Date().toISOString();
  const id = doc.id ?? doc._id ?? String(ts);
  const amount = Number(doc.amount ?? 0);

  return {
    id,
    amount,
    timestamp: ts,
    time: dateToTime(ts)
  };
};

const Water = () => {
  const router = useRouter();
  
  const [waterEntries, setWaterEntries] = useState(sampleEntries.waterEntries);
  const [modalVisible, setModalVisible] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const dailyGoal = 2000; //should be read from api 

  //back button logic
  const handleBackPress = () => {
    if (showDashboard) {
      setShowDashboard(false);
    } else {
      router.back();
    }
  };


  const handleAddWater = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  //load from api on mount
  useEffect (() => {
    let mounted = true;

    const loadWater = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await getWater();
        const rows = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        const normalized = rows.map(normalizeDataFromApi);

        if (!mounted) {
          return;
        }

        setWaterEntries(normalized);
        setShowDashboard(normalized.length > 0);
      } catch (err) {
        if (!mounted){
          return;
        }
        CustomToast.error('Error loading water logs');
        console.warn('GET /water failed', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadWater();
    return() => { mounted = false; };
  }, []);

  const handleSaveWaterEntry = async (newEntry) => {
    try {
      const entryToSave = {
        amount: Number(newEntry.amount),
        time: timeToDate(newEntry.time)
      };

      const saved = await postWater(entryToSave);
      const normalized = normalizeDataFromApi(saved);

      setWaterEntries(prev => [...prev, normalized]);
      // Navigate to dashboard after adding entry
      setShowDashboard(true);
      CustomToast.waterSaved(parseFloat(entryToSave.amount));
    } catch (err) {
      console.warn('New water log save failed:', err);
      CustomToast.error('Could not save water entry');
    } finally {
      setModalVisible(false);
    }
  };

  const handleDeleteEntry = async (entryId) => {
  const toDelete = waterEntries.find(e => e.id === entryId);
  const deletedAmount = toDelete ? Number(toDelete.amount) : undefined;

    try {
      await deleteWater (entryId);

      //update local array after deletion
      setWaterEntries(prevEntries => {
        const newEntries = prevEntries.filter(entry => entry.id !== entryId);
        console.log('New entries after delete:', newEntries);
        
        // Check if no entries remain and update dashboard state
        if (newEntries.length === 0) {
          console.log('No entries remaining, returning to base screen');
          setTimeout(() => setShowDashboard(false), 100);
        }
        
        return newEntries;
      });

      CustomToast.waterDeleted(deletedAmount);
    } catch (err) {
      console.warn('Delete failed:', err);
      CustomToast.error('Could not delete water log');
    }
  };

  // Show dashboard if we have entries and showDashboard is true
  if (showDashboard && waterEntries.length > 0) {
    return (
      <>
        <WaterDashboard
          entries={waterEntries}
          onDeleteEntry={handleDeleteEntry}
          onAddEntry={handleAddWater}
          onBackPress={handleBackPress}
          dailyGoal={2000}
        />
        
        <WaterEntryModal
          visible={modalVisible}
          onClose={handleCloseModal}
          onSave={handleSaveWaterEntry}
        />
      </>
    );
  }

  // Show initial log screen
  return (
    <>
      <LogScreen
        title="Water Log"
        subtitle="Log your water intake"
        showBackButton={true}
        showAddButton={true}
        onBackPress={handleBackPress}
        onAddPress={handleAddWater}
      />
      
      <WaterEntryModal
        visible={modalVisible}
        onClose={handleCloseModal}
        onSave={handleSaveWaterEntry}
      />
    </>
  );
};

export default Water;