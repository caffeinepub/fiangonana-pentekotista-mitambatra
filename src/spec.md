# Specification

## Summary
**Goal:** Fix the deployed draft startup crash and make the startup Retry action fully re-run initialization, while ensuring startup/loading copy is in English and failures surface useful (sanitized) diagnostics.

**Planned changes:**
- Harden app boot/initialization so actor/agent/access-control initialization cannot fail via unhandled errors; capture and surface initialization failures to the UI and log details to the console.
- Ensure startup does not block solely due to a missing/empty admin token (continue without it).
- Update the StartupErrorScreen Retry flow to re-initialize the backend actor and then re-run the profile query (not just refetching profile).
- Replace any French startup/loading UI text with English (e.g., change “Chargement...” to “Loading...”).
- Add minimal startup diagnostics on the error screen: a compact, user-safe error summary in the UI (no secrets), while logging full error details to the browser console.

**User-visible outcome:** Loading the draft URL no longer immediately shows the generic startup failure on a healthy network; if startup fails, users see a concise error summary and can tap Retry to re-attempt full initialization and recover from transient errors without a hard refresh.
