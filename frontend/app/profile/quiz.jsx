import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { questions } from '../../constants/quizData';

const { width } = Dimensions.get('window');

export default function Quiz() {
  const theme = Colors[useColorScheme() ?? 'light'];
  const router = useRouter();
  const flatListRef = useRef(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});

  const handleAnswer = (questionId, option) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));

    if (currentIndex < questions.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    } else {
      console.log('User answers:', { ...answers, [questionId]: option });
      router.replace('/home');
    }
  };

  const renderItem = ({ item }) => (
    <View style={[styles.slide, { width, backgroundColor: theme.background }]}>
      <Text style={[styles.question, { color: theme.textPrimary }]}>{item.question}</Text>
      {item.options.map((option) => {
        const isSelected = answers[item.id] === option;
        return (
          <TouchableOpacity
            key={option}
            style={[
              styles.optionButton,
              {
                backgroundColor: isSelected ? theme.tint : theme.backgroundAlt,
                borderWidth: isSelected ? 2 : 0,
                borderColor: theme.tint,
              },
            ]}
            onPress={() => handleAnswer(item.id, option)}
          >
            <Text
              style={[
                styles.optionText,
                { color: isSelected ? theme.background : theme.textPrimary },
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={[styles.headerTitle, { color: theme.tint }]}>Nice to meet you!</Text>
        <Text style={[styles.headerSubtitle, { color: theme.textPrimary }]}>
          Let's get to know you better. Please complete this short quiz 🙂
        </Text>
      </View>

      {/* Quiz questions */}
      <FlatList
        ref={flatListRef}
        data={questions}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        scrollEnabled={true} // allow swipe back and forth
      />

      {/* Progress dots */}
      <View style={styles.dotsContainer}>
        {questions.map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dot,
              { backgroundColor: currentIndex === index ? theme.tint : theme.backgroundAlt },
            ]}
            onPress={() => {
              flatListRef.current?.scrollToIndex({ index, animated: true });
              setCurrentIndex(index);
            }}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 80, // increased top margin to push header lower
    paddingBottom: 20,
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  },
  slide: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  question: { fontSize: 22, marginBottom: 20, fontWeight: '700', textAlign: 'center' },
  optionButton: { padding: 15, borderRadius: 10, marginVertical: 8, width: '80%', alignItems: 'center' },
  optionText: { fontSize: 18, textAlign: 'center', fontWeight: '700' },
  dotsContainer: { flexDirection: 'row', justifyContent: 'center', marginVertical: 12 },
  dot: { width: 12, height: 12, borderRadius: 6, marginHorizontal: 6 },
});
