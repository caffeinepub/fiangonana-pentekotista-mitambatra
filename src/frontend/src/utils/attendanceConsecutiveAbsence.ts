import type { AttendanceRecord, Member } from '../backend';

export interface MemberWithConsecutiveAbsences {
  memberId: string;
  fullName: string;
}

/**
 * Detects members with 3 consecutive absences in the given attendance records.
 * Records are sorted by date ascending (oldest -> newest) before evaluation.
 */
export function detectConsecutiveAbsences(
  records: AttendanceRecord[],
  members: Member[]
): MemberWithConsecutiveAbsences[] {
  if (records.length < 3) return [];

  // Sort records by date ascending (oldest -> newest)
  const sortedRecords = [...records].sort((a, b) => a.date.localeCompare(b.date));

  // Build a map of member ID to member for quick lookup
  const memberMap = new Map(members.map(m => [m.id, m]));

  // Track consecutive absences per member
  const memberAbsenceStreaks = new Map<string, number>();

  // Initialize all members with 0 streak
  members.forEach(m => memberAbsenceStreaks.set(m.id, 0));

  // Process records in chronological order
  sortedRecords.forEach(record => {
    record.records.forEach(attendance => {
      const currentStreak = memberAbsenceStreaks.get(attendance.memberId) || 0;

      if (attendance.status === 'Absent') {
        memberAbsenceStreaks.set(attendance.memberId, currentStreak + 1);
      } else {
        // Reset streak on Present
        memberAbsenceStreaks.set(attendance.memberId, 0);
      }
    });
  });

  // Find members with exactly 3 or more consecutive absences
  const membersWithThreeAbsences: MemberWithConsecutiveAbsences[] = [];

  memberAbsenceStreaks.forEach((streak, memberId) => {
    if (streak >= 3) {
      const member = memberMap.get(memberId);
      if (member) {
        membersWithThreeAbsences.push({
          memberId: member.id,
          fullName: member.fullName,
        });
      }
    }
  });

  return membersWithThreeAbsences;
}
