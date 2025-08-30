import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, useColorScheme } from 'react-native';
import { Colors } from '../../constants/Colors';

export default function SignUp() {
  const router = useRouter();
  const theme = Colors[useColorScheme() ?? 'light'];

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.textPrimary }]}>Sign Up (Prototype)</Text>
      <TextInput placeholder="Name" placeholderTextColor={theme.textSecondary} style={[styles.input, { borderColor: theme.tint, color: theme.textPrimary }]} />
      <TextInput placeholder="Email" placeholderTextColor={theme.textSecondary} style={[styles.input, { borderColor: theme.tint, color: theme.textPrimary }]} />
      <TextInput placeholder="Password" placeholderTextColor={theme.textSecondary} secureTextEntry style={[styles.input, { borderColor: theme.tint, color: theme.textPrimary }]} />

      <TouchableOpacity style={[styles.button, { backgroundColor: theme.tint }]} onPress={() => router.push('/profile/quiz')}>
        <Text style={[styles.buttonText, { color: theme.background }]}>Next → Quiz</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingTop: 60 },
  title: { fontSize: 28, marginBottom: 24, fontWeight: '700' },
  input: { borderWidth: 2, borderRadius: 10, padding: 14, fontSize: 16, marginBottom: 18 },
  button: { padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 12 },
  buttonText: { fontSize: 16, fontWeight: '700' },
});
