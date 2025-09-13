// components/water/WaterEntryModal.jsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Alert,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import CustomButton from '../common/CustomButton';
import CustomToast from '../common/CustomToast';
import globalStyles from '../../styles/globalStyles';

// Modal for entering water intake data with time picker
export default function WaterEntryModal({ visible, onClose, onSave }) {
  const [amountValue, setAmountValue] = useState('');
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Validates water amount input with reasonable ranges
  const validateAmountInput = (value) => {
    const amountNumber = parseFloat(value);
    if (!value) return 'Amount is required';
    if (isNaN(amountNumber)) return 'Please enter a valid number';
    if (amountNumber < 50 || amountNumber > 5000) return 'Amount should be between 50-5000 ml';
    return null;
  };

  // Format time for display
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  // Handle time picker changes
  const handleTimeChange = (event, time) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    
    if (event.type === 'set' && time) {
      setSelectedTime(time);
      // Clear time validation error if exists
      if (validationErrors.time) {
        setValidationErrors(prev => ({ ...prev, time: null }));
      }
    }
  };

  // Handle time picker confirm (iOS)
  const handleTimeConfirm = () => {
    setShowTimePicker(false);
  };

  // Handle time picker cancel (iOS)
  const handleTimeCancel = () => {
    setShowTimePicker(false);
  };

  // Open time picker
  const openTimePicker = () => {
    setShowTimePicker(true);
  };

  // Handles modal close with confirmation if user has entered data
  const requestCloseConfirmation = () => {
    if (amountValue.trim()) {
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

  // Closes modal and resets form state
  const closeModal = () => {
    setAmountValue('');
    setSelectedTime(new Date());
    setValidationErrors({});
    onClose();
  };

  // Validates and submits water entry data
  const submitWaterEntry = () => {
    const amountError = validateAmountInput(amountValue);
    
    const currentValidationErrors = {};
    if (amountError) currentValidationErrors.amount = amountError;
    
    setValidationErrors(currentValidationErrors);
    
    if (Object.keys(currentValidationErrors).length === 0) {
      const newWaterEntry = {
        id: Date.now().toString(),
        amount: parseFloat(amountValue),
        time: formatTime(selectedTime),
        timestamp: new Date().toISOString(),
      };
      
      CustomToast.waterSaved(parseFloat(amountValue));
      
      if (onSave) {
        onSave(newWaterEntry);
      }
      closeModal();
    } else {
      CustomToast.validationError();
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
              <Text style={[globalStyles.heading1, styles.modalTitleText]}>Log Water</Text>
              <TouchableOpacity onPress={requestCloseConfirmation} style={styles.closeButton}>
                <Ionicons name="close" size={28} color="#666" />
              </TouchableOpacity>
            </View>

            <Text style={[globalStyles.bodyMedium, styles.modalSubtitleText]}>
              How much water did you drink today?
            </Text>

            {/* Water amount input section */}
            <View style={styles.inputSection}>
              <Text style={[globalStyles.bodyMedium, styles.inputLabel]}>HOW MUCH WATER DID YOU DRINK (IN MILLILITRES)? *</Text>
              <View style={[styles.inputContainer, validationErrors.amount && styles.inputError]}>
                <TextInput
                  style={[globalStyles.bodyMedium, styles.textInput]}
                  placeholder="Amount"
                  placeholderTextColor="#A0A0A0"
                  value={amountValue}
                  onChangeText={setAmountValue}
                  keyboardType="numeric"
                  returnKeyType="next"
                />
              </View>
              {validationErrors.amount && (
                <Text style={[globalStyles.bodySmall, styles.errorText]}>{validationErrors.amount}</Text>
              )}
            </View>

            {/* Time picker section */}
            <View style={styles.inputSection}>
              <Text style={[globalStyles.bodyMedium, styles.inputLabel]}>AND AT WHAT TIME? *</Text>
              <TouchableOpacity 
                style={[styles.inputContainer, styles.timePickerContainer]}
                onPress={openTimePicker}
                activeOpacity={0.7}
              >
                <View style={styles.timeInputContainer}>
                  <Text style={[globalStyles.bodyMedium, styles.timeDisplayText]}>
                    {formatTime(selectedTime)}
                  </Text>
                  <Ionicons name="chevron-forward" size={20} color="#A0A0A0" />
                </View>
              </TouchableOpacity>
              {validationErrors.time && (
                <Text style={[globalStyles.bodySmall, styles.errorText]}>{validationErrors.time}</Text>
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

        {/* iOS Time Picker Modal */}
        {showTimePicker && Platform.OS === 'ios' && (
          <View style={styles.timePickerOverlay}>
            <View style={styles.timePickerModal}>
              <View style={styles.timePickerHeader}>
                <TouchableOpacity onPress={handleTimeCancel} style={styles.timePickerButton}>
                  <Text style={[globalStyles.bodyMedium, styles.timePickerButtonText]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleTimeConfirm} style={styles.timePickerButton}>
                  <Text style={[globalStyles.bodyMedium, styles.timePickerButtonText, styles.confirmButton]}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={selectedTime}
                mode="time"
                display="spinner"
                onChange={handleTimeChange}
                style={styles.timePicker}
                textColor="#000000"
                themeVariant="light"
              />
            </View>
          </View>
        )}

        {/* Android Time Picker */}
        {showTimePicker && Platform.OS === 'android' && (
          <DateTimePicker
            value={selectedTime}
            mode="time"
            display="default"
            onChange={handleTimeChange}
          />
        )}
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
    flex: 1,
  },
  modalHeaderSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitleText: {
    color: '#000',
  },
  closeButton: {
    padding: 4,
  },
  modalSubtitleText: {
    color: '#666',
    marginBottom: 32,
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    color: '#000',
    marginBottom: 8,
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
  timePickerContainer: {
    justifyContent: 'center',
  },
  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textInput: {
    color: '#000',
    padding: 0,
    margin: 0,
    flex: 1,
    minHeight: 20,
  },
  timeDisplayText: {
    color: '#000',
    flex: 1,
  },
  inputError: {
    borderColor: '#FF5252',
    borderWidth: 2,
  },
  errorText: {
    color: '#FF5252',
    marginTop: 4,
  },
  submitButtonSection: {
    marginTop: 'auto',
    paddingBottom: 20,
  },
  logWaterButton: {
    width: '100%',
    minHeight: 50,
  },
  timePickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  timePickerModal: {
    backgroundColor: '#F8F9FA',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingBottom: 34,
  },
  timePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E7',
    backgroundColor: '#F8F9FA',
  },
  timePickerButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  timePickerButtonText: {
    color: '#007AFF',
  },
  confirmButton: {
    fontWeight: '600',
  },
  timePicker: {
    backgroundColor: '#F8F9FA',
    height: 216,
    alignSelf: 'center',
    width: '100%',
  },
});