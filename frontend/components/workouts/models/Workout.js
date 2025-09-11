class Workout {
    constructor(
        id, // string/number, example: "ex_8aaf": Unique workout ID
        name, // String, example: "Belly": shown in lists and headers
        type, // "cardio", "strength", "hypertrophy": selected one; used for labelling only
        selectedDays, // int[] from 0 - 6, example: [0, 2, 4]: Days of week this workout is planned for
        //SelectedDays: frontend mapping: 0=Mon, 1=Tue, etc
        exercises // Exercise[]: nested array
    ) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.selectedDays = selectedDays;
        this.exercises = exercises;
    }
}

export default Workout;