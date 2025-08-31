class Workout {
    constructor(
        id,
        name,
        type,
        numOfSets,
        numOfReps,
        dates,
        duration,
        imageUrl
    ) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.numOfSets = numOfSets;
        this.numOfReps = numOfReps;
        this.dates = dates;
        this.duration = duration;
        this.imageUrl = imageUrl;
    }
}

export default Workout;