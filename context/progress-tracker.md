# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Phase 1: Foundation & Base Chrome

## Current Goal

- Next feature unit (AI architecture generation).

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

- **Feature 08: Editor Workspace Shell & Access Control** (`context/feature-specs/08-editor-workspace-shell.md`)
  - Created server-side access helpers in `lib/project-access.ts` (`getCurrentIdentity`, `checkProjectAccess`) checking project existence and access permissions via owner or collaborator email.
  - Implemented `components/editor/access-denied.tsx` with centered layout, Lock icon, informative message, and back-to-projects link.
  - Built the `/editor/[roomId]` server component in `app/editor/[roomId]/page.tsx` redirecting unauthenticated users to `/sign-in` and showing `AccessDenied` for non-existent or unauthorized projects.
  - Extended `ProjectSidebar` to highlight the current active room in both owned and shared lists.
  - Updated `EditorLayout` to display project name in navbar, support navbar actions (Share button placeholder and AI sidebar toggle button), central canvas placeholder filling remaining space, and collapsible right sidebar placeholder for future AI chat.
  - Enhanced UI/UX across the editor chrome with technical dark aesthetics:
    - Added brand mark (`GHOST.AI` + icon badge) and glassmorphism backdrop blur to `EditorNavbar`.
    - Upgraded `EditorHome` with blueprint corner guides, ambient icon pulse, feature capability pills, and primary action glows.
    - Added instant workspace search/filtering by name and slug in `ProjectSidebar`, along with tab counts and active workspace indicator bars.
    - Created `WorkspaceCanvasPlaceholder` with interactive Room ID copy feedback, live connection status chips, and floating canvas controls preview.
    - Upgraded `ProjectDialogs` with Hash room preview labels and destructive warning callout styling.
  - Verified clean TypeScript checks (`npx tsc --noEmit`), clean lint (`npm run lint`), and successful Turbopack build (`npm run build`).

- **UI/UX Enhancement & Brand Identity Polish (AI Architecture Workspace)**
  - Designed official vector SVG brand assets (`components/brand/ghost-logo.tsx`, `components/brand/index.ts`):
    - `GhostLogoMark`: Interconnected distributed graph node geometry with cyan-to-violet linear gradient core and ambient glow.
    - `GhostLogo`: Wordmark paired with monospace engine badge (`v0.1`), scalable across navbar, auth views, and canvas screens.
  - Integrated brand identity into `EditorNavbar`, `AuthLayout`, `EditorHome`, and `AccessDenied`.
  - Upgraded AI Architect Drawer in `EditorLayout` with interactive prompt suggestion pills, functional input state with dispatch action toast, and live worker connection status indicator.
  - Upgraded `WorkspaceCanvasPlaceholder` with interactive "Copy Room ID" feedback, live Liveblocks presence indicator, and floating canvas control toolbar.
  - Enhanced `ProjectSidebar` with live search filter across owned and shared projects, project count badges, and glowing active-workspace accents.
  - Preserved 100% of underlying server/client architecture and zero-modification invariant on foundation UI primitives in `components/ui/*`.
  - Verified clean TypeScript checks (`npx tsc --noEmit`), clean lint (`npm run lint`), and successful Turbopack build (`npm run build`).

- **Feature 09: Share Dialog & Collaborator Management** (`context/feature-specs/09-share-dialog.md`)
  - Created `types/collaborator.ts` defining data contracts for `CollaboratorItem`, `ProjectOwnerItem`, and `CollaboratorsApiResponse`.
  - Implemented Clerk Backend API user enrichment in `lib/clerk-users.ts` (`enrichEmailsWithClerk`, `getOwnerInfoFromClerk`):
    - Queries Clerk backend for user profiles matching collaborator emails in batches of up to 100.
    - Resolves display names (`firstName` + `lastName` or `username`) and avatar images (`imageUrl`).
    - Falls back gracefully to email-only representation if the Clerk user does not exist or API calls encounter errors.
    - Retrieves workspace owner identity and display data via Clerk `ownerId`.
  - Created collaborator management REST API routes:
    - `GET /api/projects/[projectId]/collaborators`: Verifies user access (owner or collaborator membership), queries `ProjectCollaborator` records in Prisma, enriches with Clerk metadata, and returns `{ isOwner, owner, collaborators }`.
    - `POST /api/projects/[projectId]/collaborators`: Strictly enforces server-side project ownership (403 Forbidden for non-owners), validates email format, checks for duplicate invitations and owner self-invitation, stores `ProjectCollaborator` record in Prisma, enriches with Clerk, and returns status 201.
    - `DELETE /api/projects/[projectId]/collaborators/[collaboratorId]`: Strictly enforces server-side project ownership (403 Forbidden for non-owners), verifies project and collaborator records, deletes from Prisma, and returns success response.
    - `DELETE /api/projects/[projectId]/collaborators`: Additional flexible route accepting `collaboratorId` or `email` via query parameter or JSON body for client resilience.
  - Implemented `components/editor/share-dialog.tsx`:
    - Adheres to dark workspace color tokens (`bg-surface`, `border-surface-border`, `text-copy-primary`, `rounded-3xl` modal radius).
    - Project link section with one-click "Copy link" and 2-second temporary `Copied!` feedback.
    - Owners view:
      - Email invite input and submit button with loading spinner, validation, and inline success/error feedback.
      - Collaborator removal action with trash icon, loading state, and state update on completion.
      - Collaborators view:
        - Read-only banner indicating collaborator access.
        - Invite form and removal controls are hidden.
      - Member list displaying Owner row with Crown badge and Collaborator rows with avatar image (or letter-initial fallback), display name, email, and role badge.
    - Wired `ShareDialog` into `EditorLayout` and `app/editor/[roomId]/page.tsx`:
      - Workspace page passes `isOwner` prop down from `checkProjectAccess`.
      - Navbar `Share` button triggers `ShareDialog`.
    - Verified clean TypeScript checks (`npx tsc --noEmit`), clean lint (`npm run lint`), and successful production build (`npm run build`).

