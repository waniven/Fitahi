import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Updates streak and returns streak info
 */
export async function updateStreak() {
  try {
    //get stored streak data from AsynStorage
    const storedData = await AsyncStorage.getItem("streakData");
    const today = new Date().toDateString(); //normalize todays date

    //if no streak data exits yet, intialise with todays date
    if (!storedData) {
      const newData = { count: 1,  //first day of streak
        lastActiveDate: today, //last active date is today
        completedDates: [today]  //mark today as completed
      };
      await AsyncStorage.setItem("streakData", JSON.stringify(newData));
      return newData;
    }

    const data = JSON.parse(storedData); //parse the stored streak data

    //if streak was updated today, return current data without change
    if (data.lastActiveDate === today) return data;

    //caluclate difference in days between last active day and today
    const lastDate = new Date(data.lastActiveDate);
    const diffDays = Math.floor(
      (new Date().getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    //update treak count
    if (diffDays === 1) {
      data.count += 1; // continued streak
    } else {
      data.count = 1; // missed a day
    }

    data.lastActiveDate = today; //update last active date to today

    // add today to completedDates array
    data.completedDates = data.completedDates || []; //ensure array exists
    data.completedDates.push(today);

    //save updated streak data to AsyncStorage
    await AsyncStorage.setItem("streakData", JSON.stringify(data));
    return data; //return updated streak info
  } catch (error) {
    console.error("Error updating streak: ", error);
    //fallback: return initial steak if error occurs
    return { count: 1, lastActiveDate: new Date().toDateString(), completedDates: [new Date().toDateString()] };
  }
}

/**
 * Checks if streak screen should show today
 */
export async function shouldShowStreakScreen() {
  const today = new Date().toDateString();
  const lastShown = await AsyncStorage.getItem("lastStreakScreenShown");

  if (lastShown === today) return false;

  await AsyncStorage.setItem("lastStreakScreenShown", today);
  return true;
}

/**
 * Returns an array of dates (YYYY-MM-DD) for the current week
 * used to mark completed or skipped days
 */
export async function getCompletedDays() {
  try {
    const storedData = await AsyncStorage.getItem("streakData");
    if (!storedData) return []; // if no dats return empty array

    const data = JSON.parse(storedData); //parse stored JSON
    return data.completedDates || []; //return completed dates array
  } catch (error) {
    console.error("Error fetching completed days:", error);
    return []; //fallback toempty array if error occurs
  }
}
