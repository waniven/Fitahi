// app/paymentscreen/index.jsx
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, useColorScheme, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import globalStyles from '../../styles/globalStyles';

// Formats card number with spaces every 4 digits (1234 5678 9012 3456)
const formatCardNumber = (num) => num.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();

// Formats expiry date as MM/YY
const formatExpiry = (text) => {
  const clean = text.replace(/\D/g, '');
  if (clean.length <= 2) return clean;
  return clean.slice(0, 2) + '/' + clean.slice(2, 4);
};

/**
 * Payment form screen with credit card input and live preview
 * Features card visualization, input validation, and formatted display
 */
export default function PaymentScreen() {
  const theme = Colors[useColorScheme() ?? 'light'];
  
  // Form state for all payment card fields
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  // Validates payment form and handles submission
  const handleSubmit = () => {
    if (cardNumber.replace(/\s/g, '').length !== 16) return alert('Please enter a valid 16-digit card number.');
    if (!cardName.trim()) return alert('Please enter the cardholder name.');
    if (!/^\d{2}\/\d{2}$/.test(expiry)) return alert('Expiry date must be in MM/YY format.');
    if (cvv.length < 3 || cvv.length > 4) return alert('CVV must be 3 or 4 digits.');
    alert('Payment info submitted! (Integration with payment gateway next)');
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={[globalStyles.textBold, styles.title, { color: theme.textPrimary }]}>Enter Payment Details</Text>

        {/* Live credit card preview that updates as user types */}
        <View style={[styles.card, { backgroundColor: theme.tint }]}>
          <Text style={styles.chip}>💳</Text>
          <Text style={styles.cardNumber}>{cardNumber ? formatCardNumber(cardNumber) : '•••• •••• •••• ••••'}</Text>
          <View style={styles.cardBottomRow}>
            <View>
              <Text style={styles.label}>Cardholder Name</Text>
              <Text style={styles.cardName}>{cardName || 'FULL NAME'}</Text>
            </View>
            <View>
              <Text style={styles.label}>Expiry</Text>
              <Text style={styles.expiry}>{expiry || 'MM/YY'}</Text>
            </View>
          </View>
        </View>

        {/* Payment form inputs with validation and formatting */}
        <View style={styles.form}>
          <Text style={[globalStyles.textRegular, styles.inputLabel, { color: theme.textPrimary }]}>Card Number</Text>
          <TextInput style={[styles.input, { borderColor: theme.tint, color: theme.textPrimary }]} placeholder="1234 5678 9012 3456" placeholderTextColor={theme.textSecondary} keyboardType="numeric" maxLength={19} value={formatCardNumber(cardNumber)} onChangeText={(text) => setCardNumber(text.replace(/\D/g, ''))} />

          <Text style={[globalStyles.textRegular, styles.inputLabel, { color: theme.textPrimary }]}>Cardholder Name</Text>
          <TextInput style={[styles.input, { borderColor: theme.tint, color: theme.textPrimary }]} placeholder="FULL NAME" placeholderTextColor={theme.textSecondary} value={cardName} onChangeText={setCardName} autoCapitalize="words" />

          {/* Expiry and CVV in a horizontal row layout */}
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={[globalStyles.textRegular, styles.inputLabel, { color: theme.textPrimary }]}>Expiry (MM/YY)</Text>
              <TextInput style={[styles.input, { borderColor: theme.tint, color: theme.textPrimary }]} placeholder="MM/YY" placeholderTextColor={theme.textSecondary} maxLength={5} keyboardType="numeric" value={expiry} onChangeText={(text) => setExpiry(formatExpiry(text))} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[globalStyles.textRegular, styles.inputLabel, { color: theme.textPrimary }]}>CVV</Text>
              <TextInput style={[styles.input, { borderColor: theme.tint, color: theme.textPrimary }]} placeholder="123" placeholderTextColor={theme.textSecondary} maxLength={4} keyboardType="numeric" secureTextEntry value={cvv} onChangeText={(text) => setCvv(text.replace(/\D/g, ''))} />
            </View>
          </View>

          <TouchableOpacity style={[styles.submitButton, { backgroundColor: theme.tint }]} onPress={handleSubmit}>
            <Text style={[globalStyles.textBold, styles.submitButtonText]}>Submit Payment</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 24, paddingBottom: 40 },
  title: { fontSize: 28, marginBottom: 24 },
  card: { borderRadius: 16, padding: 24, marginBottom: 32, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 10 },
  chip: { fontSize: 32, marginBottom: 24 },
  cardNumber: { fontSize: 24, letterSpacing: 3, color: '#fff', marginBottom: 36 },
  cardBottomRow: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { fontSize: 10, color: '#ddd', textTransform: 'uppercase', marginBottom: 6 },
  cardName: { color: '#fff', fontSize: 16 },
  expiry: { color: '#fff', fontSize: 16 },
  form: {},
  inputLabel: { marginBottom: 6 },
  input: { borderWidth: 2, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10, fontSize: 16, marginBottom: 18 },
  row: { flexDirection: 'row', marginBottom: 24 },
  submitButton: { paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  submitButtonText: { color: '#fff', fontSize: 18 },
});