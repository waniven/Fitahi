import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Dimensions, FlatList, Image, StyleSheet, Text, useColorScheme, View } from 'react-native';
import CustomButton from '../components/common/CustomButton';
import { Colors } from '../constants/Colors';
import globalStyles from '../styles/globalStyles';


// Get device dimensions for responsive design
const { width, height } = Dimensions.get('window');

/**
 * Onboarding slides data
 * Each slide contains an ID, subtitle, and optional title/image for other slides
 */
const slides = [
  {
    id: '1',
    subtitle: 'Your Journey Begins Here', // Main tagline 
  },
  {
    id: '2',
    title: 'Track Your Workouts',
    subtitle: 'Never miss a day and monitor your performance.',
    image: require('../assets/images/slide2.png'),
  },
  {
    id: '3',
    title: 'Stay Hydrated',
    subtitle: 'Log your water intake easily.',
    image: require('../assets/images/slide2.png'),
  },
];

/**
 * Index - Main onboarding screen component
 * Features horizontal swipeable slides with auto-navigation to quiz after completion
 */
export default function Index() {
  // Get current theme colors based on device color scheme
  const theme = Colors[useColorScheme() ?? 'light'];
  const router = useRouter(); // Navigation router from expo-router
  const flatListRef = useRef(null); // Reference to FlatList for programmatic control
  const [currentIndex, setCurrentIndex] = useState(0); // Track current slide index

  /**
   * Renders individual slide content based on slide ID
   * @param {Object} item - Individual slide data object
   * @returns {JSX.Element} Rendered slide component
   */
  const renderItem = ({ item }) => {
    // Special layout for the first slide (welcome screen with logo)
    if (item.id === '1') {
      return (
        <View style={[styles.slide, { width, height, backgroundColor: theme.background }]}>
          {/* Main content area - logo and tagline */}
          <View style={styles.mainContent}>
            {/* Fitahi Logo - includes "FITAHI Get fit — together." text in the image */}
            <Image 
              source={require('../assets/images/Fitahi Logo v2 white.png')} 
              style={styles.logo} 
              resizeMode="contain" 
            />
            
            {/* Journey begins here tagline */}
            <Text style={[styles.subtitle, { color: theme.tint }]}>
              {item.subtitle}
            </Text>
          </View>

          {/* Bottom action buttons */}
          <View style={styles.bottomContainer}>
            <CustomButton
              title="Sign Up"
              onPress={() => router.push('/auth/signup')}
              size="large"
              style={styles.buttonSpacing}
            />

            <CustomButton
              title="Log In"
              onPress={() => router.push('/auth/login')}
              size="large"
              style={styles.buttonSpacing}
            />
          </View>
        </View>
      );
    }

    // Standard layout for feature showcase slides (slides 2 and 3)
    return (
      <View style={[styles.slide, { width, height, backgroundColor: theme.background }]}>
        {/* Feature title and description - positioned at top-left */}
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: theme.tint }]}>{item.title}</Text>
          <Text style={[styles.slideSubtitle, { color: theme.textSecondary }]}>{item.subtitle}</Text>
        </View>

        {/* Feature illustration - centered on screen */}
        <Image source={item.image} style={styles.image} resizeMode="contain" />

        {/* Action buttons - consistent across all slides */}
        <View style={styles.bottomContainer}>
          <CustomButton
            title="Sign Up"
            onPress={() => router.push('/auth/signup')}
            size="large"
            style={styles.buttonSpacing}
          />

          <CustomButton
            title="Log In"
            onPress={() => router.push('/auth/login')}
            size="large"
            style={styles.buttonSpacing}
          />
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Horizontal scrollable onboarding slides */}
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal={true} // Enable horizontal scrolling
        pagingEnabled={true} // Snap to each slide
        showsHorizontalScrollIndicator={false} // Hide scroll indicator
        onMomentumScrollEnd={(e) => {
          // Calculate current slide index based on scroll position
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);

          // Auto-navigate to quiz after viewing the last slide
          if (index === slides.length - 1) {
            setTimeout(() => router.replace('/profile/quiz'), 400); // Small delay for smooth UX
          }
        }}
      />

      {/* Slide progress indicators (dots) */}
      <View style={styles.dotsContainer}>
        {slides.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { 
                // Highlight current slide dot with primary color
                backgroundColor: i === currentIndex ? theme.tint : theme.backgroundAlt 
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Base slide container - full screen with centered alignment
  slide: { 
    flex: 1, 
    alignItems: 'center', 
    padding: 20,
    justifyContent: 'center', // Center content vertically
  },
  
  // Welcome slide (slide 1) content container
  mainContent: {
    alignItems: 'center',
    width: '100%',
    marginBottom: 60, // Space between tagline and buttons
  },
  
  // Fitahi logo with exact design specifications (345 x 167 pixels)
  logo: {
    width: 345,
    height: 167,
    marginBottom: 30,
  },
  
  // Feature slides text container - positioned at top-left
  textContainer: { 
    alignSelf: 'flex-start', 
    marginTop: 40 
  },
  
  // Feature slide titles - using global bold font
  title: { 
    ...globalStyles.textBold, // Apply global Montserrat Bold font
    fontSize: 26, 
    marginBottom: 8 
  },
  
  // Welcome slide tagline with exact design specifications (412 x 30 pixels)
  subtitle: { 
    ...globalStyles.textRegular, // Apply global Montserrat Regular font
    fontSize: 25,
    textAlign: 'center',
    width: 412,
    height: 30,
    lineHeight: 30, // Ensures vertical centering within the specified height
  },
  
  // Feature slide descriptions - using global regular font
  slideSubtitle: {
    ...globalStyles.textRegular, // Apply global Montserrat Regular font
    fontSize: 16,
  },
  
  // Feature illustration images - responsive sizing
  image: { 
    width: '100%', 
    height: '50%' 
  },
  
  // Bottom button container - positioned closer to content
  bottomContainer: { 
    width: '100%', 
    alignItems: 'center', 
    paddingHorizontal: 20,
  },
  
  // Individual button spacing within the container
  buttonSpacing: {
    marginVertical: 6,
    width: '100%',
  },
  
  // Slide progress indicator container
  dotsContainer: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
  },
  
  // Individual progress dots
  dot: { 
    width: 12, 
    height: 12, 
    borderRadius: 6, // Makes dots circular
    marginHorizontal: 6 
  },
});