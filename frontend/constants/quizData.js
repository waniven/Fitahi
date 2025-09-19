export const questions = [
  { id: 'FitnessGoal', question: 'What is your main fitness goal?', options: ['Lose weight', 'Build muscle', 'Improve endurance'] },
  { id: 'FitnessLevel', question: 'How would you describe your fitness level?', options: ['Beginner', 'Intermediate', 'Advanced'] },
  { id: 'TrainingDays', question: 'How many days per week do you train?', options: ['1 - 2', '3 - 4', '5 - 6', '7'] },
  { id: 'TrainingTime', question: 'How long do you train per session?', options: ['10 - 15 min', '15 - 30 min', '30 - 45 min', '45 - 60 min', '1 - 2 hours'] },
  { id: 'Diet', question: 'Which of the following best describes your diet?', options: ['No constraints', 'Vegan', 'Gluten-free', 'Dairy-free'] },
  { id: 'Height', question: 'What is your height?', type: 'picker', min: 110, max: 220, unit: 'cm' },
  { id: 'Weight', question: 'What is your weight?', type: 'picker', min: 40, max: 200, unit: 'kg' },
];