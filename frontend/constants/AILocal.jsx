// ai/AILocal.jsx

export async function AILocal(prompt) {
  const text = prompt.toLowerCase();

  // randomised fitness tips
  const workoutTips = [
    "Try 3 sets of push-ups, squats, and planks today. Keep hydrated!",
    "How about 20 minutes of cardio followed by some core exercises?",
    "Don't forget leg day! Squats, lunges, and calf raises are great.",
    "Mix it up with a HIIT session: 30 sec high intensity, 30 sec rest."
  ];

  // Randomized nutrition tips
  const dietTips = [
    "Include lean proteins, whole grains, and plenty of vegetables.",
    "Stay hydrated and limit sugary drinks. Water is your bestest friend!",
    "Try to add healthy fats like avocado, nuts, fish, and olive oil.",
    "Balance your meals: protein + carbs + vegetables for energy."
  ];

  // Random helper
  const random = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // Fitness-related responses
  if (text.includes("workout") || text.includes("exercise")) {
    return random(workoutTips);
  }

  if (text.includes("diet") || text.includes("meal") || text.includes("nutrition")) {
    return random(dietTips);
  }

  if (text.includes("steps") || text.includes("activity")) {
    return "Great job! Aim for at least 7,0000 steps per day to stay active.";
  }

  //account questions
  if (text.includes("profile") || text.includes("account")) {
    return "You can update your profile in the account settings. Make sure your info is accurate!";
  }

  if (text.includes("password") || text.includes("login")) {
    return "To change your password, go to Settings > Account > password.";
  }

  // App guidance
  if (text.includes("how") && text.includes("use")) {
    return "Tap the floating AI button to start a chat, track workouts, and check your progress!";
  }

  // default hi message
  if (text.includes("hi") || text.includes("hello")) {
    return "Hi there! What can I help you with today?";
  }

  // fallback message
  return "Hi there! I'm here to help with fitness tips, nutrition advice, or your profile. Can you please clarify your question?";
}
