class Exercise {
    constructor(
        id, // string/number, example: "ex_8aaf": Unique identifier for the exercise
        name, // string, example: "Push ups": Label shown in the exercise input and during the workout
        numOfSets, // int, example: 3: How many work sets must be completed
        numOfReps, // int, example: 10: Display-only right now (see it as target per set)???
        duration, // duration per set, example: 10. 
        // Duration: How it works: if > 0: each set counts down; if 0: the timers counts up until user pauses
        weight, // int: Display-only
        rest, // int, example: 20: between sets and between exercises

    ) {
        this.id = id;
        this.name = name;
        this.numOfSets = numOfSets;
        this.numOfReps = numOfReps;
        this.duration = duration;
        this.weight = weight;
        this.rest = rest;
        
    }
}

export default Exercise;