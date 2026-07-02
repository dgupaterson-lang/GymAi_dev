export { api, API_URL, setOnAuthFailure } from './client';
export {
  register,
  login,
  refresh,
  logout,
  getMe,
  patchProfile,
} from './auth';
export {
  getToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from './tokens';
export type {
  User,
  UserProfile,
  LoginResponse,
  RegisterPayload,
  ProfilePatch,
} from './types';
export {
  listCoachedPrograms,
  getProgram,
  enroll,
  myEnrollments,
  getEnrollment,
  logSession,
  coachPrograms,
  createCoachProgram,
  programAdherents,
} from './programs';
export type {
  Exercise,
  ExercisePrescription,
  ProgramDay,
  ProgramKind,
  Program,
  EnrollmentStatus,
  Enrollment,
  Adherent,
  CreateProgramPayload,
  ProgramDayInput,
  PrescriptionInput,
} from './programs';
export {
  createInvitation,
  resolveInvitation,
  acceptInvitation,
} from './invitations';
export type {
  Invitation,
  ResolvedInvitation,
  CreateInvitationPayload,
  InvitationKind,
  InvitationStatus,
  InvitationTargetType,
} from './invitations';
