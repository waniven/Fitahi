class SupplementsLog {
    constructor(
        id, // string/number, e.g. "log_12ab": Unique id for the log entry
        supplementPlanId, // reference to SupplementsPlan.id (so we can find which plan it belongs to)
        date, // string "YYYY-MM-DD", e.g. "2025-03-18": the calendar date of this entry
        status, // "scheduled" | "taken" | "skipped" | "missed": current state
        takenAt, // number/string, e.g. when user actually took it
    ) {
        this.id = id;
        this.supplementPlanId = supplementPlanId;
        this.date = date;
        this.status = status;
        this.takenAt = takenAt;
    }
}

export default SupplementsLog;