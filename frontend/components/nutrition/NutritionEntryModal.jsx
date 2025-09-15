// components/nutrition/NutritionEntryModal.jsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Alert,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Font, Type, TextVariants } from '../../constants/Font';
import CustomButton from '../common/CustomButton';
import CustomToast from '../common/CustomToast';

// Configuration constants - move these to a config file
const VALIDATION_CONFIG = {
  foodName: {
    minLength: 2,
    maxLength: 100
  },
  nutrition: {
    min: 0,
    max: 10000
  }
};

const DEFAULT_MEAL_TYPES = [
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'dinner', label: 'Dinner' },
  { id: 'snack', label: 'Snack' }
];

const NUTRITION_FIELDS = [
  { key: 'calories', label: 'CALORIES', placeholder: 'Calories' },
  { key: 'protein', label: 'PROTEIN', placeholder: 'Protein' },
  { key: 'carbs', label: 'CARBS', placeholder: 'Carbs' },
  { key: 'fat', label: 'FAT', placeholder: 'Fat' }
];

const MODAL_CONFIG = {
  maxHeight: '90%',
  reminderDelay: 30, // minutes
};

const ALERT_MESSAGES = {
  exitConfirmation: {
    title: 'Are you sure you want to exit?',
    message: 'Your entered data will be lost.',
    cancelText: 'Cancel',
    confirmText: 'Exit'
  }
};

// Local text styles using Font constants
const textStyles = {
  heading1: { fontSize: 28, ...Type.bold },
  bodyMedium: { fontSize: 16, ...Type.bold },
  bodySmall: { fontSize: 16, ...Type.regular },
  caption: { fontSize: 12, ...Type.regular },
};

/**
 * NutritionEntryModal - Modal for entering food intake data
 * Shows food name, meal type, and nutritional information
 */
