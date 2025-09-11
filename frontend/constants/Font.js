import { StyleSheet } from 'react-native';

// Base families
export const Font = {
  regular: 'Montserrat_400Regular',
  semibold: 'Montserrat_600SemiBold',
  bold: 'Montserrat_700Bold',
  extrabold: 'Montserrat_800ExtraBold',
};

// Reusable text “weights”
export const Type = StyleSheet.create({
  regular:   { fontFamily: Font.regular },
  semibold:  { fontFamily: Font.semibold },
  bold:      { fontFamily: Font.bold },
  extrabold: { fontFamily: Font.extrabold },
});

// Optional common variants
export const TextVariants = StyleSheet.create({
  h1:   { fontFamily: Font.extrabold, fontSize: 24 },
  h2:   { fontFamily: Font.bold,      fontSize: 20 },
  body: { fontFamily: Font.regular,   fontSize: 16 },
  caption: { fontFamily: Font.regular, fontSize: 12 },
});