- **Feature 10: Liveblocks Realtime Collaboration Infrastructure** (`context/feature-specs/10-liveblocks-setup.md`)
  - Configured `liveblocks.config.ts` at the project root with strictly typed Liveblocks interfaces:
    - `Presence`: `cursor: { x: number; y: number } | null`, `isThinking: boolean`.
    - `UserMeta`: `id: string`, `info: { name: string; avatar: string; color: string }`.
    - Typed empty record structures for `Storage`, `RoomEvent`, `ThreadMetadata`, `RoomInfo` eliminating ESLint `no-empty-object-type` errors.
  - Installed `@liveblocks/node` dependency.
  - Created cached singleton Liveblocks node client in `lib/liveblocks.ts` using `globalThis` in development, with fallback placeholder key to ensure builds succeed when secret key is unset.
  - Implemented `getUserColor(userId)` in `lib/liveblocks.ts` deterministically mapping any Clerk user ID to a consistent high-contrast cursor color from a 10-color fixed palette (`USER_COLORS`).
  - Implemented `POST /api/liveblocks-auth` route (`app/api/liveblocks-auth/route.ts`):
    - Requires Clerk authentication (returns 401 if unauthenticated).
    - Verifies project access using existing access helper `checkProjectAccess` (returns 403 Forbidden for unauthorized access or missing projects).
    - Ensures the Liveblocks room exists using `liveblocks.getOrCreateRoom(room, { defaultAccesses: [], metadata: { projectId: room } })`.
    - Prepares user session token via `liveblocks.prepareSession` attaching user display name, avatar, and generated cursor color.
    - Grants room write permissions via `session.allow(room, session.FULL_ACCESS)`.
    - Authorizes session and returns the session token JSON response with appropriate status.
  - Updated `package.json` build script to invoke `next build` with Turbopack, resolving the Node 26.13.0 Webpack `WasmHash._updateWithBuffer` buffer crash.
  - Verified clean TypeScript checks (`npx tsc --noEmit`), clean lint (`npm run lint`), and successful production build (`npm run build`).

- **Feature 11: Base Collaborative Canvas** (`context/feature-specs/11-base-canvas.md`)
  - Defined shared canvas types in `types/canvas.ts`:
    - `CanvasNodeData` supporting `label: string`, `color?: string`, and `shape?: NodeShape`.
    - Custom node and edge contracts: `CanvasNode`, `canvasNode`, `CanvasEdge`, `canvasEdge`.
    - 6 supported node shapes (`NODE_SHAPES`) and 8 dark-mode calibrated color pairs (`NODE_COLORS`).
    - Default constants: `DEFAULT_NODE_COLOR = "#1F1F1F"`, `DEFAULT_NODE_TEXT_COLOR = "#EDEDED"`, `DEFAULT_EDGE_COLOR = "#06090C"`.
  - Built client-side canvas components in `components/canvas/`:
    - `CanvasWrapper` (`components/canvas/canvas-wrapper.tsx`): Sets up Liveblocks collaboration room via `LiveblocksProvider` with `authEndpoint="/api/liveblocks-auth"`, `RoomProvider` keyed by `roomId`, initial presence `{ cursor: null, isThinking: false }`, `CanvasErrorBoundary` for connection/room error handling, and `ClientSideSuspense` displaying `CanvasLoading`.
    - `CanvasView` (`components/canvas/canvas-view.tsx`): Controlled React Flow canvas wrapped in `ReactFlowProvider` and backed by `useLiveblocksFlow<CanvasNode, CanvasEdge>({ suspense: true, nodes: { initial: [] }, edges: { initial: [] } })`, featuring loose connection behavior (`connectionMode={ConnectionMode.Loose}`), `fitView`, dot-pattern background (`BackgroundVariant.Dots`), dark-styled `MiniMap`, and live multiplayer `Cursors`.
    - `CanvasErrorBoundary` (`components/canvas/canvas-error-boundary.tsx`): Robust React class error boundary capturing room/suspense exceptions with clear visual feedback, room badge, and reconnect action.
    - `CanvasLoading` (`components/canvas/canvas-loading.tsx`): Dark workspace loading indicator with animated brand mark and connection status.
    - `components/canvas/index.ts` re-exporting all canvas components.
  - Kept workspace route (`app/editor/[roomId]/page.tsx`) server-side with Clerk authentication, access control via `checkProjectAccess`, and server-fetched projects, mounting `CanvasWrapper` directly inside `EditorLayout`.
  - Adjusted `liveblocks.config.ts` storage typing to empty interface eliminating TS2741 required initialStorage constraint while maintaining strict ESLint compliance.
  - Verified clean TypeScript checks (`npx tsc --noEmit`), clean lint (`npm run lint` - 0 errors, 0 warnings), and successful Next.js production build (`npm run build`).

