import type { ChallengeCategory, Cycle, EntityStatus, Location, Notification, PointsTransaction, Submission, Team, User } from "@/lib/types/crm";

const today = new Date("2026-09-02T10:00:00.000Z");

function iso(d: Date) {
  return d.toISOString();
}

const users: User[] = [
  {
    id: "u1",
    name: "Ahmed Khan",
    employeeId: "ABRE-00101",
    email: "ahmed.guard@abre.ae",
    role: "GUARD",
    teamId: "t1",
    locationId: "l1",
    status: "ACTIVE",
  },
  {
    id: "u2",
    name: "Sara Al Mazrouei",
    employeeId: "ABRE-00112",
    email: "sara.guard@abre.ae",
    role: "GUARD",
    teamId: "t1",
    locationId: "l1",
    status: "ACTIVE",
  },
  {
    id: "u3",
    name: "Omar Hassan",
    employeeId: "ABRE-00124",
    email: "omar.guard@abre.ae",
    role: "GUARD",
    teamId: "t2",
    locationId: "l2",
    status: "ACTIVE",
  },
  {
    id: "u4",
    name: "Fatima Noor",
    employeeId: "ABRE-00131",
    email: "fatima.guard@abre.ae",
    role: "GUARD",
    teamId: "t2",
    locationId: "l2",
    status: "INACTIVE",
  },
  // Team leader
  {
    id: "u5",
    name: "Noura Team Leader",
    employeeId: "ABRE-00220",
    email: "noura.tl@abre.ae",
    role: "TEAM_LEADER",
    teamId: "t1",
    locationId: "l1",
    status: "ACTIVE",
  },
];

const locations: Location[] = [
  { id: "l1", name: "Abu Dhabi HQ", status: "ACTIVE" },
  { id: "l2", name: "Yas Island", status: "ACTIVE" },
  { id: "l3", name: "Dubai Downtown", status: "INACTIVE" },
];

const teams: Team[] = [
  { id: "t1", name: "Gold Guards", locationId: "l1", leaderUserId: "u5", status: "ACTIVE" },
  { id: "t2", name: "Pearl Patrol", locationId: "l2", leaderUserId: null, status: "ACTIVE" },
];

function dayOffset(days: number) {
  const d = new Date(today);
  d.setDate(d.getDate() + days);
  return d;
}

const cycles: Cycle[] = [
  {
    id: "c1",
    name: "Cycle 3 (Move/3-week)",
    startDate: "2026-09-01",
    endDate: "2026-09-21",
    status: "ACTIVE",
    category: "MOVE",
    activities: [
      { id: "a1", name: "Walking route", points: 10, evidenceRequired: true },
      { id: "a2", name: "Gym / Fitness", points: 10, evidenceRequired: true },
      { id: "a3", name: "Stair climbing", points: 50, evidenceRequired: true },
    ],
  },
  {
    id: "c2",
    name: "Cycle 2 (Recognition/3-week)",
    startDate: "2026-08-01",
    endDate: "2026-08-21",
    status: "CLOSED",
    category: "RECOGNITION",
    activities: [
      { id: "a4", name: "Peer Recognition", points: 80, evidenceRequired: true },
      { id: "a5", name: "Team Appreciation", points: 60, evidenceRequired: true },
    ],
  },
];

const submissions: Submission[] = [
  {
    id: "s1",
    guardUserId: "u1",
    activityId: "a1",
    cycleId: "c1",
    activityName: "Walking route",
    submittedDate: "2026-09-02",
    status: "PENDING",
    evidenceUri: "/mock/evidence/walking-route.jpg",
    pointsIfApproved: 10,
    notes: "Quick route after shift.",
    reviewerId: null,
  },
  {
    id: "s2",
    guardUserId: "u2",
    activityId: "a2",
    cycleId: "c1",
    activityName: "Gym / Fitness",
    submittedDate: "2026-09-01",
    status: "APPROVED",
    evidenceUri: "/mock/evidence/gym-fitness.jpg",
    pointsIfApproved: 10,
    notes: "Completed 45 mins.",
    reviewerId: "u5",
  },
  {
    id: "s3",
    guardUserId: "u3",
    activityId: "a4",
    cycleId: "c2",
    activityName: "Peer Recognition",
    submittedDate: "2026-09-01",
    status: "REJECTED",
    evidenceUri: "/mock/evidence/peer-recognition.jpg",
    pointsIfApproved: 80,
    notes: "Wrong evidence.",
    reviewerId: "u5",
  },
];

const pointsTransactions: PointsTransaction[] = [
  {
    id: "p1",
    userId: "u2",
    submissionId: "s2",
    category: "MOVE",
    amount: 10,
    reason: "Approved: Gym / Fitness",
    createdAt: iso(dayOffset(-1)),
  },
];

const notifications: Notification[] = [
  {
    id: "n1",
    userId: null,
    title: "Submission reminders",
    body: "Team Leaders, please verify pending submissions before end of day.",
    createdAt: iso(dayOffset(-3)),
    readAt: null,
  },
  {
    id: "n2",
    userId: "u1",
    title: "Waiting for verification",
    body: "Your submission is awaiting review by your Team Leader.",
    createdAt: iso(dayOffset(-1)),
    readAt: null,
  },
];

export const db = {
  users,
  locations,
  teams,
  cycles,
  submissions,
  pointsTransactions,
  notifications,
};

