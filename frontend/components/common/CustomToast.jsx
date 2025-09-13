// components/common/CustomToast.jsx
import Toast from 'react-native-toast-message';
import { Colors } from '../../constants/Colors';

// Toast utility providing consistent styling across the app
// Wraps react-native-toast-message with predefined styles and common use cases
class CustomToast {
  
  // Green toast for successful operations
  static success(title, message, duration = 3000) {
    Toast.show({
      type: 'success',
      text1: title,
      text2: message,
      visibilityTime: duration,
      autoHide: true,
      topOffset: 60,
      text1Style: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F8B4C',
        fontFamily: 'Montserrat_700Bold',
      },
      text2Style: {
        fontSize: 14,
        color: '#2C5F41',
        fontFamily: 'Montserrat_400Regular',
      },
    });
  }

  // Red toast for errors and failures
  static error(title, message, duration = 4000) {
    Toast.show({
      type: 'error',
      text1: title,
      text2: message,
      visibilityTime: duration,
      autoHide: true,
      topOffset: 60,
      text1Style: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#E53E3E',
        fontFamily: 'Montserrat_700Bold',
      },
      text2Style: {
        fontSize: 14,
        color: '#C53030',
        fontFamily: 'Montserrat_400Regular',
      },
    });
  }

  // Blue toast for information and neutral messages
  static info(title, message, duration = 3000) {
    Toast.show({
      type: 'info',
      text1: title,
      text2: message,
      visibilityTime: duration,
      autoHide: true,
      topOffset: 60,
      text1Style: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.light.primary,
        fontFamily: 'Montserrat_700Bold',
      },
      text2Style: {
        fontSize: 14,
        color: '#2B6CB0',
        fontFamily: 'Montserrat_400Regular',
      },
    });
  }

  // Orange toast for warnings and cautions
  static warning(title, message, duration = 3500) {
    Toast.show({
      type: 'info',
      text1: title,
      text2: message,
      visibilityTime: duration,
      autoHide: true,
      topOffset: 60,
      text1Style: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#D69E2E',
        fontFamily: 'Montserrat_700Bold',
      },
      text2Style: {
        fontSize: 14,
        color: '#B7791F',
        fontFamily: 'Montserrat_400Regular',
      },
    });
  }

  // Food logging success message
  static nutritionSaved(foodName, mealType) {
    this.success(
      'Food Logged!',
      `${foodName} added to ${mealType.toLowerCase()}`
    );
  }

  // Food deletion confirmation message
  static nutritionDeleted(foodName) {
    this.info(
      'Entry Removed',
      `${foodName} deleted from your log`
    );
  }

  // Form validation error message
  static validationError(message = 'Please fill in all required fields') {
    this.error(
      'Validation Error',
      message
    );
  }

  // Water intake logging success
  static waterSaved(amount) {
    this.success(
      'Water Logged!',
      `${amount}ml added to your daily intake`
    );
  }

  // Water entry deletion confirmation
  static waterDeleted(amount) {
    this.info(
      'Entry Removed',
      `${amount}ml water entry deleted`
    );
  }

  // Workout creation success
  static workoutSaved(workoutName) {
    this.success(
      'Workout Created!',
      `${workoutName} added to your workouts`
    );
  }

  // Workout completion celebration
  static workoutCompleted(workoutName) {
    this.success(
      'Great Job!',
      `${workoutName} workout completed`
    );
  }

  // Flexible toast with custom styling options
  static custom({
    type = 'info',
    title,
    message,
    duration = 3000,
    position = 'top',
    titleColor = Colors.light.primary,
    messageColor = '#666',
  }) {
    Toast.show({
      type,
      text1: title,
      text2: message,
      visibilityTime: duration,
      autoHide: true,
      topOffset: position === 'top' ? 60 : undefined,
      bottomOffset: position === 'bottom' ? 60 : undefined,
      position,
      text1Style: {
        fontSize: 16,
        fontWeight: 'bold',
        color: titleColor,
        fontFamily: 'Montserrat_700Bold',
      },
      text2Style: {
        fontSize: 14,
        color: messageColor,
        fontFamily: 'Montserrat_400Regular',
      },
    });
  }

  // Dismiss currently visible toast
  static hide() {
    Toast.hide();
  }
}

export default CustomToast;