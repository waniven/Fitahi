import { describe, it, expect, beforeEach, vi } from 'vitest';

//reload the module before each test so the in-module Map() store is fresh
async function loadModuleFresh() {
    // wipe module cache so each test gets a clean store/timers
    vi.resetModules();
    return await import('../src/helpers/otpStore'); //import optStore 
}

const OTP_TTL_MS = 15 * 60 * 1000; //15 min ttl

describe('password reset OTP flow', () => {
    beforeEach(() => {
        vi.useFakeTimers(); //control setTimeout + Date.now
        vi.setSystemTime(0); //start at t = 0
        vi.restoreAllMocks();
    });

    //issues reset code, makes sure that we can consume it only once
    it('Test code can only be used once', async () => {
        const { issuePasswordResetOtp, verifyPasswordResetOtp } = await loadModuleFresh();

        //generate code for an email
        const email = 'alice@example.com';
        const code = issuePasswordResetOtp(email);

        //check code is 9 digets
        expect(code).toMatch(/^\d{9}$/);

        //valid code should return email
        expect(verifyPasswordResetOtp(code)).toBe(email);

        //second use of code should return null as it has been used up
        expect(verifyPasswordResetOtp(code)).toBeNull();
    });

    //if code is wrong then return null
    it('null returned for wrong code', async () => {
        const { issuePasswordResetOtp, verifyPasswordResetOtp } = await loadModuleFresh();

        //generate code for an email
        const email = 'bob@example.com';
        issuePasswordResetOtp(email);
        
        //input invalid code
        expect(verifyPasswordResetOtp('123456789')).toBeNull();
    });

    //if code exsists and user generates new code, the exsisting code gets deleted
    it('returns null once the code has expired', async () => {
        //set timers 
        vi.useFakeTimers();
        vi.setSystemTime(0);

        const { issuePasswordResetOtp, verifyPasswordResetOtp } = await loadModuleFresh();

        //generate code for user
        const email = 'alice@example.com';
        const code = issuePasswordResetOtp(email);

        //15 min TTL
        const TTL = 15 * 60 * 1000;

        //set time to just past TTL to make the code invalid
        vi.setSystemTime(TTL + 1);

        //expired code should return null
        expect(verifyPasswordResetOtp(code)).toBeNull();
    });

    it('test code expires and is deleted', async () => {
        const { issuePasswordResetOtp, verifyPasswordResetOtp } = await loadModuleFresh();

        //generate code for user
        const email = 'dave@example.com';
        const code = issuePasswordResetOtp(email);

        //test that the scheduled timeout will delete code
        vi.advanceTimersByTime(OTP_TTL_MS + 1); //let the deletion timer fire
        
        //expected result should be null
        expect(verifyPasswordResetOtp(code)).toBeNull();
    });
});