- **Engineering Repair & Runtime Verification** (`context/current-issues.md`)
  - **Issue 1 (Clerk Authentication API Error)**:
    - Diagnosed abort exception (`This operation was aborted`) originating from client lifecycle / prefetch stream cancellations on `currentUser()`.
    - Wrapped `getCurrentIdentity()` with React `cache()` to eliminate duplicate calls within the same server request.
    - Added resilient fallback using `clerkClient().users.getUser(userId)` when `currentUser()` is aborted or cancelled.
    - Replaced noisy abort stack traces with clean lifecycle notifications (`isAbortError`), ensuring transient client navigation cancels do not crash unrelated functionality.
    - Verified that Clerk publishable key (`pk_test_...`) and secret key (`sk_test_...`) belong to the exact same instance (`pro-griffon-714.clerk.accounts.dev` / `ins_3MGoYu2j8iWeGrt5pV7W6wyFZxj`).
  - **Issue 2 & 3 (Liveblocks Secret Key & Connection Failure)**:
    - Added `isLiveblocksConfigured()` helper to `lib/liveblocks.ts` checking for presence of valid keys starting with `sk_dev_` or `sk_prod_`.
    - Updated `POST /api/liveblocks-auth` to validate environment configuration before attempting Liveblocks API operations, returning descriptive JSON errors on missing or invalid keys.
    - Caught `LiveblocksError` during `liveblocks.getOrCreateRoom()` and returned structured 403 response without unhandled server crashes.
    - Enhanced `CanvasErrorBoundary` with an informative configuration notice providing direct links to the Liveblocks dashboard (`https://liveblocks.io/dashboard/apikeys`), actionable setup instructions for `.env.local`, and retry controls without crashing the parent editor workspace.
    - Updated `CanvasWrapper` to capture detailed HTTP error messages from `/api/liveblocks-auth` and display them in the error boundary.
  - **Issue 4 (Clerk & Liveblocks Integration Ordering)**:
    - Established strict separation of concerns in `app/api/liveblocks-auth/route.ts`:
      1. Authentication verification via Clerk (`getCurrentIdentity()`).
      2. Authorization check against Prisma database (`checkProjectAccess()`) using verified user emails.
      3. Liveblocks credential validation (`isLiveblocksConfigured()`).
      4. Room verification/creation (`liveblocks.getOrCreateRoom()`).
      5. Session preparation and token issuance (`liveblocks.prepareSession()`).
  - **Issue 5 (Port Conflict)**:
    - Diagnosed process `14372` as an external Node.js project ("Zyphora Sattar Site") utilizing port 3000.
    - Preserved unrelated process intact according to safety guidelines; Next.js runs cleanly on available port 3001.
  - **Environment Configuration**:
    - Created comprehensive `.env.example` documenting all required variables for Clerk, Liveblocks, and PostgreSQL.
  - **Verification**:
    - `npx tsc --noEmit`: PASSED (0 errors).
    - `npm run lint`: PASSED (0 errors, 0 warnings).
    - `npm run build`: PASSED (Production build generated successfully with Turbopack).
- **Canvas Rendering Fix (React Flow & Liveblocks Styles)**
  - Diagnosed unstyled/collapsed React Flow canvas (`<MiniMap>` rendering as a full-width top strip and `<Background>` / `<ReactFlow>` collapsing without layout styles) caused by missing `@xyflow/react/dist/style.css` and `@liveblocks/react-flow/styles.css` imports.
  - Imported `@xyflow/react/dist/style.css` and `@liveblocks/react-flow/styles.css` in `components/canvas/canvas-view.tsx` and enabled `colorMode="dark"` on `<ReactFlow>`.
  - Verified clean TypeScript checks (`npx tsc --noEmit`), clean lint (`npm run lint`), and successful production build (`npm run build`).

- **Feature 12: Shape Panel** (`context/feature-specs/12-shape-panel.md`)
  - Extended `types/canvas.ts` with `ShapeSize`, `SHAPE_DEFAULT_SIZES` (rectangle wider than tall, circle square, diamond slightly larger for label room, plus pill, cylinder, and hexagon), `SHAPE_DRAG_DATA_KEY`, and `ShapeDragPayload`.
  - Created `components/canvas/shape-panel.tsx` (`ShapePanel`):
    - Floating pill-shaped toolbar (`rounded-full`) positioned at the bottom-center of the canvas using dark workspace tokens (`bg-surface/90`, `border-surface-border`, `backdrop-blur-md`).
    - Draggable Lucide icon buttons for all 6 shapes (`rectangle`, `diamond`, `circle`, `pill`, `cylinder`, `hexagon`), each serializing shape name and default size into `dataTransfer`.
  - Created `components/canvas/canvas-node.tsx` (`CanvasNodeComponent`):
    - Basic custom node renderer for the `canvasNode` type rendering every shape as a bordered rectangle with centered label, using `NODE_COLORS` / `DEFAULT_NODE_COLOR` and selection highlight (`border-brand`).
  - Updated `components/canvas/canvas-view.tsx` (`CanvasView` / `CanvasFlowInner`):
    - Registered `nodeTypes` with `canvasNode: CanvasNodeComponent`.
    - Added `onDragOver` and `onDrop` handlers to the canvas wrapper.
    - Validated dropped shape payload, converted screen coordinates to canvas coordinates via `useReactFlow().screenToFlowPosition`, generated node IDs using shape name, timestamp, and counter (`${shape}-${Date.now()}-${counter}`), and added new `canvasNode` nodes with empty label, `DEFAULT_NODE_COLOR`, and dragged shape via `onNodesChange`.
    - Mounted `<ShapePanel />` inside the canvas wrapper.
  - Exported `CanvasNodeComponent` and `ShapePanel` from `components/canvas/index.ts`.
  - Verified clean TypeScript checks (`npx tsc --noEmit`), clean lint (`npm run lint` - 0 errors, 0 warnings), and `npx next typegen`. (`npm run build` hit a Turbopack internal error spawning the PostCSS worker on Node v26.13.0.)

- **Canvas, Sidebar & Drag-and-Drop Fixes** (`context/current-issues.md`)
  - Fixed `EditorLayout` right AI sidebar to float over the canvas (`fixed top-14 right-0 bottom-0 z-40`, `bg-surface/95 backdrop-blur-md`) instead of shrinking `<main>`, matching the left sidebar overlay behavior so the dotted canvas extends edge-to-edge underneath both sidebars.
  - Fixed both `ProjectSidebar` (left) and AI sidebar (right) closed-state transforms (`-translate-x-[calc(100%+1rem)]` / `translate-x-[calc(100%+1rem)]`, `shadow-none`, `opacity-0`, `pointer-events-none`, `aria-hidden`, `inert`) so neither sidebar nor its shadow peeks onto the canvas when closed.
  - Updated `CanvasView` (`<ReactFlow className="ghost-canvas !bg-base">` and `<Background className="!bg-base" color="var(--border-subtle)" />`) to eliminate React Flow dark-mode background mismatch (`#141414` vs `--bg-base`) and ensure a flush, edge-to-edge dotted canvas.
  - Added `pointer-events-none` to `ShapePanel` button icons so SVG elements never intercept HTML5 drag events.

