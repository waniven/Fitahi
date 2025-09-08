// constants/quizData.js
export const questions = [

  { id: 'Goal', question: 'What is your main goal?', options: ['Lose weight', 'Build muscle', 'Endurance'] },
  {id: 'Experience', question:   'What is your trainingg level?', options: ['Beginner', 'intermediate', 'Advanced']},
  { id: 'Time training', question: 'how many days per week do you train?', options: ['1-2', '3-4', '5-6', '7'] },
  { id: 'Time', question: 'How long do you usually train?', options: ['10-15 min', '15-30 min', '30-45 min', '45-60 min','1-2 hours'] },
  {id:  'Preference', question: 'Do you prefer more upper body or lower body days?', options: ['Upper Body', 'Lower Body', 'Balanced'] },
  {id:  'Diet', question: 'What best decribes your diet?', options: ['No contrainsts','Vegan', 'Gluten-free', 'Dairy-free']},
  {id: 'Height', question: 'What is your height?', type: 'picker', min: 110, max: 220, unit: 'cm'},
  {id: 'Weight', question: 'What is your weight?', type: 'picker', min: 40, max: 200, unit: 'kg'},

];
