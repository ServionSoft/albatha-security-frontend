export type CrmRole = "HR_ADMIN" | "MANAGEMENT" | "SUPER_USER";

export type EntityStatus = "ACTIVE" | "INACTIVE";

export type ChallengeCategory = "MOVE" | "PROGRESS" | "RECOGNITION";

export type CycleStatus = "DRAFT" | "ACTIVE" | "CLOSED";

export type SubmissionStatus = "PENDING" | "APPROVED" | "REJECTED";

export type User = {
  id: string;
  name: string;
  employeeId: string;
  email: string;
  role: CrmRole | "TEAM_LEADER" | "GUARD";
  teamId: string | null;
  locationId: string | null;
  status: EntityStatus;
};

export type Team = {
  id: string;
  name: string;
  locationId: string | null;
  leaderUserId: string | null;
  status: EntityStatus;
};

export type Location = {
  id: string;
  name: string;
  status: EntityStatus;
};

export type Cycle = {
  id: string;
  name: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  status: CycleStatus;
  category: ChallengeCategory;
  activities: Array<{ id: string; name: string; points: number; evidenceRequired: boolean }>;
};

export type Submission = {
  id: string;
  guardUserId: string;
  activityId: string;
  cycleId: string;
  activityName: string;
  submittedDate: string; // YYYY-MM-DD
  status: SubmissionStatus;
  evidenceUri: string | null;
  pointsIfApproved: number;
  notes?: string;
  reviewerId?: string | null;
};

export type PointsTransaction = {
  id: string;
  userId: string;
  submissionId: string | null;
  category: ChallengeCategory;
  amount: number;
  reason: string;
  createdAt: string; // ISO
};

export type Notification = {
  id: string;
  userId: string | null; // null = broadcast
  title: string;
  body: string;
  createdAt: string; // ISO
  readAt: string | null;
};

