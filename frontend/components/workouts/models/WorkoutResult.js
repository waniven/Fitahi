
class WorkoutResult {
    constructor(
        id, // string/number, example: "qr_9c78": unique result id per completion
        totalTimeSpent, // int (1234): total elapsed time from start to end (work+rest+overtime)
        //totalTimeSpent: currently showing as HH:MM:SS
        completedExercises, // string[], example: ["Push Ups", "Pull Ups"]: names of exercises completed in order
        dateCompleted, //ISO 8601 string, example: "2025-03-18T07:43:12.511Z"
        workout_id, // string/number (Foreign Key)
    ) {
        this.id = id;
        this.totalTimeSpent = totalTimeSpent;
        this.completedExercises = completedExercises;
        this.dateCompleted = dateCompleted;
        this.workout_id = workout_id;

    }
}

export default WorkoutResult;