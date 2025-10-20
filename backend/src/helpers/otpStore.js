import crypto from 'node:crypto';

const OTP_TTL_MS = 15 * 60 * 1000; //15 minutes time to live

//email = { digest, salt, expiresAt, timer }
const store = new Map();

// Generate random 9 digit code
function generateCode() {
    const n = crypto.randomInt(0, 1_000_000_000); // 0..999,999,999
    return String(n).padStart(9, '0');
}

//HMAC-SHA512
function hmac512(code, salt) {
    return crypto.createHmac('sha512', salt).update(code).digest('hex');
}

//Constant-time equality for Buffers
function ctEqualHex(aHex, bHex) {
    const a = Buffer.from(aHex, 'hex');
    const b = Buffer.from(bHex, 'hex');
    return a.length === b.length && crypto.timingSafeEqual(a, b);
}

//generate password reset code
export function issuePasswordResetOtp(email) {
    const code = generateCode();

    //delete any previous record for this email
    const prev = store.get(email);
    if (prev?.timer) clearTimeout(prev.timer);

    //hash reset code and set ttl 
    const salt = crypto.randomBytes(16).toString('hex');
    const digest = hmac512(code, salt);
    const expiresAt = Date.now() + OTP_TTL_MS;

    //timer deletes entry when tll is up
    const timer = setTimeout(() => store.delete(email), OTP_TTL_MS);
    store.set(email, { digest, salt, expiresAt, timer });

    return code; //should be emailed
}

/**
 * Verify by OTP code only.
 * Returns the associated email if found and valid; otherwise returns null.
 */
export function verifyPasswordResetOtp(code) {
    const now = Date.now();

    //delete exsisting entries
    for (const [email, rec] of store) {
        if (now > rec.expiresAt) {
            clearTimeout(rec.timer);
            store.delete(email);
        }
    }

    //find match by rehashing and testing hash
    for (const [email, rec] of store) {
        if (ctEqualHex(rec.digest, hmac512(code, rec.salt))) {
            clearTimeout(rec.timer);
            store.delete(email);
            return email; //return user email
        }
    }

    return null;
}
