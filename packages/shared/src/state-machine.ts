import { ApplicationStatus, Role } from './enums.js';

export const VALID_APPLICATION_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  [ApplicationStatus.APPLIED]: [
    ApplicationStatus.SCREENING,
    ApplicationStatus.REJECTED,
    ApplicationStatus.WITHDRAWN,
  ],
  [ApplicationStatus.SCREENING]: [
    ApplicationStatus.INTERVIEW,
    ApplicationStatus.REJECTED,
    ApplicationStatus.WITHDRAWN,
  ],
  [ApplicationStatus.INTERVIEW]: [
    ApplicationStatus.INTERVIEW, // Next interview round
    ApplicationStatus.OFFER,
    ApplicationStatus.REJECTED,
    ApplicationStatus.WITHDRAWN,
  ],
  [ApplicationStatus.OFFER]: [
    ApplicationStatus.HIRED,
    ApplicationStatus.REJECTED,
    ApplicationStatus.WITHDRAWN,
  ],
  [ApplicationStatus.HIRED]: [],
  [ApplicationStatus.REJECTED]: [],
  [ApplicationStatus.WITHDRAWN]: [],
};

export interface TransitionCheckResult {
  allowed: boolean;
  reason?: string;
}

export function validateApplicationTransition(
  from: ApplicationStatus,
  to: ApplicationStatus,
  userRole: Role
): TransitionCheckResult {
  if (from === to && from !== ApplicationStatus.INTERVIEW) {
    return { allowed: false, reason: `Application is already in status ${from}` };
  }

  const allowedTargets = VALID_APPLICATION_TRANSITIONS[from] || [];
  if (!allowedTargets.includes(to)) {
    return {
      allowed: false,
      reason: `Invalid transition from ${from} to ${to}`,
    };
  }

  // Role-specific constraints
  if (userRole === Role.CANDIDATE) {
    if (to !== ApplicationStatus.WITHDRAWN) {
      return {
        allowed: false,
        reason: 'Candidates can only withdraw their application',
      };
    }
  }

  if (userRole === Role.RECRUITER) {
    if (to === ApplicationStatus.WITHDRAWN) {
      return {
        allowed: false,
        reason: 'Recruiters cannot withdraw a candidate application directly',
      };
    }
  }

  return { allowed: true };
}

export function getAvailableNextStatuses(
  current: ApplicationStatus,
  userRole: Role
): ApplicationStatus[] {
  const allowed = VALID_APPLICATION_TRANSITIONS[current] || [];
  if (userRole === Role.CANDIDATE) {
    return allowed.filter((s) => s === ApplicationStatus.WITHDRAWN);
  }
  if (userRole === Role.RECRUITER) {
    return allowed.filter((s) => s !== ApplicationStatus.WITHDRAWN);
  }
  return allowed;
}
