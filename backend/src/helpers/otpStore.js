// otpResetStore.js
import crypto from 'node:crypto';

const OTP_TTL_MS = 15 * 60 * 1000; //15 minutes
const MAX_ATTEMPTS = 5;

//key: email -> { hash, salt, expiresAt, attemptsLeft, timer }
const store = new Map();

//generate random 9 diget code
function generateCode() {
    const n = crypto.randomInt(0, 1_000_000_000); // 0 to 999,999,999
    return String(n).padStart(9, '0'); //keeps leading zeros
}

//sha512 hash 
function hash(code, salt) {
    return crypto.createHmac('sha512', salt).update(code).digest('hex');
}

//generate reset code that should be emailed
export function issuePasswordResetOtp(email) {
    const code = generateCode();

    //clear map of previous recovery keys
    const prev = store.get(email);
    if (prev?.timer) clearTimeout(prev.timer);

    //hash reset code and set expire time
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = hash(code, salt);
    const expiresAt = Date.now() + OTP_TTL_MS;

    //timer removes entry when time is up 
    const timer = setTimeout(() => store.delete(email), OTP_TTL_MS);
    store.set(email, { hash, salt, expiresAt, attemptsLeft: MAX_ATTEMPTS, timer });

    return code; //code to email
}

export function verifyPasswordResetOtp(email, code) {
    const rec = store.get(email);

    //missing token
    if (!rec) {
        return { ok: false, reason: 'expired_or_missing' };
    }

    //expired token
    if (Date.now() > rec.expiresAt) {
        clearTimeout(rec.timer);
        store.delete(email);
        return { ok: false, reason: 'expired_or_missing' };
    }

    //no attempts left
    if (rec.attemptsLeft <= 0) {
        clearTimeout(rec.timer);
        store.delete(email);
        return { ok: false, reason: 'too_many_attempts' };
    }

    //validate provided code against stored code
    const expected = Buffer.from(rec.hash, 'hex');
    const actual = Buffer.from(hash(code, rec.salt), 'hex');
    const match = expected.length === actual.length && crypto.timingSafeEqual(expected, actual);

    //code missmatch
    if (!match) {
        rec.attemptsLeft -= 1;
        return { ok: false, reason: 'invalid_code', attemptsLeft: rec.attemptsLeft };
    }

    //success, delete code
    clearTimeout(rec.timer);
    store.delete(email);
    return { ok: true };
}