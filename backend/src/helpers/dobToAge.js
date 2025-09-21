function dobToAge(dob) {
    const now = new Date() //todays date

    const yNow = now.getUTCFullYear();
    const mNow = now.getUTCMonth();
    const dNow = now.getUTCDate();

    const yDob = dob.getUTCFullYear();
    const mDob = dob.getUTCMonth();
    const dDob = dob.getUTCDate();

    let age = yNow - yDob;

    //if current month or day is before birth month orday then -1
    if (mNow < mDob || (mNow === mDob && dNow < dDob)) {
        age -= 1;
    }
    return age;
}

module.exports = dobToAge;