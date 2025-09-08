class Workout {
    constructor(
        id,
        name,
        type,
        selectedDays,
        exercises
    ) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.selectedDays = selectedDays;
        this.exercises = exercises;
    }
}

export default Workout;