- **Feature 13: Node Shapes & Drag Preview** (`context/feature-specs/13-node-shape.md`)
  - Updated `components/canvas/shape-visual.tsx` (`ShapeVisual`):
    - Rendered `rectangle`, `pill`, and `circle` with CSS styling (`rounded-xl` / `rounded-full` borders and fill colors).
    - Rendered `diamond`, `hexagon`, and `cylinder` with scalable SVG shapes (`width="100%"`, `height="100%"`, `preserveAspectRatio="none"`, `vectorEffect="non-scaling-stroke"`).
    - Kept borders subtle at rest (`var(--border-default)`) and brighter when selected (`var(--accent-primary)`).
  - Updated `components/canvas/shape-panel.tsx` (`ShapePanel`) and `components/canvas/canvas-view.tsx` (`CanvasView`):
    - Added a cursor-attached ghost drag preview using `ShapeVisual` at `SHAPE_DEFAULT_SIZES[shape]` while dragging from the shape panel.
    - Suppressed the native browser drag image with a 1x1 transparent element and tracked cursor position via `onDragOver`, hiding the preview on `drop` or `dragend`.
    - Preserved existing collaborative canvas state (`useLiveblocksFlow`) and node creation logic.
  - Verified clean TypeScript checks (`npx tsc --noEmit`) and clean lint (`npm run lint` - 0 errors, 0 warnings); `npm run build` hit the pre-existing Turbopack PostCSS worker spawn error on this Node runtime.

- **Feature 14: Node Resizing & Inline Label Editing** (`context/feature-specs/14-node-editing.md`)
  - Updated `components/canvas/canvas-node.tsx` (`CanvasNodeComponent`):
    - Added `NodeResizer` from `@xyflow/react` visible when the node is selected (`isVisible={Boolean(selected)}`), enforcing minimum dimensions (`minWidth={80}`, `minHeight={48}`) with subtle dark-UI resize lines (`!border-brand/50`) and handles (`!border-brand !bg-surface`).
    - Added centered inline label editing triggered by double-clicking the center/label area, showing `"Label"` placeholder text in the same centered position when `data.label` is empty.
    - Overlaid a `<textarea>` directly over the label span (`absolute inset-0`) with matching typography (`text-center text-sm font-medium leading-snug`) and invisible sizing span to prevent layout shifts while typing.
    - Wired live label updates to `useReactFlow().updateNodeData(id, { label })` so changes sync through the existing `useLiveblocksFlow` collaborative state.
    - Closed editing cleanly on `onBlur` or `Escape` key press, and prevented canvas drag/pan/wheel interactions during text editing using `nodrag nopan nowheel` and pointer/mouse `stopPropagation()`.
  - Preserved shape rendering (`ShapeVisual`), shape panel, drag preview, and node drop creation behavior.
  - Verified clean TypeScript checks (`npx tsc --noEmit`) and clean lint (`npm run lint` - 0 errors, 0 warnings); `npm run build` hit the pre-existing Turbopack PostCSS worker spawn error on `app/globals.css`.

- **Feature 15: Node Color Toolbar** (`context/feature-specs/15-node-color-toolbar.md`, `context/feature-specs/16-nodes-color-toolbar.md`)
  - Extended `CanvasNodeData` in `types/canvas.ts` with optional `textColor?: string` alongside `NODE_COLORS`.
  - Created `components/canvas/node-color-toolbar.tsx` (`NodeColorToolbar`):
    - Uses `@xyflow/react`'s `<NodeToolbar>` (`position={Position.Top}`, `offset={12}`) visible only when the node is selected (`isVisible={Boolean(selected)}`) without overlapping the node.
    - Renders one circular swatch per predefined color pair in `NODE_COLORS`, showing the fill color and paired text color dot.
    - Highlights the active swatch (`scale-110`, `ring-2 ring-copy-primary/90`) and applies a tight, controlled hover glow based on the pair's text color (`0 0 8px 1px ${pair.text}66`).
    - Prevents toolbar interactions from dragging nodes or panning the canvas via `nodrag nopan nowheel` and pointer/mouse `stopPropagation()`.
  - Wired `NodeColorToolbar` into `components/canvas/canvas-node.tsx` (`CanvasNodeComponent`) and exported it from `components/canvas/index.ts`, updating both `color` and `textColor` in `useLiveblocksFlow` via `updateNodeData(id, { color, textColor })` with no server calls.
  - Verified clean TypeScript checks (`npx tsc --noEmit`) and clean lint (`npm run lint` - 0 errors, 0 warnings).

- **Feature 16: Custom Edge Rendering & Inline Labels** (`context/feature-specs/16-edge-behavior.md`)
  - Extended `CanvasEdgeData` in `types/canvas.ts` with `label?: string`.
  - Created `components/canvas/canvas-edge.tsx` (`CanvasEdgeComponent`):
    - Uses `getSmoothStepPath` for clean right-angle routing (`borderRadius: 8`) and `<BaseEdge interactionWidth={20} />` for a wider invisible hover/click target without increasing visible stroke thickness.
    - Keeps edges slightly dimmed at rest (`opacity: 0.6`) and brightens them on hover or selection (`opacity: 1`, `var(--text-primary)` / `var(--accent-primary)`).
    - Implements inline label editing via `EdgeLabelRenderer` positioned at `labelX, labelY` from `getSmoothStepPath`, double-clicking an edge to edit, auto-growing `<input>` via CSS `inline-grid`, saving on blur, `Enter`, or `Escape`, pill badges for saved labels, and a faint `"Add label"` hint when an unlabeled edge is hovered or selected.
    - Prevents canvas drag/pan/wheel interactions during label clicks and typing via `nodrag nopan nowheel` and `stopPropagation()`, syncing label changes through `useReactFlow().updateEdgeData`.
  - Updated `components/canvas/canvas-view.tsx` (`CanvasView`) to register `edgeTypes = { canvasEdge: CanvasEdgeComponent }`, configure `defaultEdgeOptions` (light rounded stroke and closed arrowhead), and create `canvasEdge` edges with `handleConnect` through `onEdgesChange` in `useLiveblocksFlow`.
  - Preserved four-sided loose connection handles (`top`, `right`, `bottom`, `left`) on `CanvasNodeComponent`.
  - Verified clean TypeScript checks (`npx tsc --noEmit`) and clean lint (`npm run lint` - 0 errors, 0 warnings).

