class SupplementsPlan {
    constructor(
        id, // string/number, e.g. "supp_12ab": Unique supplement plan ID
        name, // string, e.g. "Creatine Monohydrate": shown in lists
        dosage, // string, e.g. "5g": display-only label in lists
        timeOfDay, // string, e.g. "08:00": planned time
        selectedDays, // int[] from 0 - 6, example: [0, 2, 4]: Days of week this supplement is planned for
        //SelectedDays: frontend mapping: 0=Mon, 1=Tue, etc
        logs, // SupplementsLog[]: nested array of day-based entries
    ) {
        this.id = id;
        this.name = name;
        this.dosage = dosage;
        this.timeOfDay = timeOfDay;
        this.selectedDays = selectedDays;
        this.logs = logs;
    }
}

export default SupplementsPlan;