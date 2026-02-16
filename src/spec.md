# Specification

## Summary
**Goal:** Notify the user in-app when a member reaches 3 consecutive absences in the currently selected section.

**Planned changes:**
- On Attendance (Presence) screen save (create/update attendance record), evaluate each member’s most recent attendance records for the selected section in chronological order (oldest -> newest) to detect 3 consecutive Absents.
- When a member’s last 3 consecutive records are Absent, display an in-app notification using the exact message template: "Deraina Jesosy, mila mamangy an'i <member name> ianareo Komity. Mifalia ao amin'ny Tompo." with <member name> replaced by the member’s full name.
- Handle cases where multiple members meet the condition by showing a notification per member (or one notification that clearly lists each affected member) without crashing, and show no notification when the streak is <3 or broken by Present.

**User-visible outcome:** After saving attendance for a section, the app will immediately show an in-app notification for any member who has just reached 3 consecutive absences, using the specified message template.