- **Feature 17: Canvas Ergonomics (Control Bar & Keyboard Shortcuts)** (`context/feature-specs/17-canvas-ergonomics.md.md`)
  - Created `components/canvas/canvas-controls.tsx` (`CanvasControls`):
    - Pill-shaped floating control bar at the bottom-left (`bottom-5 left-5 z-20`) sitting above the shape panel, styled with dark workspace tokens (`bg-surface/90`, `border-surface-border`, `backdrop-blur-md`).
    - Includes zoom controls (zoom out, fit view, zoom in) and Liveblocks history controls (undo, redo) separated by a thin divider.
    - Wires zoom actions to the React Flow instance with smooth short animations (`duration: 200`/`250`) and disables/dims undo and redo buttons when `canUndo`/`canRedo` is false.
  - Created `hooks/useKeyboardShortcuts.ts` (`useKeyboardShortcuts`) and exported it from `hooks/index.ts`:
    - Listens on `window` for `+`/`=` (zoom in), `-` (zoom out), `Cmd/Ctrl+Z` (undo), and `Cmd/Ctrl+Shift+Z` / `Cmd/Ctrl+Y` (redo).
    - Ignores shortcuts when focus is inside `<input>`, `<textarea>`, `<select>`, or `contentEditable` elements.
  - Updated `components/canvas/canvas-view.tsx` (`CanvasView`) to wire Liveblocks `useUndo`, `useRedo`, `useCanUndo`, `useCanRedo`, `useKeyboardShortcuts`, and `<CanvasControls />`, and removed `<MiniMap />` from the bottom of the canvas.
  - Exported `canvas-controls` from `components/canvas/index.ts`.
  - Verified clean TypeScript checks (`npx tsc --noEmit`) and clean lint (`npm run lint` - 0 errors, 0 warnings).

- **Feature 18: Starter Templates** (`context/feature-specs/18-starter-templates.md`)
  - Created `components/editor/starter-templates.ts`:
    - Defined `CanvasTemplate` interface and `CANVAS_TEMPLATES` array with four starter templates (`Microservices Architecture`, `CI/CD Pipeline`, `Event-Driven System`, and `Serverless AI Backend`).
    - Used shared `CanvasNode` / `CanvasEdge` types, `SHAPE_DEFAULT_SIZES`, and `NODE_COLORS` palette with readable `createTemplateNode` and `createTemplateEdge` helpers.
  - Created `components/editor/starter-templates-modal.tsx` (`StarterTemplatesModal`):
    - Implemented a dark-themed dialog (`rounded-3xl`, `bg-surface`, `border-surface-border`) displaying template cards in a scrollable 2-column grid with name, description, node/edge counts, and an Import button that calls `onImport` and closes the modal.
    - Added lightweight SVG diagram previews (`TemplateDiagramPreview`) fitting each template's node bounds into a fixed viewport, drawing edges between node centers and nodes using their shape and color data without a React Flow instance.
  - Created `components/editor/template-import-context.tsx` (`TemplateImportProvider`, `useTemplateImport`) and wired starter templates into `components/editor/editor-layout.tsx` and `components/canvas/canvas-view.tsx`:
    - Added a `Templates` navbar button in `EditorLayout` that opens `StarterTemplatesModal`.
    - Wired `CanvasFlowInner` to clear existing nodes and edges via `onDelete({ nodes, edges })` and add the selected template's nodes and edges via `onNodesChange` and `onEdgesChange` inside `room.batch(...)`, then fit the view with `reactFlow.fitView`.
  - Verified clean TypeScript checks (`npx tsc --noEmit`) and clean lint (`npm run lint` - 0 errors, 0 warnings); `npm run build` hit the pre-existing Turbopack PostCSS worker spawn error on `app/globals.css`.

- **Feature 19: Presence Avatars & Live Cursors** (`context/feature-specs/19-presence-avatars-cursors.md`)
  - Updated `liveblocks.config.ts` `Presence` type to `{ cursor: { x: number; y: number } | null; thinking: boolean }` and aligned `initialPresence` in `components/canvas/canvas-wrapper.tsx`.
  - Created `components/canvas/presence-avatars.tsx` (`PresenceAvatars`):
    - Positioned in the top-right corner of the editor canvas view (`absolute top-4 right-4 z-20`), keeping the shared `EditorNavbar` and editor home navbar unchanged.
    - Reads the active Clerk user ID via `useAuth()` and filters Liveblocks `useOthers()` to exclude the current user and deduplicate collaborators.
    - Renders up to 5 non-interactive collaborator avatars in an overlapping stack (`-space-x-2`) with profile image + initials fallback, subtle dark-canvas ring (`ring-2 ring-base`), and a `+N` overflow chip when more than 5 collaborators are present.
    - Renders a vertical divider only when at least one collaborator is present, followed by the Clerk `<UserButton />` at the same `h-7 w-7` size.
  - Created `components/canvas/live-cursors.tsx` (`LiveCursors`) and wired it in `components/canvas/canvas-view.tsx`:
    - Broadcasts cursor position in flow coordinates via `useMyPresence()` on React Flow's `onMouseMove` and clears `cursor` to `null` on `onMouseLeave`.
    - Renders colored pointer SVGs and matching name badges for other participants only, transformed into viewport coordinates via `useViewport()`.
  - Exported `PresenceAvatars` and `LiveCursors` from `components/canvas/index.ts`.
  - Verified clean TypeScript checks (`npx tsc --noEmit`) and clean lint (`npm run lint` - 0 errors, 0 warnings); `npm run build` hit the pre-existing Turbopack PostCSS worker spawn error on `app/globals.css`.

