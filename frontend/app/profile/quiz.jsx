import React, { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Picker,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import WheelPickerExpo from "react-native-wheel-picker-expo";
import { Colors } from "../../constants/Colors";
import { questions } from "../../constants/quizData";
import { Font } from "@/constants/Font";
import { saveQuiz, saveIntakeGoals, getAge } from "../../services/userService";
import CustomToast from "@/components/common/CustomToast";

const { width } = Dimensions.get("window");

export default function Quiz() {
  const theme = Colors["dark"];
  const router = useRouter();
  const flatListRef = useRef(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});

  const currentQuestion = questions[currentIndex];
  const isPicker = currentQuestion.type === "picker";
  const isLastQuestion = currentIndex === questions.length - 1;

const calculateCalories = async ({ weight, height, trainingDays, fitnessGoal }) => {
  const age = await getAge();

  const w = Number(weight);
  const h = Number(height);
  const a = Number(age);

  //return a default values missing
  if (!w || !h || !a || !trainingDays ){
    return 2300;
  }

  //factor based on how many days the user trains a week
  const numOfTrainingDays = String(trainingDays).replace(/\s+/g, ' ').trim();
  let factor = 0;

  if (numOfTrainingDays === '1 - 2') factor = 1.4;
  if (numOfTrainingDays === '3 - 4') factor = 1.55;
  if (numOfTrainingDays === '5 - 6') factor = 1.725;
  if (numOfTrainingDays === '7')  factor = 1.9;

  //modifyer based on fitness goal
  const goal = String(fitnessGoal || '').trim();
  let modifier = 0;

  if (goal === 'Lose weight') modifier = -250;
  if (goal === 'Improve endurance')  modifier = 0;
  if (goal === 'Build muscle') modifier = 250;

  return ((10 * w + 6.25 * h - 5 * a + 5) * factor) + modifier;
};


  // Go to next question
  const goNext = () => {
    if (currentIndex < questions.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
      setCurrentIndex(currentIndex + 1);
    } else {
      router.replace("/profile/thankyou");
    }
  };

  // Handle answer selection
  const handleAnswer = (questionId, option) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
    goNext();
  };

  // Skip button, last question triggers save
  const handleSkip = () => {
    if (isLastQuestion) {
      handleFinish();
    } else {
      goNext();
    }
  };

  // Send quiz answers to backend when done
  const handleFinish = async () => {
    //calculate intake goals and save them
    try{
      //calculate daily water based on weight, fall back avg recomended ammount
      const dailyWater = Number(answers.Weight) ? Number(answers.Weight) * 35 : 2500;

      //calculate intakeGoals
      const dailyCalories = await calculateCalories({
        weight: answers.Weight,
        height: answers.Height,
        trainingDays: answers.TrainingDays,
        fitnessGoal: answers.FitnessGoal,
      });

      //save intake goals
      await saveIntakeGoals({ dailyCalories, dailyWater });
    } catch (error) {
      console.error("Failed to save intakeGoals:", error);
        CustomToast.error(
        "Intake goal saving Failed",
        "See account settings to update."
      );
    }

    //save quiz and exit quiz screen
    try {
      await saveQuiz(answers);
      CustomToast.success("Quiz Completed!", "Your answers have been saved.");
      router.replace("/profile/thankyou");
    } catch (error) {
      console.error("Failed to update quiz:", error);
      CustomToast.error(
        "Quiz Submission Failed",
        "See account settings to update."
      );
    }
  };

  const renderItem = ({ item }) => {
    const slideIsPicker = item.type === "picker";

    return (
      <View style={[styles.slide, { width }]}>
        {/* Question Text */}
        <Text style={[styles.question, { color: "#fff" }]}>
          {item.question}
        </Text>

        {/* Picker Question */}
        {slideIsPicker ? (
          <View style={styles.pickerContainer}>
            {Platform.OS === "web" ? (
              <Picker
                selectedValue={answers[item.id] ?? item.min}
                onValueChange={(value) =>
                  setAnswers((prev) => ({ ...prev, [item.id]: value }))
                }
                style={{
                  height: 200,
                  width: 250,
                  color: "#fff",
                  backgroundColor: "#000",
                }}
              >
                {Array.from({ length: item.max - item.min + 1 }, (_, i) => {
                  const num = item.min + i;
                  return (
                    <Picker.Item
                      key={num}
                      label={`${num} ${item.unit}`}
                      value={num}
                    />
                  );
                })}
              </Picker>
            ) : (
              <WheelPickerExpo
                height={200}
                width={250}
                selectedStyle={{
                  borderColor: theme.tint,
                  borderWidth: 2,
                  borderRadius: 12,
                  backgroundColor: theme.tint,
                }}
                itemTextStyle={{
                  color: "#fff",
                  fontSize: 18,
                  fontFamily: Font.bold,
                }}
                items={Array.from(
                  { length: item.max - item.min + 1 },
                  (_, i) => {
                    const num = item.min + i;
                    return { label: `${num} ${item.unit}`, value: num };
                  }
                )}
                initialSelectedIndex={0}
                onChange={({ item: selected }) =>
                  setAnswers((prev) => ({ ...prev, [item.id]: selected.value }))
                }
              />
            )}
          </View>
        ) : (
          /* Multiple Choice Options */
          <View style={styles.optionsBox}>
            {item.options.map((option, idx) => {
              const isSelected = answers[item.id] === option;

              return (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionButton,
                    idx !== item.options.length - 1 && styles.optionDivider,
                    {
                      width: "100%",
                      backgroundColor: isSelected ? theme.tint : "#000",
                      borderRadius: 12,
                      paddingVertical: 16,
                      paddingHorizontal: 12,
                      borderWidth: isSelected ? 2 : 1,
                      borderColor: isSelected ? theme.tint : "#333",
                      shadowColor: isSelected ? theme.tint : "#000",
                      shadowOpacity: isSelected ? 0.4 : 0,
                      shadowRadius: isSelected ? 6 : 0,
                      shadowOffset: { width: 0, height: 2 },
                      justifyContent: "center",
                    },
                  ]}
                  onPress={() => handleAnswer(item.id, option)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.optionText,
                      { color: isSelected ? "#000" : "#fff" },
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: "#151924" }]}>
      {/* Progress Bar */}
      <View style={styles.progressBarBackground}>
        <View
          style={[
            styles.progressBarFill,
            {
              width: `${((currentIndex + 1) / questions.length) * 100}%`,
              backgroundColor: theme.tint,
            },
          ]}
        />
      </View>

      {/* Intro Text */}
      {currentIndex === 0 && (
        <View style={styles.headerContainer}>
          <Text style={[styles.headerTitle, { color: theme.tint }]}>
            We're happy to have you onboard 💪
          </Text>
          <Text style={[styles.headerSubtitle, { color: "#fff" }]}>
            Now, let's get to know you!
          </Text>
        </View>
      )}

      {/* Questions List */}
      <FlatList
        ref={flatListRef}
        data={questions}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        scrollEventThrottle={16}
      />

      {/* Bottom Buttons */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity
          style={[styles.skipButton, { backgroundColor: theme.tint }]}
          onPress={handleSkip}
        >
          <Text style={[styles.skipText, { color: "#000" }]}>Skip</Text>
        </TouchableOpacity>

        {isPicker && !isLastQuestion && (
          <TouchableOpacity
            style={[styles.nextButton, { backgroundColor: theme.tint }]}
            onPress={goNext}
          >
            <Text style={[styles.nextText, { color: "#000" }]}>Next</Text>
          </TouchableOpacity>
        )}

        {isLastQuestion && (
          <TouchableOpacity
            style={[styles.nextButton, { backgroundColor: theme.tint }]}
            onPress={handleFinish}
          >
            <Text style={[styles.nextText, { color: "#000" }]}>Done</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Intro Header
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    marginBottom: 8,
    fontFamily: Font.extrabold,
  },
  headerSubtitle: {
    fontSize: 18,
    lineHeight: 24,
    fontFamily: Font.semibold,
  },

  // Question Slide
  slide: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
    backgroundColor: "#151924",
  },
  question: {
    fontSize: 22,
    marginBottom: 20,
    fontFamily: Font.bold,
  },

  // Picker
  pickerContainer: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },

  // Multiple Choice Options
  optionsBox: {
    marginVertical: 20,
    width: "80%",
    alignSelf: "center",
  },
  optionButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  optionDivider: {
    marginVertical: 8,
  },
  optionText: {
    fontSize: 18,
    fontFamily: Font.bold,
  },

  // Progress Bar
  progressBarBackground: {
    height: 6,
    backgroundColor: "#555",
    width: "90%",
    alignSelf: "center",
    borderRadius: 3,
    marginVertical: 10,
  },
  progressBarFill: {
    height: 6,
    borderRadius: 3,
  },

  // Bottom Buttons
  bottomButtons: {
    width: "100%",
    alignItems: "center",
    position: "absolute",
    bottom: 30,
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 100,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  skipText: {
    fontSize: 16,
    fontFamily: Font.bold,
  },
  nextButton: {
    paddingVertical: 12,
    paddingHorizontal: 100,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  nextText: {
    fontSize: 16,
    fontFamily: Font.bold,
  },
});
