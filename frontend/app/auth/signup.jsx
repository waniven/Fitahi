import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import globalStyles from '../../styles/globalStyles';
import CustomInput from '../../components/common/CustomInput';
import CustomButton from '../../components/common/CustomButton';

/**
 * Validation functions
 */
const nameValidation = (name) => {
  if (!name) return null;
  if (name.length < 2) return 'Name must be at least 2 characters';
  if (!/^[a-zA-Z\s]+$/.test(name)) return 'Name can only contain letters and spaces';
  return null;
};

const emailValidation = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return null;
  if (!emailRegex.test(email)) return 'Please enter a valid email address';
  return null;
};

const passwordValidation = (password) => {
  if (!password) return null;
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
 * Implements the design shown in the provided image with validation
 */
export default function SignUp() {
  const router = useRouter();
  const theme = Colors[useColorScheme() ?? 'light'];

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
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  /**
   * Validates all form fields
   * @returns {boolean} True if form is valid, false otherwise
   */
  const validateForm = () => {
    const newErrors = {};
    
    // Validate first name
    const firstNameError = nameValidation(formData.firstName);
    if (firstNameError || !formData.firstName.trim()) {
      newErrors.firstName = firstNameError || 'First name is required';
    }
    
    // Validate last name
    const lastNameError = nameValidation(formData.lastName);
    if (lastNameError || !formData.lastName.trim()) {
      newErrors.lastName = lastNameError || 'Last name is required';
    }
    
    // Validate email
    const emailError = emailValidation(formData.email);
    if (emailError || !formData.email.trim()) {
      newErrors.email = emailError || 'Email is required';
    }
    
    // Validate password
    const passwordError = passwordValidation(formData.password);
    if (passwordError || !formData.password.trim()) {
      newErrors.password = passwordError || 'Password is required';
    }
    
    // Validate date of birth
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
    if (validateForm()) {
      // Form is valid, proceed to next step
      console.log('Form data:', {
        ...formData,
        dateOfBirth: selectedDate
      });
      router.push('/profile/quiz');
    }
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, globalStyles.textBold, { color: theme.textPrimary }]}>
          We're happy to have you!
        </Text>
        <Text style={[styles.subtitle, globalStyles.textRegular, { color: theme.textSecondary }]}>
          Now let's set up your profile.
        </Text>
      </View>

      {/* Form Fields */}
      <View style={styles.formContainer}>
        
        {/* First Name */}
        <CustomInput
          label="First Name"
          placeholder="First Name"
          value={formData.firstName}
          onChangeText={(text) => updateField('firstName', text)}
          validation={nameValidation}
          errorMessage={errors.firstName}
          required
        />

        {/* Last Name */}
        <CustomInput
          label="Last Name"
          placeholder="Last Name"
          value={formData.lastName}
          onChangeText={(text) => updateField('lastName', text)}
          validation={nameValidation}
          errorMessage={errors.lastName}
          required
        />

        {/* Date of Birth */}
        <CustomInput
          label="Date of Birth"
          placeholder="Choose a date"
          isDatePicker={true}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          errorMessage={errors.dateOfBirth}
          required
        />

        {/* Email Address */}
        <CustomInput
          label="Email Address"
          placeholder="Email address"
          value={formData.email}
          onChangeText={(text) => updateField('email', text)}
          keyboardType="email-address"
          validation={emailValidation}
          errorMessage={errors.email}
          required
        />

        {/* Password */}
        <CustomInput
          label="Password"
          placeholder="Password"
          value={formData.password}
          onChangeText={(text) => updateField('password', text)}
          secureTextEntry
          validation={passwordValidation}
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
  );
}

const styles = StyleSheet.create({
  // Main container
  container: {
    flex: 1,
  },
  
  // Content container for ScrollView
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
  },
  
  // Header section
  header: {
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  
  // Main title
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 32,
  },
  
  // Subtitle
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  
  // Form container
  formContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 30,
  },
  
  // Button container
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  
  // Continue button styling
  continueButton: {
    width: 370, // Match input width
  },
});