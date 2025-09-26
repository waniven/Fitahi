import Toast from 'react-native-toast-message';
import { Colors } from '../../constants/Colors';

/**
 * Toast utility class providing consistent notification styling across the app
 * Wraps react-native-toast-message with predefined styles and domain-specific methods
 */
class CustomToast {
  
  // Displays success toast with green styling for positive confirmations
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

  // Displays error toast with red styling for failures and critical issues
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

  // Displays informational toast with blue styling for neutral messages
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

  // Displays warning toast with orange styling for cautions and alerts
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

  // Shows confirmation when food item is successfully logged
  static nutritionSaved(foodName, mealType) {
    this.success(
      'Food Logged!',
      `${foodName} added to ${mealType.toLowerCase()}`
    );
  }

  // Shows confirmation when food entry is deleted from log
  static nutritionDeleted(foodName) {
    this.info(
      'Entry Removed',
      `${foodName} deleted from your log`
    );
  }

  // Shows validation error for form input issues
  static validationError(message = 'Please fill in all required fields') {
    this.error(
      'Validation Error',
      message
    );
  }

  // Shows confirmation when water intake is successfully recorded
  static waterSaved(amount) {
    this.success(
      'Water Logged!',
      `${amount}ml added to your daily intake`
    );
  }

  // Shows confirmation when water entry is removed from log
  static waterDeleted(amount) {
    this.info(
      'Entry Removed',
      `${amount}ml water entry deleted`
    );
  }

  // Shows confirmation when new workout is created
  static workoutSaved(workoutName) {
    this.success(
      'Workout Created!',
      `${workoutName} added to your workouts`
    );
  }

  // Shows celebration message when workout session is completed
  static workoutCompleted(workoutName) {
    this.success(
      'Great Job!',
      `${workoutName} workout completed`
    );
  }

  // Shows confirmation when reminder is successfully saved
  static reminderSaved(reminderTitle) {
    this.success(
      'Reminder Added!',
      `"${reminderTitle}" has been saved`
    );
  }

  // Shows confirmation when existing reminder is modified
  static reminderUpdated(reminderTitle) {
    this.success(
      'Reminder Updated!',
      `"${reminderTitle}" has been modified`
    );
  }

  // Shows confirmation when reminder is deleted
  static reminderDeleted(reminderTitle) {
    this.info(
      'Reminder Deleted',
      `"${reminderTitle}" has been removed`
    );
  }

  // Shows alert when scheduled reminder triggers
  static reminderNotification(reminderTitle) {
    this.warning(
      'Reminder!',
      reminderTitle
    );
  }

  // Shows fully customizable toast with flexible styling options
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

  // Immediately dismisses any currently visible toast
  static hide() {
    Toast.hide();
  }
}

export default CustomToast;