export default function NutritionEntryModal({ 
  visible, 
  onClose, 
  onSave,
  mealTypes = DEFAULT_MEAL_TYPES,
  validationConfig = VALIDATION_CONFIG,
  reminderDelay = MODAL_CONFIG.reminderDelay,
  nutritionFields = NUTRITION_FIELDS
}) {
  const [foodName, setFoodName] = useState('');
  const [selectedMealType, setSelectedMealType] = useState('');
  const [nutritionValues, setNutritionValues] = useState(() =>
    Object.fromEntries(nutritionFields.map(field => [field.key, '']))
  );
  const [validationErrors, setValidationErrors] = useState({});

  // Update nutrition values when nutritionFields prop changes
  useEffect(() => {
    setNutritionValues(prev => {
      const newValues = Object.fromEntries(nutritionFields.map(field => [field.key, '']));
      // Preserve existing values if fields overlap
      nutritionFields.forEach(field => {
        if (prev[field.key] !== undefined) {
          newValues[field.key] = prev[field.key];
        }
      });
      return newValues;
    });
  }, [nutritionFields]);

  /**
   * Updates a nutrition field value
   */
  const updateNutritionValue = (field, value) => {
    setNutritionValues(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  /**
   * Clears validation errors for food name
   */
  const handleFoodNameChange = (value) => {
    setFoodName(value);
    if (validationErrors.foodName) {
      setValidationErrors(prev => ({ ...prev, foodName: null }));
    }
  };

  /**
   * Validates food name input
   */
  const validateFoodName = (value) => {
    if (!value?.trim()) return 'Food name is required';
    if (value.trim().length < validationConfig.foodName.minLength) {
      return `Food name must be at least ${validationConfig.foodName.minLength} characters`;
    }
    if (value.trim().length > validationConfig.foodName.maxLength) {
      return `Food name must be less than ${validationConfig.foodName.maxLength} characters`;
    }
    return null;
  };

  /**
   * Validates meal type selection
   */
  const validateMealType = (value) => {
    if (!value) return 'Please select a meal type';
    return null;
  };

  /**
   * Validates numeric nutrition input
   */
  const validateNutritionInput = (value, fieldName) => {
    if (!value?.trim()) return `${fieldName} is required`;
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return `Please enter a valid number for ${fieldName.toLowerCase()}`;
    if (numValue < validationConfig.nutrition.min || numValue > validationConfig.nutrition.max) {
      return `${fieldName} should be between ${validationConfig.nutrition.min}-${validationConfig.nutrition.max}`;
    }
    return null;
  };

  /**
   * Handles meal type selection
   */
  const handleMealTypeSelect = (mealType) => {
    setSelectedMealType(mealType);
    // Clear meal type validation error when user selects
    if (validationErrors.mealType) {
      setValidationErrors(prev => ({
        ...prev,
        mealType: null
      }));
    }
  };

  /**
   * Checks if user has entered any data
   */
  const hasUserData = () => {
    return foodName.trim() || 
           selectedMealType || 
           Object.values(nutritionValues).some(value => value.trim());
  };

  /**
   * Handles modal close with confirmation if user has entered data
   */
  const requestCloseConfirmation = () => {
    if (hasUserData()) {
      Alert.alert(
        ALERT_MESSAGES.exitConfirmation.title,
        ALERT_MESSAGES.exitConfirmation.message,
        [
          { text: ALERT_MESSAGES.exitConfirmation.cancelText, style: 'cancel' },
          { 
            text: ALERT_MESSAGES.exitConfirmation.confirmText, 
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
    setFoodName('');
    setSelectedMealType('');
    setNutritionValues(Object.fromEntries(nutritionFields.map(field => [field.key, ''])));
    setValidationErrors({});
    onClose();
  };

  /**
   * Validates all form fields
   */
  const validateForm = () => {
    const errors = {};
    
    const foodNameError = validateFoodName(foodName);
    if (foodNameError) errors.foodName = foodNameError;
    
    const mealTypeError = validateMealType(selectedMealType);
    if (mealTypeError) errors.mealType = mealTypeError;
    
    nutritionFields.forEach(field => {
      const error = validateNutritionInput(nutritionValues[field.key], field.label);
      if (error) errors[field.key] = error;
    });
    
    return errors;
  };

  /**
   * Validates and submits nutrition entry data
   */
  const submitNutritionEntry = () => {
    const currentValidationErrors = validateForm();
    setValidationErrors(currentValidationErrors);
    
    if (Object.keys(currentValidationErrors).length === 0) {
      const newNutritionEntry = {
        id: Date.now().toString(),
        foodName: foodName.trim(),
        mealType: selectedMealType,
        ...Object.fromEntries(
          nutritionFields.map(field => [field.key, parseFloat(nutritionValues[field.key])])
        ),
        timestamp: new Date().toISOString(),
      };
      
      CustomToast.nutritionSaved(foodName.trim(), selectedMealType);
      
      if (onSave) {
        onSave(newNutritionEntry);
      }
      closeModal();
    } else {
      CustomToast.validationError();
    }
  };

  /**
   * Renders nutrition input fields in a grid layout
   */
  const renderNutritionGrid = () => {
    const rows = [];
    for (let i = 0; i < nutritionFields.length; i += 2) {
      const leftField = nutritionFields[i];
      const rightField = nutritionFields[i + 1];
      
      rows.push(
        <View key={`row-${i}`} style={styles.nutritionRow}>
          {renderNutritionField(leftField)}
          {rightField && renderNutritionField(rightField)}
        </View>
      );
    }
    return rows;
  };

  /**
   * Renders a single nutrition input field
   */
  const renderNutritionField = (field) => (
    <View key={field.key} style={styles.nutritionColumn}>
      <Text style={[textStyles.caption, styles.nutritionFieldLabel]}>
        {field.label}
      </Text>
      <View style={[
        styles.nutritionInputContainer, 
        validationErrors[field.key] && styles.inputError
      ]}>
        <TextInput
          style={[textStyles.bodySmall, styles.textInput]}
          placeholder={field.placeholder}
          placeholderTextColor="#A0A0A0"
          value={nutritionValues[field.key] || ''}
          onChangeText={(value) => updateNutritionValue(field.key, value)}
          keyboardType="numeric"
          returnKeyType={field.key === nutritionFields[nutritionFields.length - 1]?.key ? 'done' : 'next'}
        />
      </View>
      {validationErrors[field.key] && (
        <Text style={[textStyles.bodySmall, styles.errorText]}>
          {validationErrors[field.key]}
        </Text>
      )}
    </View>
  );

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
          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <View style={styles.modalContent}>
              {/* Modal header with title and close button */}
              <View style={styles.modalHeaderSection}>
                <Text style={[textStyles.heading1, styles.modalTitleText]}>Log Food</Text>
                <TouchableOpacity onPress={requestCloseConfirmation} style={styles.closeButton}>
                  <Ionicons name="close" size={28} color="#666" />
                </TouchableOpacity>
              </View>

              <Text style={[textStyles.bodyMedium, styles.modalSubtitleText]}>
                What did you eat today?
              </Text>

              {/* Food name input section */}
              <View style={styles.inputSection}>
                <Text style={[textStyles.bodyMedium, styles.inputLabel]}>FOOD NAME *</Text>
                <View style={[styles.inputContainer, validationErrors.foodName && styles.inputError]}>
                  <TextInput
                    style={[textStyles.bodySmall, styles.textInput]}
                    placeholder="Name of food"
                    placeholderTextColor="#A0A0A0"
                    value={foodName}
                    onChangeText={handleFoodNameChange}
                    returnKeyType="next"
                  />
                </View>
                {validationErrors.foodName && (
                  <Text style={[textStyles.bodySmall, styles.errorText]}>
                    {validationErrors.foodName}
                  </Text>
                )}
              </View>

              {/* Meal type selection section */}
              <View style={styles.inputSection}>
                <Text style={[textStyles.bodyMedium, styles.inputLabel]}>YOU HAD THIS FOR . . . *</Text>
                <View style={styles.mealTypeContainer}>
                  {mealTypes.map((meal) => (
                    <TouchableOpacity
                      key={meal.id}
                      style={[
                        styles.mealTypeButton,
                        selectedMealType === meal.id && styles.mealTypeButtonSelected
                      ]}
                      onPress={() => handleMealTypeSelect(meal.id)}
                    >
                      <Text style={[
                        textStyles.bodySmall,
                        styles.mealTypeButtonText,
                        selectedMealType === meal.id && styles.mealTypeButtonTextSelected
                      ]}>
                        {meal.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {validationErrors.mealType && (
                  <Text style={[textStyles.bodySmall, styles.errorText]}>
                    {validationErrors.mealType}
                  </Text>
                )}
              </View>

              {/* Nutrition information section */}
              <View style={styles.inputSection}>
                <Text style={[textStyles.bodyMedium, styles.inputLabel]}>
                  HOW MUCH OF THE FOLLOWING WAS IN YOUR FOOD? *
                </Text>
                
                <View style={styles.nutritionGrid}>
                  {renderNutritionGrid()}
                </View>
              </View>

              {/* Water reminder note */}
              <View style={styles.reminderSection}>
                <View style={styles.reminderContainer}>
                  <Ionicons name="notifications" size={16} color="#4A90E2" style={styles.reminderIcon} />
                  <Text style={[textStyles.bodySmall, styles.reminderText]}>
                    By default, you will be reminded to drink water {reminderDelay} minutes after logging food.
                  </Text>
                </View>
              </View>

              {/* Submit button */}
              <View style={styles.submitButtonSection}>
                <CustomButton
                  title="Log Food"
                  onPress={submitNutritionEntry}
                  variant="primary"
                  size="large"
                  style={styles.logFoodButton}
                />
              </View>
            </View>
          </ScrollView>
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
    maxHeight: '90%',
  },

  scrollView: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  
  modalContent: {
    paddingBottom: 40,
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

  textInput: {
    color: '#000',
    padding: 0,
    margin: 0,
    flex: 1,
    minHeight: 20,
  },

  mealTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  mealTypeButton: {
    backgroundColor: '#E4F8FF',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 16,
    minWidth: '47%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },

  mealTypeButtonSelected: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },

  mealTypeButtonText: {
    fontWeight: '600',
    color: '#000',
  },

  mealTypeButtonTextSelected: {
    color: '#fff',
  },

  nutritionGrid: {
    gap: 16,
  },

  nutritionRow: {
    flexDirection: 'row',
    gap: 12,
  },

  nutritionColumn: {
    flex: 1,
  },

  nutritionFieldLabel: {
    color: '#000',
    marginBottom: 8,
  },

  nutritionInputContainer: {
    backgroundColor: '#E4F8FF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: 'transparent',
    minHeight: 56,
  },

  reminderSection: {
    marginBottom: 24,
  },

  reminderContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0F8FF',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4A90E2',
  },

  reminderIcon: {
    marginRight: 8,
    marginTop: 2,
  },

  reminderText: {
    color: '#4A90E2',
    flex: 1,
    lineHeight: 20,
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
    marginTop: 16,
    paddingBottom: 20,
  },

  logFoodButton: {
    width: '100%',
    minHeight: 50,
  },
});