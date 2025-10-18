import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import LottieView from "lottie-react-native";
import { getRandomQuote } from "@/constants/utils/quotes";
import { updateStreak, getCompletedDays } from "@/constants/utils/streakLogic";

const screenHeight = Dimensions.get("window").height; //get device window

export default function StreakScreen({ onContinue }) {
  //state variables
  const [streak, setStreak] = useState(1); //current streak count
  const [quote, setQuote] = useState(""); //motivational quote
  const [showFlicker, setShowFlicker] = useState(false); //toggle fir animation
  const [completedDays, setCompletedDays] = useState([]); // array of dates per user completed streak days

  // animations ref
  const fadeAnim = useRef(new Animated.Value(1)).current; //fade in and out for entire screen
  const quoteFade = useRef(new Animated.Value(0)).current; //fade in for quote

  //initialsie streal, quote and completed days
  useEffect(() => {
    async function init() {
      const data = await updateStreak(); //get streak count from storage
      setStreak(data.count);
      setQuote(getRandomQuote()); //fetch random motivational quote

      const days = await getCompletedDays(); //fetch days that users open app
      setCompletedDays(days);

      setShowFlicker(true); // flicker immediately
      //quote fade in
      Animated.timing(quoteFade, {
        toValue: 1,
        duration: 600, //fade duration 
        useNativeDriver: true, //optimise animation
      }).start();
    }
    init();
  }, []);

//handle "continue" button press
  const handleContinue = () => {
    Animated.timing(fadeAnim, {
      toValue: 0, //fade out of screen
      duration: 500,
      useNativeDriver: true,
    }).start(() => onContinue?.()); //callback to parent when fade out is complete
  };
//streak days to display
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const todayIndex = new Date().getDay(); //current weekday index

  //helper - check if a given day during the week is completed
  const isDayCompleted = (index) => {
    //start from today
    const today = new Date();
    const todayIndex = today.getDay();

    //calculate date for this weeks day
    const dayDate = new Date ();
    dayDate.setDate(today.getDate() - todayIndex + index); //go to target day
    dayDate.setHours (0,0,0,0); //normalize to midnight

    //check if dayDate is in completedDays

    return completedDays.some (d => {
      const dDate = new Date(d);
      dDate.setHours(0, 0, 0, 0); //normalize to midnight
      return dDate.toDateString() === dayDate.toDateString(); 
    });
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Animation containter - fire effect*/}
      <View style={styles.animationContainer}>
        {!showFlicker ? (
          <LottieView
            source={require("../../assets/animations/fireBurst.json")}
            autoPlay
            loop={false}
            style={{ width: 180, height: 180 }}
          />
        ) : (
          <LottieView
            source={require("../../assets/animations/fireIdle.json")}
            autoPlay
            loop
            style={{ width: 180, height: 180 }}
          />
        )}
      </View>
       {/*display streak count*/}
      <Text style={styles.streakText}>🔥 {streak}-Day Streak!</Text>

      {/* display motivational quote with fade animation*/}
      <Animated.Text style={[styles.quote, { opacity: quoteFade }]}>
        {quote}
      </Animated.Text>

      {/* weekday circles*/}
      <View style={styles.daysRow}>
        {days.map((day, index) => {
          const completed = isDayCompleted(index); //check if day is completed
          const isToday = index === todayIndex; //check if today
          const yesterday = (todayIndex - 1 + 7) % 7;  //yesterday index
          const isYesterday = index === yesterday;


          return (
            <View key={index} style={styles.dayContainer}>
              {/* Day label */}
              <Text style={styles.dayLabel}>{day}</Text>
              {/* Circle representing day status */}
              <View
                style={[
                  styles.circle, //default cirlce
                  completed && styles.completedCircle, //if completed, fill blue
                  isToday && styles.todayCircle, //today styling of circle
                  isYesterday && styles.yesterdayCircle, //yesterday styling of circle
                ]}
              >
                {completed && <Text style={styles.checkMark}>✓</Text>}
              </View>
            </View>
          );
        })}
      </View>

      {/*continue button at the bottom*/}
      <View style={styles.bottomContainer}>
        <TouchableOpacity onPress={handleContinue} style={styles.continueButton}>
          <Text style={styles.continueText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#0A1128",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  animationContainer: {
    marginBottom: 30,
  },
  streakText: {
    fontFamily: "Montserrat_700Bold",
    color: "#fff",
    fontSize: 26,
    marginBottom: 10,
    textAlign: "center",
  },
  quote: {
    fontFamily: "Montserrat_400Regular",
    color: "#E0E0E0",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  daysRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 30,
  },
  dayContainer: {
    alignItems: "center",
    marginHorizontal: 5, 
  },
  dayLabel: {
    fontFamily: "Montserrat_500Medium",
    color: "#fff",
    fontSize: 12,
    marginBottom: 4,
  },
  circle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#555",
    alignItems: "center",
    justifyContent: "center",
  },
  yesterdayCircle: {
    borderColor: "#1E90FF80",
    backgroundColor: "#1E90FF20"
  },
  todayCircle: {
    borderColor: "#1E90FF",
    backgroundColor: "#1E90FF40",
  },
  completedCircle: {
    borderColor: "#1E90FF",
    backgroundColor: "#1E90FF",
  },
  checkMark: {
    color: "#000",
    fontWeight: "bold",
  },
  bottomContainer: {
    position: "absolute",
    bottom: 50, 
    width: "100%",
    alignItems: "center",
  },
  continueButton: {
    backgroundColor: "#1E90FF",
    borderRadius: 30,
    paddingVertical: 18,
    paddingHorizontal: 70,
  },
  continueText: {
    fontFamily: "Montserrat_600SemiBold",
    color: "#000",
    fontSize: 20,
  },
});
