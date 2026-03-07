## Packages
canvas-confetti | Celebration effect for perfect quiz scores
@types/canvas-confetti | TypeScript types for canvas-confetti
framer-motion | Page transitions and flashcard flip animations
date-fns | Formatting relative dates for study sessions

## Notes
- Using Replit Auth; unauthenticated users should see the Landing page and authenticate via `/api/login`.
- Sidebar uses Shadcn UI primitives but is customized for a modern, student-friendly aesthetic.
- The AI endpoints (`/api/notes/:id/summary`, etc.) might take a few seconds; using generous loading animations.
- Tailwind config should define `font-display` and `font-sans`.