- **Feature 20: AI Sidebar Shell** (`context/feature-specs/20-ai-sidebar-shell.md`)
  - Created `components/editor/ai-sidebar.tsx` (`AiSidebar`), controlled via `isOpen` and `onClose` props while preserving the floating right-side overlay (`fixed top-14 right-0 bottom-0 z-40`), slide-in transition, `bg-base/95`, `border-surface-border`, and shadow treatment.
  - Added header with bot icon, `AI Workspace` title (`text-copy-primary`), `Collaborate with Ghost AI` subtitle (`text-copy-muted`), and right-aligned close button.
  - Added shadcn `Tabs` (`AI Architect` and `Specs`) with AI accent active styling (`bg-ai/15 text-ai-text`) and muted inactive text (`text-copy-muted`).
  - Built `AI Architect` tab with scrollable chat area, empty state featuring bot icon and starter prompt pills (`Design an e-commerce backend`, `Create a chat app architecture`, `Build a CI/CD pipeline`) styled with `bg-subtle text-ai-text`, right-aligned user bubbles (`bg-accent-dim border-brand/50 border-2 text-copy-primary`), left-aligned assistant bubbles (`bg-elevated border-surface-border text-ai-text`), auto-resizing shadcn `Textarea` (`72px` min to `160px` max height), `Enter` submit / `Shift+Enter` newline handling, and `bg-ai text-white` send button.
  - Built `Specs` tab with a `Generate Spec` button (`bg-ai text-white`) and a static demo spec card (`bg-elevated border-surface-border`) containing a file icon, title, snippet, and disabled download action.
  - Wired `AiSidebar` into `components/editor/editor-layout.tsx` and exported it from `components/editor/index.ts`.
  - Verified clean TypeScript checks (`npx tsc --noEmit`) and clean lint (`npm run lint` - 0 errors, 0 warnings).

- **Feature 21: Canvas Autosave & Loading** (`context/feature-specs/21-canvas-autosave.md`)
  - Installed `@vercel/blob` and reused `canvasJsonPath` on the `Project` model in `prisma/models/project.prisma` to store the Vercel Blob URL while keeping Prisma responsible for metadata only.
  - Created `app/api/projects/[projectId]/canvas/route.ts`:
    - `PUT /api/projects/[projectId]/canvas`: verifies Clerk authentication and project membership via `checkProjectAccess`, validates `nodes` and `edges` arrays, uploads canvas JSON to Vercel Blob at `canvas/{projectId}.json`, and updates `canvasJsonPath` on the Prisma project record.
    - `GET /api/projects/[projectId]/canvas`: verifies Clerk authentication and project membership, reads `canvasJsonPath` from Prisma, fetches and validates the saved canvas JSON from Vercel Blob, and returns `{ nodes, edges, hasSavedCanvas }`.
  - Created `hooks/use-canvas-autosave.ts` (`useCanvasAutosave`) and exported it from `hooks/index.ts`:
    - Watches `nodes` and `edges`, debounces saves (`1500ms`), skips redundant initial saves until initial room load completes, exposes `saveNow()` for manual saves, and tracks `"idle" | "saving" | "saved" | "error"` status.
  - Created `components/editor/canvas-save-context.tsx` (`CanvasSaveProvider`, `useCanvasSave`) and wired a Save button with status indicator (`Save`, `Saving...`, `Saved`, `Save failed`) into `components/editor/editor-layout.tsx`.
  - Updated `app/editor/[roomId]/page.tsx`, `components/canvas/canvas-wrapper.tsx`, and `components/canvas/canvas-view.tsx` (`CanvasView` / `CanvasFlowInner`) to check whether the Liveblocks room is empty on load, fetch and load saved canvas state only when the room is empty and `hasSavedCanvas` is true, and skip loading if the room already has active nodes or edges.
  - Verified clean TypeScript checks (`npx tsc --noEmit`) and clean lint (`npm run lint` - 0 errors, 0 warnings); `npm run build` hit the pre-existing Turbopack PostCSS worker spawn error on `app/globals.css`.
- **Trigger.dev Setup**
  - Verified `@trigger.dev/sdk` (`^4.8.10`), `@trigger.dev/build` (`^4.8.10`), `trigger.config.ts` (`project: "proj_ypxqpohtbcfzwltpcfhv"`, `dirs: ["./src/trigger"]`), `tsconfig.json` include, and `.gitignore` `.trigger` entry.
  - Added starter task `helloWorld` (`id: "hello-world"`) in `src/trigger/example.ts`.
  - Documented `TRIGGER_SECRET_KEY` in `.env.example`.
- **Feature 22: Design Agent API & Task Wiring** (`context/feature-specs/22-design-agent-api.md`)
  - Added `TaskRun` model in `prisma/models/task-run.prisma` (linked to `Project` in `prisma/models/project.prisma` with `onDelete: Cascade`), including unique `runId`, `projectId`, `userId`, `createdAt`, an index on `runId`, and a compound index on `[userId, projectId]`.
  - Created and applied Prisma migration `20261127151829_add_task_run` and regenerated Prisma Client.
  - Created minimal Trigger.dev task `designAgentTask` (`id: "design-agent"`) in `src/trigger/design-agent.ts` reusing the existing `dirs: ["./src/trigger"]` setup, accepting `{ prompt, roomId }` and logging/echoing the input without AI logic.
  - Created `POST /api/ai/design` (`app/api/ai/design/route.ts`): verifies Clerk authentication and project membership via `checkProjectAccess`, triggers `design-agent` via `tasks.trigger`, persists a `TaskRun` record in Prisma, and returns `{ runId }`.
  - Created `POST /api/ai/design/token` (`app/api/ai/design/token/route.ts`): verifies Clerk authentication and `TaskRun` ownership (`taskRun.userId === userId`), mints a run-scoped Trigger.dev public token via `auth.createPublicToken({ scopes: { read: { runs: [runId] } } })`, and returns `{ token }`.
  - Verified `npx tsc --noEmit`, ESLint on all new files (0 errors, 0 warnings), and `npm run build` (passed).
