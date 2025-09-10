// components/water/WaterEntryModal.jsx
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
import CustomButton from '../common/CustomButton';

/**
 * WaterEntryModal - Modal for entering water intake data
 * Shows amount in milliliters and time consumed
 */
export default function WaterEntryModal({ visible, onClose, onSave }) {
  const [amountValue, setAmountValue] = useState('');
  const [timeValue, setTimeValue] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  /**
   * Validates water amount input with reasonable ranges
   */
  const validateAmountInput = (value) => {
    const amountNumber = parseFloat(value);
    if (!value) return 'Amount is required';
    if (isNaN(amountNumber)) return 'Please enter a valid number';
    if (amountNumber < 50 || amountNumber > 5000) return 'Amount should be between 50-5000 ml';
    return null;
  };

  /**
   * Validates time input - simple time format validation
   */
  const validateTimeInput = (value) => {
    if (!value) return 'Time is required';
    // Simple validation for time format (could be enhanced)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(value)) return 'Please enter time in HH:MM format (e.g., 14:30)';
    return null;
  };

  /**
   * Handles modal close with confirmation if user has entered data
   */
  const requestCloseConfirmation = () => {
    if (amountValue.trim() || timeValue.trim()) {
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
    setAmountValue('');
    setTimeValue('');
    setValidationErrors({});
    onClose();
  };

  /**
   * Validates and submits water entry data
   */
  const submitWaterEntry = () => {
    const amountError = validateAmountInput(amountValue);
    const timeError = validateTimeInput(timeValue);
    
    const currentValidationErrors = {};
    if (amountError) currentValidationErrors.amount = amountError;
    if (timeError) currentValidationErrors.time = timeError;
    
    setValidationErrors(currentValidationErrors);
    
    if (Object.keys(currentValidationErrors).length === 0) {
      const newWaterEntry = {
        id: Date.now().toString(),
        amount: parseFloat(amountValue),
        time: timeValue,
        timestamp: new Date().toISOString(),
      };
      
      if (onSave) {
        onSave(newWaterEntry);
      }
      closeModal();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={requestCloseConfirmation}
    >
      {/* Background overlay */}
      <View style={styles.modalOverlay}>
        <TouchableOpacity 
          style={styles.backgroundTouchable} 
          activeOpacity={1}
          onPress={requestCloseConfirmation}
        />
        
        {/* Modal content */}
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Modal header with title and close button */}
            <View style={styles.modalHeaderSection}>
              <Text style={styles.modalTitleText}>Log Water</Text>
              <TouchableOpacity onPress={requestCloseConfirmation} style={styles.closeButton}>
                <Ionicons name="close" size={28} color="#666" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitleText}>
              How much water did you drink today?
            </Text>

            {/* Water amount input section */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>HOW MUCH WATER DID YOU DRINK (IN MILLILITRES)? *</Text>
              <View style={[styles.inputContainer, validationErrors.amount && styles.inputError]}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Amount"
                  placeholderTextColor="#A0A0A0"
                  value={amountValue}
                  onChangeText={setAmountValue}
                  keyboardType="numeric"
                  returnKeyType="next"
                />
              </View>
              {validationErrors.amount && (
                <Text style={styles.errorText}>{validationErrors.amount}</Text>
              )}
            </View>

            {/* Time input section */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>AND AT WHAT TIME? *</Text>
              <View style={[styles.inputContainer, validationErrors.time && styles.inputError]}>
                <View style={styles.timeInputContainer}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Time"
                    placeholderTextColor="#A0A0A0"
                    value={timeValue}
                    onChangeText={setTimeValue}
                    keyboardType="default"
                    returnKeyType="done"
                  />
                  <Ionicons name="chevron-forward" size={20} color="#A0A0A0" />
                </View>
              </View>
              {validationErrors.time && (
                <Text style={styles.errorText}>{validationErrors.time}</Text>
              )}
            </View>

            {/* Submit button at bottom */}
            <View style={styles.submitButtonSection}>
              <CustomButton
                title="Log Water"
                onPress={submitWaterEntry}
                variant="primary"
                size="large"
                style={styles.logWaterButton}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },

  backgroundTouchable: {
    flex: 1,
  },

  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
    height: '85%',
  },
  
  modalContent: {
    // Content styling
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
    marginBottom: 32,
    fontFamily: 'Montserrat_400Regular',
  },

  inputSection: {
    marginBottom: 24,
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
    minHeight: 56,
  },

  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  textInput: {
    fontSize: 16,
    color: '#000',
    fontFamily: 'Montserrat_400Regular',
    padding: 0,
    margin: 0,
    flex: 1,
    minHeight: 20,
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
    marginTop: 32,
    paddingBottom: 20,
  },

  logWaterButton: {
    width: '100%',
    minHeight: 50,
  },
});