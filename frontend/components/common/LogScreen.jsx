// components/common/LogScreen.jsx
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  StatusBar,
} from 'react-native';
import CustomButtonTwo from './CustomButtonTwo';
import CustomButtonThree from './CustomButtonThree';
import FloatingAIButton from '../../app/ai/FloatingAIButton';
import BottomNav from '../navbar/BottomNav';
import { Colors } from '../../constants/Colors';
import globalStyles from '../../styles/globalStyles';

/**
 * LogScreen - Reusable screen template with consistent layout and navigation
 * Provides standardized header, content area, and navigation components
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
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <StatusBar barStyle="light-content" backgroundColor={backgroundColor} />
      
      <View style={[globalStyles.container, { backgroundColor }, containerStyle]}>
        {/* Header section with optional back button and title */}
        <View style={styles.header}>
          {showBackButton && (
            <View style={styles.backButtonContainer}>
              <CustomButtonThree onPress={onBackPress} />
            </View>
          )}
          
          {title && (
            <Text style={[styles.title, globalStyles.welcomeText, { color: titleColor }, titleStyle]}>
              {title}
            </Text>
          )}
        </View>

        {/* Main content area with default or custom content */}
        <View style={styles.content}>
          {children ? (
            children
          ) : (
            <>
              {subtitle && (
                <Text style={[styles.subtitle, globalStyles.cardText, { color: subtitleColor }, subtitleStyle]}>
                  {subtitle}
                </Text>
              )}
              
              {showAddButton && (
                <View style={styles.addButtonContainer}>
                  <CustomButtonTwo onPress={onAddPress} />
                </View>
              )}
            </>
          )}
        </View>
      </View>

      <BottomNav />
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
    paddingTop: 40,
    paddingBottom: 40,
    position: 'relative',
  },
  backButtonContainer: {
    position: 'absolute',
    left: 0,
    top: 40,
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
    paddingBottom: 100,
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