- **Feature 23: Design Agent Logic** (`context/feature-specs/23-design-agent-logic.md`)
  - Created `lib/ai-design-schema.ts` defining Zod schemas (`designPlanSchema`, `canvasActionSchema`) for `add_node`, `move_node`, `resize_node`, `update_node_data`, `delete_node`, `add_edge`, and `delete_edge`, along with dark-canvas palette resolution (`NODE_COLORS`), shape defaults (`SHAPE_DEFAULT_SIZES`), dimension clamping, and `DESIGN_SYSTEM_PROMPT` layout/spacing rules.
  - Created `lib/liveblocks-ai.ts` providing `setAiPresence`, `clearAiPresence` (via `liveblocks.setPresence`), and `publishAiStatus` (via `liveblocks.createFeed` / `liveblocks.createFeedMessage` on feed `"ai-status"`).
  - Updated `src/trigger/design-agent.ts` (`designAgentTask`) to read the current collaborative canvas via `mutateFlow` (`@liveblocks/react-flow/node`), call Gemini (`gemini-2.5-flash` via `@ai-sdk/google` using `GOOGLE_AI_API_KEY`) with `generateText` + `Output.object`, apply the resulting node/edge mutations through `mutateFlow`, publish start/processing/complete/error status messages, update AI cursor + thinking presence, and clear AI presence in `finally`.
- **Feature 24: AI Presence & Realtime Status State** (`context/feature-specs/24-ai-presence-state.md`)
  - Created `types/tasks.ts` defining `AI_STATUS_FEED_ID = "ai-status-feed"`, Zod validation schemas (`aiStatusStepSchema`, `aiStatusFeedMessageSchema` supporting optional `text`, `message`, `step`, `prompt`, and `timestamp` fields), and `parseAiStatusFeedMessage` to validate incoming feed payloads before display.
  - Aligned `lib/liveblocks-ai.ts` with `AI_STATUS_FEED_ID` (`"ai-status-feed"`) and included `text` in published status messages.
  - Extracted `WorkspaceRoomProvider` in `components/canvas/canvas-wrapper.tsx` and mounted it around `EditorLayout` in `app/editor/[roomId]/page.tsx` so both the canvas and `AiSidebar` share the Liveblocks `RoomProvider` while preserving `CanvasNotice` error/config fallbacks.
  - Updated `components/editor/ai-sidebar.tsx` (`AiSidebar`) to subscribe to room presence (`useOthers`, `useMyPresence`) and the latest validated `ai-status-feed` message (`useFeedMessages`) when inside a room, rendering a compact shared status indicator, disabling the chat input and starter prompts while AI is working, showing a loading spinner on the send button, and keeping the rest of the sidebar usable.
  - Updated `components/canvas/live-cursors.tsx` (`LiveCursors`) to show a small spinner in a participant's cursor name badge when `thinking: true` in presence and hide it when `false` or missing.
- **Feature 25: Sidebar Chat Feed** (`context/feature-specs/25-sidebar-chat-feed.md`)
  - Extended `types/tasks.ts` with `AI_CHAT_FEED_ID = "ai-chat"`, `aiChatRoleSchema`, `aiChatFeedMessageSchema` (`sender`, `role`, `content`, `timestamp`), and `parseAiChatFeedMessage` to validate incoming chat messages before rendering.
  - Wired `AiSidebar` (`components/editor/ai-sidebar.tsx`) to subscribe to the room-scoped `ai-chat` Liveblocks feed (`useFeedMessages`), separate from `ai-status-feed`.
  - Rendered validated chat messages in chronological order displaying sender, formatted timestamp, and content, styled consistently with the existing sidebar UI.
  - Implemented collaborative message sending via `useCreateFeed` + `useCreateFeedMessage` using the existing sidebar input and send button, clearing the input on success and displaying a small inline error state if sending fails.
- **Feature 26: Functional AI Chat & Realtime Run Tracking** (`context/feature-specs/26-ai-chat-functional.md`)
  - Passed `roomId` (`currentActiveId`) from `EditorLayout` (`components/editor/editor-layout.tsx`) to `AiSidebar` (`components/editor/ai-sidebar.tsx`).
  - Updated `AiSidebar` prompt submission to post the user message to `ai-chat`, call `POST /api/ai/design` (and `POST /api/ai/design/token` when `publicToken` is not returned directly), and store `{ runId, publicToken }` in local state.
  - Added `DesignRunTracker` using `useRealtimeRun<typeof designAgentTask>` from `@trigger.dev/react-hooks` to track run completion and terminal failures, posting the final assistant summary or error message to `ai-chat` and resetting run state.
  - Rendered the compact `ai-status-feed` strip above the input only while a run is active, disabled the chat input during active runs, showed a spinner on the submit button, and styled user bubbles, submit button, and status strip using existing `globals.css` tokens (`bg-state-success`, `bg-elevated`, `bg-base`).
- **Feature 27: Spec Generation Backend Flow** (`context/feature-specs/27-spec-generation-flow.md`)
  - Created `lib/ai-spec-schema.ts` defining Zod validation schemas (`specChatMessageSchema`, `specNodeSchema`, `specEdgeSchema`, `specTriggerRequestSchema`, `specTokenRequestSchema`, `generateSpecPayloadSchema`) and `SPEC_SYSTEM_PROMPT`.
  - Created `src/trigger/generate-spec.ts` (`generateSpec`, task id `"generate-spec"`) validating input with Zod, calling Gemini via `@ai-sdk/google` (`generateText`) with model fallback, updating `metadata` (`start`, `processing`, `complete`, `error`) and logging, and returning plain Markdown output.
  - Created `POST /api/ai/spec` (`app/api/ai/spec/route.ts`) authenticating the user, validating `roomId`, `chatHistory`, `nodes`, and `edges` with Zod, resolving project access strictly from `roomId` via `checkProjectAccess`, triggering `generate-spec`, persisting a `TaskRun` record in Prisma, and returning `{ runId }`.
  - Created `POST /api/ai/spec/token` (`app/api/ai/spec/token/route.ts`) authenticating the user, validating `runId` with Zod, verifying `TaskRun` ownership (`taskRun.userId === userId`), and issuing a 1-hour (`expirationTime: "1h"`) run-scoped Trigger.dev public token.
  - Verified `npx tsc --noEmit` and `npx eslint` on all new files (0 errors, 0 warnings); `npm run build` hit a Turbopack internal junction-point error on `pg` (`os error 80`).
