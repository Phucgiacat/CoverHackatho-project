# Repository Guidelines

## Project Structure & Module Organization
- `frontend/src/main.tsx` boots the React app and should remain thin, delegating layout setup to `src/App.tsx`.
- Group reusable UI into `frontend/src/components` (create the folder if missing) and store static assets under `frontend/src/assets`.
- Keep styling colocated: favor `ComponentName.css` files beside their components and import explicitly.
- Document noteworthy architectural choices in `frontend/README.md` to reduce onboarding friction.

## Build, Test, and Development Commands
```bash
npm install        # install dependencies (run once per clone or lockfile change)
npm run dev        # start Vite dev server with HMR at http://localhost:5173
npm run build      # type-check and emit optimized production bundle to dist/
npm run preview    # serve the production bundle locally for smoke testing
npm run lint       # run ESLint with the project config; fix issues before committing
```

## Coding Style & Naming Conventions
- Rely on ESLint (`eslint.config.js`) to enforce TypeScript + React best practices; run `npm run lint -- --fix` for autofixes.
- Follow Prettier-compatible formatting: 2-space indentation, single quotes, and trailing commas where valid.
- Use PascalCase for component files (`DashboardPanel.tsx`) and camelCase for hooks/utilities (`useDataFetch.ts`).
- Co-locate stateful logic in custom hooks under `frontend/src/hooks` and reuse them instead of duplicating effect code.

## Testing Guidelines
- Add component and hook specs under `frontend/src/__tests__` using Vitest + React Testing Library (install when tests are added).
- Test files should mirror the source path (`App.spec.tsx` for `App.tsx`) and focus on user-facing behavior over implementation details.
- Run `npm run lint` and `npm run preview` before opening PRs to catch regressions without a full CI pipeline.

## Commit & Pull Request Guidelines
- Write commits in the imperative mood (`Add header banner`), grouping related UI and style changes together.
- Reference issue IDs in commit bodies when applicable and capture design context or screenshots in the PR description.
- Before requesting review, ensure the branch is rebased on `main`, `npm run build` succeeds, and UI changes include annotated screenshots or short Loom demos.

## Frontend Experience Checklist
- Provide keyboard and screen-reader coverage for each new interactive element; use semantic HTML and aria attributes where needed.
- Validate responsive behavior at 320px, 768px, and 1280px breakpoints before marking a change ready for review.
- Centralize API endpoints and constants in a dedicated `frontend/src/config` module to simplify environment toggles.
