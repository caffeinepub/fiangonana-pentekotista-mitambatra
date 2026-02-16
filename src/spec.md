# Specification

## Summary
**Goal:** Add a Chinese “Book Reader” module where users can manage structured book/lesson content and listen to each Chinese sentence via in-browser text-to-speech.

**Planned changes:**
- Add backend structured storage and CRUD/query methods for books/lessons and ordered sentences within the existing single-actor canister.
- Add React Query hooks for listing books/lessons, fetching a selected book/lesson, and creating/updating/deleting books/lessons and sentences with proper cache invalidation.
- Add a new Book Reader UI area with navigation and routes: a library/list view and a reader view that renders sentences in deterministic order and works on mobile.
- Implement per-sentence Web Speech API (speechSynthesis) playback with Play/Stop, optional autoplay-next, and basic rate/pitch controls, including a clear fallback when unavailable.
- Add an editor UI to create/edit books/lessons and add/edit/delete/reorder sentences, persisting changes via backend APIs with basic validation.
- Apply a cohesive reading-focused visual theme across the new Book Reader pages while fitting existing Tailwind/shadcn styling.
- Add and reference generated static image asset(s) for the Book Reader module from `frontend/public/assets/generated`.

**User-visible outcome:** Users can create/import their Chinese reading content as books/lessons, browse a library, open a reader that shows sentences in order, and play each sentence aloud with optional autoplay and voice controls.