- **Feature 28: Spec Persistence & Download** (`context/feature-specs/28-spec-persistence-download.md`)
  - Added `ProjectSpec` model in `prisma/models/project-spec.prisma` (linked to `Project` in `prisma/models/project.prisma` with `onDelete: Cascade`), storing `id`, `projectId`, `filePath`, and `createdAt` with indexes on `[projectId]` and `[projectId, createdAt]`.
  - Created and applied Prisma migration `20261128165935_add_project_spec` and regenerated Prisma Client.
  - Updated `src/trigger/generate-spec.ts` (`generateSpec`) to upload the generated Markdown to Vercel Blob at `specs/{projectId}/{specId}.md` (`access: "private"`), persist the `ProjectSpec` metadata record in Prisma with `filePath: blob.url`, set `specId` in run metadata, and return the plain Markdown output.
  - Created `GET /api/projects/[projectId]/specs/[specId]/download` (`app/api/projects/[projectId]/specs/[specId]/download/route.ts`) authenticating the user, verifying project membership via `checkProjectAccess`, verifying the spec belongs to the project, fetching the private Markdown blob from Vercel Blob, and returning it as a `text/markdown; charset=utf-8` attachment (`Content-Disposition: attachment; filename="spec-{id}.md"`).
  - Verified `npx prisma generate`, `npx tsc --noEmit`, `npx eslint` on all changed files (0 errors, 0 warnings), and `npx next typegen`.
- **Feature 29: Spec UI Integration** (`context/feature-specs/29-spec-ui-integration.md`)
  - Created `GET /api/projects/[projectId]/specs` (`app/api/projects/[projectId]/specs/route.ts`) authenticating the user, checking project access via `checkProjectAccess`, and returning `ProjectSpec` metadata (`id`, `filename`, `createdAt`) ordered by `createdAt` descending without exposing Blob URLs.
  - Created `components/editor/spec-preview-modal.tsx` (`SpecPreviewModal`) using shadcn `Dialog`, `ScrollArea`, and `Button` with dark workspace tokens, fetching Markdown content on demand from `/api/projects/[projectId]/specs/[specId]/download` (clearing content when closed), rendering Markdown cleanly, and supporting close/Escape and `.md` download.
  - Updated `components/editor/ai-sidebar.tsx` (`AiSidebar` Specs tab) to load and display the scrollable list of project specs (`filename` + `createdAt`), open `SpecPreviewModal` on item click, trigger browser downloads from both list items and the modal, and wire the `Generate Spec` button to `POST /api/ai/spec` + `POST /api/ai/spec/token` + `SpecRunTracker` (`useRealtimeRun<typeof generateSpec>`), refreshing the spec list on completion.
  - Verified `npx tsc --noEmit`, `npx eslint` on all changed files (0 errors, 0 warnings), and `npx next typegen`.

## In Progress

- All planned feature units completed.

## Next Up

- End-to-end QA and deployment verification.

## Open Questions

- None.

## Architecture Decisions

- Configured Tailwind v4 with PostCSS plugin (`@tailwindcss/postcss`) and `@theme inline` mapping in `globals.css` for dark-only theme tokens (`--bg-base`, `--bg-surface`, `--text-copy-primary`, etc.) as defined in `ui-context.md`.
- Bound shadcn semantic variables (`--background`, `--foreground`, `--card`, `--primary`, `--border`, etc.) directly to dark theme tokens in both `:root` and `.dark`.
- Followed Next.js 16 file convention by placing `proxy.ts` at the root with `clerkMiddleware`, exporting default handler and registering matcher without calling deprecated `createRouteMatcher`.
- Set `export const instant = false` on dynamic / client-hook pages (`/`, `/editor`, `/sign-in`, `/sign-up`, `/editor/[roomId]`) to opt them out of instant-navigation validation when accessing runtime auth data during prerendering. Partial Prefetching (PPR) is configured separately via the `partialPrefetching` config flag and `prefetch` route segment exports.
- Enforced resource-based auth protection directly in server components (`/`, `/editor`, `/editor/[roomId]`) alongside proxy route protection.
- Isolated project access control in `lib/project-access.ts` verifying project existence and membership (owner or collaborator) before rendering workspace contents.
- Configured Prisma 7 with schema folder support in `prisma7.config.ts`, generating type-safe Prisma Client to `app/generated/prisma`.
- Implemented singleton pattern in `lib/prisma.ts` with connection branching between Prisma Accelerate (`prisma+postgres://`) and direct PostgreSQL connection via `@prisma/adapter-pg`.
- Configured REST endpoints in `app/api/projects/` handling list, create, rename, and delete with defense-in-depth security: middleware-level 401 response for unauthenticated `/api/*` requests and handler-level ownership validation (403 Forbidden for non-owner mutations).
- Cached singleton Liveblocks Node client in `lib/liveblocks.ts` on `globalThis` in development.
- Liveblocks auth endpoint (`POST /api/liveblocks-auth`) secures rooms by verifying Clerk authentication and database project membership via `checkProjectAccess`, returning 403 on unauthorized access, auto-creating private rooms with `defaultAccesses: []`, and returning authorized session tokens with user info and deterministic cursor color.
- Maintained server/client boundary for the workspace route: `WorkspacePage` (`app/editor/[roomId]/page.tsx`) executes server-side checks and fetches project lists, while `CanvasWrapper` acts as the client boundary initializing `LiveblocksProvider` and `RoomProvider`.
- Wrapped `ReactFlow` in `ReactFlowProvider` and backed it by `useLiveblocksFlow<CanvasNode, CanvasEdge>({ suspense: true })` with `ConnectionMode.Loose`, dot-pattern background, dark-themed MiniMap, and multiplayer cursors.

## Session Notes

- Feature 01 through Feature 11 completed and verified end-to-end.
- Master Engineering Repair & Audit completed: Clerk authentication abort resilience, Liveblocks configuration validation and error boundaries, proper auth/access ordering, and dev server port diagnosis verified.
- Validation: `npx tsc --noEmit`, `npm run lint` (0 errors, 0 warnings), Prisma Client generation, dev server startup, and `npm run build` (Next.js Turbopack) all pass cleanly.
