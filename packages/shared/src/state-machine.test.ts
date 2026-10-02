import { describe, it, expect } from 'vitest';
import {
  validateApplicationTransition,
  getAvailableNextStatuses,
} from './state-machine.js';
import { ApplicationStatus, Role } from './enums.js';

describe('Application State Machine', () => {
  it('should allow valid recruiter transitions', () => {
    // APPLIED -> SCREENING
    const res1 = validateApplicationTransition(
      ApplicationStatus.APPLIED,
      ApplicationStatus.SCREENING,
      Role.RECRUITER
    );
    expect(res1.allowed).toBe(true);

    // SCREENING -> INTERVIEW
    const res2 = validateApplicationTransition(
      ApplicationStatus.SCREENING,
      ApplicationStatus.INTERVIEW,
      Role.RECRUITER
    );
    expect(res2.allowed).toBe(true);

    // INTERVIEW -> OFFER
    const res3 = validateApplicationTransition(
      ApplicationStatus.INTERVIEW,
      ApplicationStatus.OFFER,
      Role.RECRUITER
    );
    expect(res3.allowed).toBe(true);

    // OFFER -> HIRED
    const res4 = validateApplicationTransition(
      ApplicationStatus.OFFER,
      ApplicationStatus.HIRED,
      Role.RECRUITER
    );
    expect(res4.allowed).toBe(true);
  });

  it('should reject invalid skip transitions (e.g. APPLIED -> HIRED)', () => {
    const res = validateApplicationTransition(
      ApplicationStatus.APPLIED,
      ApplicationStatus.HIRED,
      Role.RECRUITER
    );
    expect(res.allowed).toBe(false);
    expect(res.reason).toContain('Invalid transition');
  });

  it('should allow candidate ONLY to withdraw', () => {
    const withdrawRes = validateApplicationTransition(
      ApplicationStatus.APPLIED,
      ApplicationStatus.WITHDRAWN,
      Role.CANDIDATE
    );
    expect(withdrawRes.allowed).toBe(true);

    const screeningRes = validateApplicationTransition(
      ApplicationStatus.APPLIED,
      ApplicationStatus.SCREENING,
      Role.CANDIDATE
    );
    expect(screeningRes.allowed).toBe(false);
    expect(screeningRes.reason).toContain('Candidates can only withdraw');
  });

  it('should prevent recruiters from setting status directly to WITHDRAWN', () => {
    const res = validateApplicationTransition(
      ApplicationStatus.APPLIED,
      ApplicationStatus.WITHDRAWN,
      Role.RECRUITER
    );
    expect(res.allowed).toBe(false);
  });

  it('should not allow transitions from terminal states', () => {
    const resHired = validateApplicationTransition(
      ApplicationStatus.HIRED,
      ApplicationStatus.REJECTED,
      Role.RECRUITER
    );
    expect(resHired.allowed).toBe(false);

    const resRejected = validateApplicationTransition(
      ApplicationStatus.REJECTED,
      ApplicationStatus.OFFER,
      Role.RECRUITER
    );
    expect(resRejected.allowed).toBe(false);
  });
});
