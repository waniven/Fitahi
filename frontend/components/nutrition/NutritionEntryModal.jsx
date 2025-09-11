// components/nutrition/NutritionEntryModal.jsx
import React, { useState } from 'react';
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
import CustomButton from '../common/CustomButton';

/**
 * NutritionEntryModal - Modal for entering food intake data
 * Shows food name, meal type, and nutritional information
 */
export default function NutritionEntryModal({ visible, onClose, onSave }) {
  const [foodName, setFoodName] = useState('');
  const [selectedMealType, setSelectedMealType] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const mealTypes = [
    { id: 'breakfast', label: 'Breakfast' },
    { id: 'lunch', label: 'Lunch' },
    { id: 'dinner', label: 'Dinner' },
    { id: 'snack', label: 'Snack' }
  ];

  /**
   * Validates food name input
   */
  const validateFoodName = (value) => {
    if (!value?.trim()) return 'Food name is required';
    if (value.trim().length < 2) return 'Food name must be at least 2 characters';
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
  const validateNutritionInput = (value, fieldName, min = 0, max = 10000) => {
    if (!value?.trim()) return `${fieldName} is required`;
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return `Please enter a valid number for ${fieldName.toLowerCase()}`;
    if (numValue < min || numValue > max) return `${fieldName} should be between ${min}-${max}`;
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
   * Handles modal close with confirmation if user has entered data
   */
  const requestCloseConfirmation = () => {
    const hasData = foodName.trim() || selectedMealType || calories.trim() || 
                   protein.trim() || carbs.trim() || fat.trim();
    
    if (hasData) {
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
    setFoodName('');
    setSelectedMealType('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
    setValidationErrors({});
    onClose();
  };

  /**
   * Validates and submits nutrition entry data
   */
  const submitNutritionEntry = () => {
    const foodNameError = validateFoodName(foodName);
    const mealTypeError = validateMealType(selectedMealType);
    const caloriesError = validateNutritionInput(calories, 'Calories');
    const proteinError = validateNutritionInput(protein, 'Protein');
    const carbsError = validateNutritionInput(carbs, 'Carbs');
    const fatError = validateNutritionInput(fat, 'Fat');
    
    const currentValidationErrors = {};
    if (foodNameError) currentValidationErrors.foodName = foodNameError;
    if (mealTypeError) currentValidationErrors.mealType = mealTypeError;
    if (caloriesError) currentValidationErrors.calories = caloriesError;
    if (proteinError) currentValidationErrors.protein = proteinError;
    if (carbsError) currentValidationErrors.carbs = carbsError;
    if (fatError) currentValidationErrors.fat = fatError;
    
    setValidationErrors(currentValidationErrors);
    
    if (Object.keys(currentValidationErrors).length === 0) {
      const newNutritionEntry = {
        id: Date.now().toString(),
        foodName: foodName.trim(),
        mealType: selectedMealType,
        calories: parseFloat(calories),
        protein: parseFloat(protein),
        carbs: parseFloat(carbs),
        fat: parseFloat(fat),
        timestamp: new Date().toISOString(),
      };
      
      if (onSave) {
        onSave(newNutritionEntry);
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
          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <View style={styles.modalContent}>
              {/* Modal header with title and close button */}
              <View style={styles.modalHeaderSection}>
                <Text style={styles.modalTitleText}>Log Food</Text>
                <TouchableOpacity onPress={requestCloseConfirmation} style={styles.closeButton}>
                  <Ionicons name="close" size={28} color="#666" />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalSubtitleText}>
                What did you eat today?
              </Text>

              {/* Food name input section */}
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>FOOD NAME *</Text>
                <View style={[styles.inputContainer, validationErrors.foodName && styles.inputError]}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Name of food"
                    placeholderTextColor="#A0A0A0"
                    value={foodName}
                    onChangeText={setFoodName}
                    returnKeyType="next"
                  />
                </View>
                {validationErrors.foodName && (
                  <Text style={styles.errorText}>{validationErrors.foodName}</Text>
                )}
              </View>

              {/* Meal type selection section */}
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>YOU HAD THIS FOR . . . *</Text>
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
                        styles.mealTypeButtonText,
                        selectedMealType === meal.id && styles.mealTypeButtonTextSelected
                      ]}>
                        {meal.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {validationErrors.mealType && (
                  <Text style={styles.errorText}>{validationErrors.mealType}</Text>
                )}
              </View>

              {/* Nutrition information section */}
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>HOW MUCH OF THE FOLLOWING WAS IN YOUR FOOD? *</Text>
                
                <View style={styles.nutritionGrid}>
                  {/* Calories and Protein row */}
                  <View style={styles.nutritionRow}>
                    <View style={styles.nutritionColumn}>
                      <Text style={styles.nutritionFieldLabel}>CALORIES</Text>
                      <View style={[styles.nutritionInputContainer, validationErrors.calories && styles.inputError]}>
                        <TextInput
                          style={styles.textInput}
                          placeholder="Calories"
                          placeholderTextColor="#A0A0A0"
                          value={calories}
                          onChangeText={setCalories}
                          keyboardType="numeric"
                          returnKeyType="next"
                        />
                      </View>
                      {validationErrors.calories && (
                        <Text style={styles.errorText}>{validationErrors.calories}</Text>
                      )}
                    </View>
                    
                    <View style={styles.nutritionColumn}>
                      <Text style={styles.nutritionFieldLabel}>PROTEIN</Text>
                      <View style={[styles.nutritionInputContainer, validationErrors.protein && styles.inputError]}>
                        <TextInput
                          style={styles.textInput}
                          placeholder="Protein"
                          placeholderTextColor="#A0A0A0"
                          value={protein}
                          onChangeText={setProtein}
                          keyboardType="numeric"
                          returnKeyType="next"
                        />
                      </View>
                      {validationErrors.protein && (
                        <Text style={styles.errorText}>{validationErrors.protein}</Text>
                      )}
                    </View>
                  </View>

                  {/* Carbs and Fat row */}
                  <View style={styles.nutritionRow}>
                    <View style={styles.nutritionColumn}>
                      <Text style={styles.nutritionFieldLabel}>CARBS</Text>
                      <View style={[styles.nutritionInputContainer, validationErrors.carbs && styles.inputError]}>
                        <TextInput
                          style={styles.textInput}
                          placeholder="Carbs"
                          placeholderTextColor="#A0A0A0"
                          value={carbs}
                          onChangeText={setCarbs}
                          keyboardType="numeric"
                          returnKeyType="next"
                        />
                      </View>
                      {validationErrors.carbs && (
                        <Text style={styles.errorText}>{validationErrors.carbs}</Text>
                      )}
                    </View>
                    
                    <View style={styles.nutritionColumn}>
                      <Text style={styles.nutritionFieldLabel}>FAT</Text>
                      <View style={[styles.nutritionInputContainer, validationErrors.fat && styles.inputError]}>
                        <TextInput
                          style={styles.textInput}
                          placeholder="Fat"
                          placeholderTextColor="#A0A0A0"
                          value={fat}
                          onChangeText={setFat}
                          keyboardType="numeric"
                          returnKeyType="done"
                        />
                      </View>
                      {validationErrors.fat && (
                        <Text style={styles.errorText}>{validationErrors.fat}</Text>
                      )}
                    </View>
                  </View>
                </View>
              </View>

              {/* Water reminder note */}
              <View style={styles.reminderSection}>
                <View style={styles.reminderContainer}>
                  <Ionicons name="notifications" size={16} color="#4A90E2" style={styles.reminderIcon} />
                  <Text style={styles.reminderText}>
                    By default, you will be reminded to drink water 30 minutes after logging food.
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

  textInput: {
    fontSize: 16,
    color: '#000',
    fontFamily: 'Montserrat_400Regular',
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
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    fontFamily: 'Montserrat_600SemiBold',
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
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
    fontFamily: 'Montserrat_700Bold',
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
    fontSize: 14,
    color: '#4A90E2',
    fontFamily: 'Montserrat_400Regular',
    flex: 1,
    lineHeight: 20,
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
    marginTop: 16,
    paddingBottom: 20,
  },

  logFoodButton: {
    width: '100%',
    minHeight: 50,
  },
});