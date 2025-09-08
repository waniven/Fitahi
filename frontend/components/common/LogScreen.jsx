// components/common/LogScreen.jsx
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import CustomButtonTwo from './CustomButtonTwo';
import CustomButtonThree from './CustomButtonThree';  // Remove '/common'
import FloatingAIButton from '../../app/ai/FloatingAIButton';  // Correct path
import { Colors } from '../../constants/Colors';
import globalStyles from '../../styles/globalStyles';

/**
 * LogScreen - Reusable screen component with customizable layout
 * Features a dark background with header, customizable content, action buttons,
 * bottom navigation, and floating AI button for consistency across log screens
 */

const LogScreen = ({
  title = '',
  subtitle = '',
  showBackButton = true,
  showAddButton = true,
  onBackPress = () => console.log('Back pressed'),
  onAddPress = () => console.log('Add pressed'),
  children,
  containerStyle,
  titleStyle,
  subtitleStyle,
  backgroundColor = Colors.dark.background,
  titleColor = Colors.dark.textPrimary,
  subtitleColor = Colors.dark.textPrimary,
}) => {
  const router = useRouter();
  const theme = Colors["dark"];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      {/* Status bar configuration for dark theme */}
      <StatusBar barStyle="light-content" backgroundColor={backgroundColor} />
      
      <View style={[globalStyles.container, { backgroundColor }, containerStyle]}>
        {/* Header Section */}
        <View style={styles.header}>
          {/* Back button positioned on the left */}
          {showBackButton && (
            <View style={styles.backButtonContainer}>
              <CustomButtonThree onPress={onBackPress} />
            </View>
          )}
          
          {/* Centered title */}
          {title && (
            <Text style={[styles.title, globalStyles.welcomeText, { color: titleColor }, titleStyle]}>
              {title}
            </Text>
          )}
        </View>

        {/* Main content area */}
        <View style={styles.content}>
          {children ? (
            // Render custom content if provided
            children
          ) : (
            // Default content layout
            <>
              {/* Centered subtitle */}
              {subtitle && (
                <Text style={[styles.subtitle, globalStyles.cardText, { color: subtitleColor }, subtitleStyle]}>
                  {subtitle}
                </Text>
              )}
              
              {/* Centered add button */}
              {showAddButton && (
                <View style={styles.addButtonContainer}>
                  <CustomButtonTwo onPress={onAddPress} />
                </View>
              )}
            </>
          )}
        </View>
      </View>

      {/* Bottom Navigation */}
      <View style={[globalStyles.bottomNav, { backgroundColor: "#fff" }]}>
        <TouchableOpacity style={globalStyles.navItem} onPress={() => router.push("/home/index")}>
          <Ionicons name="home-outline" size={26} color={theme.tint} />
          <Text style={[globalStyles.navText, { color: theme.tint }]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={globalStyles.navItem} onPress={() => router.push("/main/analytics")}>
          <Ionicons name="stats-chart-outline" size={26} color={theme.tint} />
          <Text style={[globalStyles.navText, { color: theme.tint }]}>Analytics</Text>
        </TouchableOpacity>

        <TouchableOpacity style={globalStyles.navItem} onPress={() => router.push("/main/supplements")}>
          <Ionicons name="medkit-outline" size={26} color={theme.tint} />
          <Text style={[globalStyles.navText, { color: theme.tint }]}>Supplements</Text>
        </TouchableOpacity>

        <TouchableOpacity style={globalStyles.navItem} onPress={() => router.push("/profile/AccountSettings")}>
          <Ionicons name="settings-outline" size={26} color={theme.tint} />
          <Text style={[globalStyles.navText, { color: theme.tint }]}>Settings</Text>
        </TouchableOpacity>
      </View>

      {/* Floating AI Button */}
      <FloatingAIButton />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
    paddingBottom: 40,
    position: 'relative',
  },
  backButtonContainer: {
    position: 'absolute',
    left: 0,
    top: 20,
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -80,
    paddingBottom: 100, // Add padding to account for bottom navigation
  },
  subtitle: {
    fontSize: 25,
    textAlign: 'center',
    marginBottom: 50,
    lineHeight: 30,
  },
  addButtonContainer: {
    marginTop: 20,
  },
});

export default LogScreen;