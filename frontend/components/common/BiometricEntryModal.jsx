// components/common/BiometricEntryModal.jsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Alert,
  TouchableOpacity,
  TextInput,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import CustomButton from './CustomButton';

/**
 * BiometricEntryModal - Modal for entering height and weight data
 * Simplified version without animations to avoid render loops
 */
export default function BiometricEntryModal({ visible, onClose, onSave }) {
  const [heightValue, setHeightValue] = useState('');
  const [weightValue, setWeightValue] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  /**
   * Validates height input with reasonable human height ranges
   */
  const validateHeightInput = (value) => {
    const heightNumber = parseFloat(value);
    if (!value) return 'Height is required';
    if (isNaN(heightNumber)) return 'Please enter a valid number';
    if (heightNumber < 100 || heightNumber > 250) return 'Height should be between 100-250 cm';
    return null;
  };

  /**
   * Validates weight input with reasonable human weight ranges
   */
  const validateWeightInput = (value) => {
    const weightNumber = parseFloat(value);
    if (!value) return 'Weight is required';
    if (isNaN(weightNumber)) return 'Please enter a valid number';
    if (weightNumber < 30 || weightNumber > 300) return 'Weight should be between 30-300 kg';
    return null;
  };

  /**
   * Handles modal close with confirmation if user has entered data
   */
  const requestCloseConfirmation = () => {
    if (heightValue.trim() || weightValue.trim()) {
      Alert.alert(
        'Are you sure you want to exit?',
        'Your entered data will be lost.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Exit', 
            style: 'destructive',
            onPress: () => closeModal()
          }
        ]
      );
    } else {
      closeModal();
    }
  };

  /**
   * Closes modal and resets form state
   */
  const closeModal = () => {
    setHeightValue('');
    setWeightValue('');
    setValidationErrors({});
    onClose();
  };

  /**
   * Validates and submits biometric entry data
   */
  const submitBiometricEntry = () => {
    const heightError = validateHeightInput(heightValue);
    const weightError = validateWeightInput(weightValue);
    
    const currentValidationErrors = {};
    if (heightError) currentValidationErrors.height = heightError;
    if (weightError) currentValidationErrors.weight = weightError;
    
    setValidationErrors(currentValidationErrors);
    
    if (Object.keys(currentValidationErrors).length === 0) {
      const newBiometricEntry = {
        id: Date.now().toString(),
        height: parseFloat(heightValue),
        weight: parseFloat(weightValue),
        timestamp: new Date().toISOString(),
      };
      
      if (onSave) {
        onSave(newBiometricEntry);
      }
      
      Alert.alert('Success', 'Biometric entry added successfully!');
      closeModal();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={requestCloseConfirmation}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {/* Modal header with title and close button */}
          <View style={styles.modalHeaderSection}>
            <Text style={styles.modalTitleText}>Add Entry</Text>
            <TouchableOpacity onPress={requestCloseConfirmation} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="#666" />
            </TouchableOpacity>
          </View>

          <Text style={styles.modalSubtitleText}>
            How is your progress today?
          </Text>

          {/* Height input section */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>HEIGHT (cm) *</Text>
            <View style={[styles.inputContainer, validationErrors.height && styles.inputError]}>
              <TextInput
                style={styles.textInput}
                placeholder="Height"
                placeholderTextColor="#999"
                value={heightValue}
                onChangeText={setHeightValue}
                keyboardType="default"
                returnKeyType="done"
              />
            </View>
            {validationErrors.height && (
              <Text style={styles.errorText}>{validationErrors.height}</Text>
            )}
          </View>

          {/* Weight input section */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>WEIGHT (kg) *</Text>
            <View style={[styles.inputContainer, validationErrors.weight && styles.inputError]}>
              <TextInput
                style={styles.textInput}
                placeholder="Weight"
                placeholderTextColor="#999"
                value={weightValue}
                onChangeText={setWeightValue}
                keyboardType="default"
                returnKeyType="done"
              />
            </View>
            {validationErrors.weight && (
              <Text style={styles.errorText}>{validationErrors.weight}</Text>
            )}
          </View>

          {/* Submit button at bottom */}
          <View style={styles.submitButtonSection}>
            <CustomButton
              title="Add Entry"
              onPress={submitBiometricEntry}
              variant="primary"
              size="large"
              style={styles.addEntryButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  
  modalContent: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
    marginTop: 50,
  },
  
  modalHeaderSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  
  modalTitleText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'Montserrat_700Bold',
  },

  closeButton: {
    padding: 4,
  },
  
  modalSubtitleText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    fontFamily: 'Montserrat_400Regular',
  },

  inputSection: {
    marginBottom: 32,
  },

  inputLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
    fontFamily: 'Montserrat_700Bold',
  },

  inputContainer: {
    backgroundColor: '#E4F8FF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: 'transparent',
  },

  textInput: {
    fontSize: 16,
    color: '#000',
    fontFamily: 'Montserrat_400Regular',
    padding: 0,
    margin: 0,
  },

  inputError: {
    borderColor: '#FF5252',
    borderWidth: 2,
  },

  errorText: {
    color: '#FF5252',
    fontSize: 12,
    marginTop: 4,
    fontFamily: 'Montserrat_400Regular',
  },

  submitButtonSection: {
    marginTop: 40,
    paddingBottom: 20,
  },

  addEntryButton: {
    width: '100%',
    minHeight: 50,
  },
});