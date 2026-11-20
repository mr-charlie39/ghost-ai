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
- **Feature 05: Prisma Schema & Data Layer** (`context/feature-specs/05-prisma (1).md`)
  - Configured Prisma 7 schema configuration with multi-file schema folder in `prisma7.config.ts`.
  - Created `prisma/models/project.prisma` containing `ProjectStatus` enum (`DRAFT`, `ARCHIVED`), `Project` model with Clerk `ownerId` mapping, `name`, optional `description`, `status`, `canvasJsonPath` for future blob storage, timestamps (`createdAt`, `updatedAt`), and indexes on `ownerId` and `createdAt`.
  - Created `ProjectCollaborator` model with relation to `Project` featuring cascade delete (`onDelete: Cascade`), collaborator `email`, `createdAt` timestamp, unique constraint on `[projectId, email]`, and indexes on `email` and `[projectId, createdAt]`.
  - Created `lib/prisma.ts` cached singleton client branching on `DATABASE_URL` (using Prisma Accelerate when starting with `prisma+postgres://`, otherwise direct `@prisma/adapter-pg` driver adapter), cached on `global` in development for hot reloads.
  - Successfully generated and applied the initial migration `20261119161138_init` to PostgreSQL and generated Prisma Client to `app/generated/prisma`.
  - Verified clean TypeScript checks (`npx tsc --noEmit`), clean lint (`npm run lint`), and successful Turbopack build (`npm run build`).
- **Feature 06: Backend Project API Routes** (`context/feature-specs/06-project-apis.md`)
  - Created REST API routes for project management:
    - `GET /api/projects`: lists current authenticated user's projects (using Clerk `ownerId`) ordered by `createdAt` descending.
    - `POST /api/projects`: creates new project with Clerk `userId` as `ownerId`, defaulting missing or empty name to `Untitled Project`, utilizing Prisma's cuid ID strategy.
    - `PATCH /api/projects/[projectId]`: renames project, validating input and enforcing strict ownership checks (`403` Forbidden if non-owner, `404` if not found).
    - `DELETE /api/projects/[projectId]`: deletes project with strict ownership checks (`403` Forbidden if non-owner, `404` if not found).
  - Configured `proxy.ts` middleware to ensure unauthenticated requests to `/api/*` return JSON `401 Unauthorized` instead of redirecting to `/sign-in`.
  - Maintained backend-only scope without wiring UI components prematurely.
  - Verified clean TypeScript checks (`npx tsc --noEmit`), clean lint (`npm run lint`), and successful Turbopack build (`npm run build`).

- **Feature 04: Project Dialogs & Editor Home** (`context/feature-specs/04-project-dialogs.md`)
  - Built `/editor` home screen with minimal layout (`Create a project or open an existing one` heading, description, and `New Project` button).
  - Created `components/editor/project-dialogs.tsx` establishing Create, Rename, and Delete dialogs adhering to dark workspace tokens (`bg-surface`, `border-surface-border`, `text-copy-primary`, `rounded-3xl` modal radius).
  - Added project item actions menu (rename, delete) visible only for owned projects and hidden for shared projects.
  - Implemented mobile backdrop scrim on `ProjectSidebar` and removed closed-sidebar controls from keyboard navigation (`aria-hidden` and `inert`).
  - Preserved ordinary rename submission while ignoring Enter during IME composition.
- **Feature 07: Wire Editor Home & Project APIs** (`context/feature-specs/07-wire-editor-home.md`)
  - Created server-side data helper in `lib/projects.ts` (`getUserProjects`, `getOwnedProjects`, `getSharedProjects`, `getProjectById`) fetching owned projects by Clerk `userId` and shared projects by user email addresses via Prisma.
  - Updated `/editor` home page server component (`app/editor/page.tsx`) to fetch owned and shared projects server-side and pass both lists down to `EditorLayout` and `ProjectSidebar` with no client-side fetching for initial load.
  - Created workspace route server component in `app/editor/[projectId]/page.tsx` verifying project existence, providing `activeProjectId`, and displaying project name in navbar.
  - Extended `lib/slug.ts` with `generateShortSuffix` and `generateRoomId` to align project ID and Liveblocks room ID.
  - Updated `POST /api/projects` in `app/api/projects/route.ts` to accept pre-generated room ID, keeping the database primary key and Liveblocks room ID aligned.
  - Created `hooks/use-project-actions.ts` (`useProjectActions`) managing:
    - Create dialog state, project name input, short random suffix generation, live room ID preview, calling `POST /api/projects`, and navigating to the new workspace (`/editor/[projectId]`).
    - Rename dialog state, prefilling current project name, calling `PATCH /api/projects/[id]`, and calling `router.refresh()`.
    - Delete dialog state, showing target project name, calling `DELETE /api/projects/[id]`, redirecting to `/editor` if deleting the active workspace, or calling `router.refresh()`.
  - Wired `useProjectActions` to `EditorLayout`, `ProjectSidebar`, and `ProjectDialogs`:
    - Create dialog displays live "Room ID Preview".
    - Rename dialog pre-fills current project name.
    - Delete dialog displays project name and destructive confirmation.
    - Project items in `ProjectSidebar` navigate to `/editor/[projectId]` on click.
  - Resolved Turbopack build optimization for Tailwind CSS v4 in `next.config.ts` via `@tailwindcss/turbopack` loader rules.
  - Verified clean TypeScript checks (`npx tsc --noEmit`), clean lint (`npm run lint`), and successful Turbopack build (`npm run build`).

## In Progress

- Next feature unit preparation.

## Next Up

- Canvas setup and real-time collaboration foundations (Feature 08).

## Open Questions

- None.

## Architecture Decisions

- Configured Tailwind v4 with PostCSS plugin (`@tailwindcss/postcss`) and `@theme inline` mapping in `globals.css` for dark-only theme tokens (`--bg-base`, `--bg-surface`, `--text-copy-primary`, etc.) as defined in `ui-context.md`.
- Bound shadcn semantic variables (`--background`, `--foreground`, `--card`, `--primary`, `--border`, etc.) directly to dark theme tokens in both `:root` and `.dark`.
- Followed Next.js 16 file convention by placing `proxy.ts` at the root with `clerkMiddleware`, exporting default handler and registering matcher without calling deprecated `createRouteMatcher`.
- Set `export const instant = false` on dynamic / client-hook pages (`/`, `/editor`, `/sign-in`, `/sign-up`) to opt them out of instant-navigation validation when accessing runtime auth data during prerendering. Partial Prefetching (PPR) is configured separately via the `partialPrefetching` config flag and `prefetch` route segment exports.
- Enforced resource-based auth protection directly in server components (`/` and `/editor`) alongside proxy route protection.
- Configured Prisma 7 with schema folder support in `prisma7.config.ts`, generating type-safe Prisma Client to `app/generated/prisma`.
- Implemented singleton pattern in `lib/prisma.ts` with connection branching between Prisma Accelerate (`prisma+postgres://`) and direct PostgreSQL connection via `@prisma/adapter-pg`.
- Configured REST endpoints in `app/api/projects/` handling list, create, rename, and delete with defense-in-depth security: middleware-level 401 response for unauthenticated `/api/*` requests and handler-level ownership validation (403 Forbidden for non-owner mutations).

## Session Notes

- Feature 01, Feature 02, Feature 03, Feature 04, Feature 05, Feature 06, and Feature 07 completed and verified end-to-end.
