// Convert date of birth (dob) into age in years
function dobToAge(dob) {
    const now = new Date() // today's date

    // current year, month, day (UTC)
    const yNow = now.getUTCFullYear();
    const mNow = now.getUTCMonth();
    const dNow = now.getUTCDate();

    // dob year, month, day (UTC)
    const yDob = dob.getUTCFullYear();
    const mDob = dob.getUTCMonth();
    const dDob = dob.getUTCDate();

    let age = yNow - yDob;

    // adjust if current month/day is before birth month/day
    if (mNow < mDob || (mNow === mDob && dNow < dDob)) {
        age -= 1;
    }

    return age; // final age
}

// export function for use in other files
module.exports = dobToAge;