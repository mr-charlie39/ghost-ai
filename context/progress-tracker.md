# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Phase 1: Foundation & Base Chrome

## Current Goal

- Next feature unit (Canvas setup, Liveblocks room integration, or Project management).

## Completed

- **Feature 01: Design System & UI Primitives** (`context/feature-specs/01-design-system.md`)
  - Configured shadcn/ui with Tailwind CSS v4 and `@tailwindcss/postcss`.
  - Installed `lucide-react`.
  - Added shadcn UI components: `Button`, `Card`, `Dialog`, `Input`, `Tabs`, `Textarea`, `ScrollArea` without modifying generated `components/ui/*` files.
  - Created `lib/utils.ts` with reusable `cn()` helper and verified Tailwind class merging.
  - Implemented dark-only theme tokens in `globals.css` and mapped Tailwind tokens via `@theme inline` per `context/ui-context.md`.
  - Ensured no default light styling appears by setting dark theme variables on both `:root` and `.dark` and applying `dark` class on `<html>`.
  - Verified clean builds (`npm run build`) with Turbopack and clean lint (`npm run lint`).
- **Feature 02: Editor Base Chrome** (`context/feature-specs/02-editor.md`)
  - Created `components/editor/editor-navbar.tsx` with fixed height (`h-14`), left, center, and right sections, sidebar toggle button switching `PanelLeftOpen` / `PanelLeftClose` icons according to `isSidebarOpen`, dark background (`bg-surface`), and subtle bottom border (`border-surface-border`).
  - Created `components/editor/project-sidebar.tsx` that floats above the canvas (`fixed` positioning, slide-in overlay from left with `translate-x-0` / `-translate-x-full`), `isOpen` prop support, header with `Projects` title and close button, shadcn `Tabs` with "My Projects" and "Shared" showing empty placeholder states, and full-width `New Project` button at bottom with `Plus` icon.
  - Created `components/editor/dialog-pattern.tsx` establishing the dialog pattern using dark workspace color tokens (`bg-surface`, `border-surface-border`, `text-copy-primary`, `text-copy-muted`, `rounded-3xl` modal radius) supporting `title`, `description`, and `footerActions`.
  - Created `components/editor/editor-layout.tsx` composing the full-viewport editor workspace (fixed `EditorNavbar`, floating `ProjectSidebar`, and central canvas area).
  - Replaced the Feature 01 mockup layout in `app/page.tsx` with the real `EditorLayout` component.
  - Verified clean TypeScript checks (`npx tsc --noEmit`), clean lint (`npm run lint`), and successful Turbopack build (`npm run build`).
- **Feature 03: Authentication** (`context/feature-specs/03-auth.md`)
  - Installed `@clerk/ui` dependency and imported `dark` theme from `@clerk/ui/themes`.
  - Wrapped root layout (`app/layout.tsx`) with `ClerkProvider` using Clerk's `dark` base theme and mapped appearance variables directly to existing CSS custom properties with no hardcoded colors.
  - Added `suppressHydrationWarning` on `<html>` and `<body>` in `app/layout.tsx` to eliminate hydration mismatch warnings from browser extension attributes (`data-gr-ext-installed`, etc.).
  - Implemented Next.js 16 `proxy.ts` at the project root using `clerkMiddleware`, redirecting `/` and protecting all non-public routes by default using direct path prefix checks without deprecated `createRouteMatcher`.
  - Configured `/` (`app/page.tsx`) and `/editor` (`app/editor/page.tsx`) with server-side resource-based auth checks redirecting unauthenticated users to `/sign-in`.
  - Created `/editor` route (`app/editor/page.tsx`) rendering `EditorLayout`.
  - Implemented minimal two-panel `AuthLayout` (`components/auth/auth-layout.tsx`) with compact logo, tagline, text-only feature list on large screens, form-only on small screens, no gradients or oversized cards, and CSS variables only.
  - Created sign-in (`app/sign-in/[[...sign-in]]/page.tsx`) and sign-up (`app/sign-up/[[...sign-up]]/page.tsx`) pages using Clerk's `<SignIn />` and `<SignUp />`.
  - Integrated Clerk's built-in `<UserButton />` into `EditorNavbar` right section (`components/editor/editor-navbar.tsx`).
  - Verified clean TypeScript checks (`npx tsc --noEmit`), clean lint (`npm run lint`), and successful Turbopack build (`npm run build`).

## In Progress

- None.

## Next Up

- Canvas setup and real-time collaboration foundations.

## Open Questions

- None.

## Architecture Decisions

- Configured Tailwind v4 with PostCSS plugin (`@tailwindcss/postcss`) and `@theme inline` mapping in `globals.css` for dark-only theme tokens (`--bg-base`, `--bg-surface`, `--text-copy-primary`, etc.) as defined in `ui-context.md`.
- Bound shadcn semantic variables (`--background`, `--foreground`, `--card`, `--primary`, `--border`, etc.) directly to dark theme tokens in both `:root` and `.dark`.
- Followed Next.js 16 file convention by placing `proxy.ts` at the root with `clerkMiddleware`, exporting default handler and registering matcher without calling deprecated `createRouteMatcher`.
- Set `export const instant = false` on dynamic / client-hook pages (`/`, `/editor`, `/sign-in`, `/sign-up`) to opt them out of instant-navigation validation when accessing runtime auth data during prerendering. Partial Prefetching (PPR) is configured separately via the `partialPrefetching` config flag and `prefetch` route segment exports.
- Enforced resource-based auth protection directly in server components (`/` and `/editor`) alongside proxy route protection.

## Session Notes

- Feature 01, Feature 02, and Feature 03 completed and verified end-to-end.
