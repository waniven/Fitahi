import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Dimensions, FlatList, Image, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import { Colors } from '../constants/Colors';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Welcome to Fitahi',
    subtitle: 'Get personalised plans and track your progress.',
    image: require('../assets/images/slide1.png'),
  },
  {
    id: '2',
    title: 'Track Your Workouts',
    subtitle: 'Never miss a day and monitor your performance.',
    image: require('../assets/images/slide2.png'),
  },

  {
    id: '4',
    title: 'Stay Hydrated',
    subtitle: 'Log your water intake easily.',
    image: require('../assets/images/slide2.png'),
  },
];

export default function Index() {
  const theme = Colors[useColorScheme() ?? 'light'];
  const router = useRouter();
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const renderItem = ({ item }) => (
    <View style={[styles.slide, { width, height, backgroundColor: theme.background }]}>
      {/* Text top-left */}
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: theme.tint }]}>{item.title}</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{item.subtitle}</Text>
      </View>

      {/* Image centered */}
      <Image source={item.image} style={styles.image} resizeMode="contain" />

      {/* Buttons at bottom */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.tint }]}
          onPress={() => router.push('/auth/signup')}
        >
          <Text style={[styles.buttonText, { color: theme.background }]}>Sign Up</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.backgroundAlt, marginTop: 8 }]}
          onPress={() => router.push('/auth/login')}
        >
          <Text style={[styles.buttonText, { color: theme.textPrimary }]}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/auth/login')} style={{ marginTop: 12 }}>
          <Text style={{ color: theme.textSecondary }}>Already have an account? Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);

          // Automatically go to quiz after last slide
          if (index === slides.length - 1) {
            setTimeout(() => router.replace('/profile/quiz'), 400); // slight delay for smoothness
          }
        }}
      />

      {/* Dots */}
      <View style={styles.dotsContainer}>
        {slides.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { backgroundColor: i === currentIndex ? theme.tint : theme.backgroundAlt },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  slide: { flex: 1, justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  textContainer: { alignSelf: 'flex-start', marginTop: 40 },
  title: { fontSize: 26, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 16 },
  image: { width: '100%', height: '50%' },
  bottomContainer: { width: '100%', alignItems: 'center', marginBottom: 40 },
  button: { width: '80%', padding: 16, borderRadius: 12, alignItems: 'center' },
  buttonText: { fontSize: 16, fontWeight: '700' },
  dotsContainer: { flexDirection: 'row', justifyContent: 'center', marginVertical: 12 },
  dot: { width: 12, height: 12, borderRadius: 6, marginHorizontal: 6 },
});
