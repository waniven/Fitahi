import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View, KeyboardAvoidingView, Platform } from 'react-native'; import { Colors } from '../../constants/Colors';
import globalStyles from '../../styles/globalStyles';
import CustomInput from '../../components/common/CustomInput';
import CustomButton from '../../components/common/CustomButton';

/**
 * Validation functions
 */
const nameValidation = (name) => {
  if (!name || !name.trim()) return 'This field is required';
  if (name.trim().length < 2) return 'Name must be at least 2 characters';
  if (!/^[a-zA-Z\s]+$/.test(name.trim())) return 'Name can only contain letters and spaces';
  return null;
};

const emailValidation = (email) => {
  if (!email || !email.trim()) return 'Email is required';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) return 'Please enter a valid email address';
  return null;
};

const passwordValidation = (password) => {
  if (!password || !password.trim()) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/(?=.*[a-z])/.test(password)) return 'Password must contain a lowercase letter';
  if (!/(?=.*[A-Z])/.test(password)) return 'Password must contain an uppercase letter';
  if (!/(?=.*\d)/.test(password)) return 'Password must contain a number';
  return null;
};

const dateValidation = (date) => {
  if (!date) return 'Please select your date of birth';
  const today = new Date();
  const birthDate = new Date(date);
  const age = today.getFullYear() - birthDate.getFullYear();

  if (age < 13) return 'You must be at least 13 years old';
  if (age > 120) return 'Please enter a valid birth date';
  return null;
};

/**
 * SignUp - User registration form component
 * Implements better validation that only shows errors after form submission attempt
 */
export default function SignUp() {
  const router = useRouter();
  const theme = Colors["dark"];

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    email: '',
    password: '',
  });

  const [selectedDate, setSelectedDate] = useState(null);
  const [errors, setErrors] = useState({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  /**
   * Updates form data for a specific field
   * @param {string} field - Field name to update
   * @param {string} value - New value for the field
   */
  const updateField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Only clear errors if user has already attempted to submit
    // This prevents premature error clearing
    if (hasAttemptedSubmit && errors[field]) {
      // Re-validate this specific field if user has attempted submit
      // and the field now passes validation
      let fieldError = null;

      switch (field) {
        case 'firstName':
        case 'lastName':
          fieldError = nameValidation(value);
          break;
        case 'email':
          fieldError = emailValidation(value);
          break;
        case 'password':
          fieldError = passwordValidation(value);
          break;
      }

      if (!fieldError) {
        setErrors(prev => ({
          ...prev,
          [field]: null
        }));
      }
    }
  };

  /**
   * Handles date selection with validation
   * @param {Date} date - Selected date
   */
  const handleDateChange = (date) => {
    setSelectedDate(date);

    // Only clear date error if user has attempted submit and date is now valid
    if (hasAttemptedSubmit && errors.dateOfBirth) {
      const dateError = dateValidation(date);
      if (!dateError) {
        setErrors(prev => ({
          ...prev,
          dateOfBirth: null
        }));
      }
    }
  };

  /**
   * Validates all form fields
   * @returns {boolean} True if form is valid, false otherwise
   */
  const validateForm = () => {
    const newErrors = {};

    // Validate all fields
    const firstNameError = nameValidation(formData.firstName);
    if (firstNameError) {
      newErrors.firstName = firstNameError;
    }

    const lastNameError = nameValidation(formData.lastName);
    if (lastNameError) {
      newErrors.lastName = lastNameError;
    }

    const emailError = emailValidation(formData.email);
    if (emailError) {
      newErrors.email = emailError;
    }

    const passwordError = passwordValidation(formData.password);
    if (passwordError) {
      newErrors.password = passwordError;
    }

    const dateError = dateValidation(selectedDate);
    if (dateError) {
      newErrors.dateOfBirth = dateError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handles form submission
   */
  const handleContinue = () => {
    // Mark that user has attempted to submit
    setHasAttemptedSubmit(true);

    if (validateForm()) {
      console.log('Form data:', {
        ...formData,
        dateOfBirth: selectedDate
      });
      router.push('/profile/quiz');
    } else {
      // Optionally scroll to first error or show a general error message
      console.log('Form has validation errors');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, globalStyles.welcomeText, { color: theme.textPrimary }]}>
            We're happy to have you!
          </Text>
          <Text style={[styles.subtitle, globalStyles.cardText, { color: theme.textSecondary }]}>
            Now let's set up your profile.
          </Text>
        </View>

        {/* Form Fields */}
        <View style={styles.formContainer}>
          <CustomInput
            label="First Name"
            placeholder="First Name"
            value={formData.firstName}
            onChangeText={(text) => updateField('firstName', text)}
            errorMessage={errors.firstName}
            required
          />

          <CustomInput
            label="Last Name"
            placeholder="Last Name"
            value={formData.lastName}
            onChangeText={(text) => updateField('lastName', text)}
            errorMessage={errors.lastName}
            required
          />

          <CustomInput
            label="Date of Birth"
            placeholder="Choose a date"
            isDatePicker={true}
            selectedDate={selectedDate}
            onDateChange={handleDateChange}
            errorMessage={errors.dateOfBirth}
            required
          />

          <CustomInput
            label="Email Address"
            placeholder="Email address"
            value={formData.email}
            onChangeText={(text) => updateField('email', text)}
            keyboardType="email-address"
            errorMessage={errors.email}
            required
          />

          <CustomInput
            label="Password"
            placeholder="Password"
            value={formData.password}
            onChangeText={(text) => updateField('password', text)}
            secureTextEntry
            errorMessage={errors.password}
            required
          />
        </View>

        {/* Continue Button */}
        <View style={styles.buttonContainer}>
          <CustomButton
            title="Continue"
            onPress={handleContinue}
            size="large"
            style={styles.continueButton}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
  },

  header: {
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },

  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 32,
  },

  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },

  formContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 30,
  },

  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  continueButton: {
    width: 370,
  },
});