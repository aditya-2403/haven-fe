# Haven — Development Progress & Architecture Reference

> **Purpose**: This file serves as an internal technical blueprint for the Haven platform. Refer to this document at the start of future tasks to immediately understand the system architecture, module hierarchy, data flow, component library, and extension patterns.

---

## 1. System Overview

**Haven** is a multi-tenant Visitor & Access Management SaaS platform. It governs the end-to-end lifecycle of visitor registrations, appointment scheduling, host approvals, badge/QR pass generation, security check-in/out, audit trails, and reporting.

### Core Technology Stack
- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Zustand, TanStack Query v5, Framer Motion, Lucide React, Axios.
- **Backend**: NestJS 10, TypeScript, Mongoose 8, MongoDB 8, Passport, JWT with refresh token rotation, Class Validator, Swagger/OpenAPI.
- **Port Allocation**:
  - Frontend: `http://localhost:3000`
  - Backend API: `http://localhost:4000/api/v1`
  - Swagger UI: `http://localhost:4000/api/docs`
  - MongoDB: `mongodb://127.0.0.1:27017/haven`

---

## 2. Authentication & Multi-Tenancy Architecture

### 2.1 Multi-Tenant Data Isolation
- **Rule**: Every tenant document (`User`, `Employee`, `Visitor`, `Visit`, `Department`, `Building`, `Settings`, `AuditLog`) is scoped with an `organizationId: ObjectId`.
- **Enforcement**: In controllers/services, `organizationId` is **never** accepted from untrusted request bodies. It is extracted strictly from the verified JWT payload (`req.user.organizationId`), except for `SUPER_ADMIN` operations.
- **Decorators**:
  - `@Roles(...)`: Enforces role-based endpoint access ([`roles.decorator.ts`](file:///d:/Antigravity%20Projects/Haven/backend/src/common/decorators/roles.decorator.ts)).
  - `@CurrentUser()`: Injects authenticated user context ([`current-user.decorator.ts`](file:///d:/Antigravity%20Projects/Haven/backend/src/common/decorators/current-user.decorator.ts)).
  - `@Public()`: Bypasses JWT validation for public endpoints ([`public.decorator.ts`](file:///d:/Antigravity%20Projects/Haven/backend/src/common/decorators/public.decorator.ts)).

### 2.2 Roles & Access Matrix
| Role | Capabilities | Primary Route |
| :--- | :--- | :--- |
| `SUPER_ADMIN` | Global platform administration, organization tenant provisioning, platform metrics | `/organizations` |
| `ORG_ADMIN` | Organization configuration, employee/department/building management, all visitor records, settings | `/dashboard` |
| `RECEPTIONIST` | Walk-in visitor registration, appointment queue, pass printing, manual check-in/out | `/dashboard` |
| `SECURITY` | Fast QR pass scanning, gate validation, real-time check-in/out logs | `/check-in` |
| `EMPLOYEE` | View incoming visitors, approve/reject visit requests, host appointment booking | `/dashboard` |

### 2.3 Token Strategy & Refresh Queue
- **Access Tokens**: Short-lived (15 min) JWT stored in frontend Zustand auth state and attached as `Bearer` token by Axios.
- **Refresh Tokens**: Long-lived (7 days) cryptographically hashed token in MongoDB `users` collection, transmitted via HttpOnly cookie or secure refresh API.
- **Concurrency Lock**: [`api.ts`](file:///d:/Antigravity%20Projects/Haven/frontend/src/lib/api.ts) maintains a promise queue to resolve simultaneous 401 requests with a single refresh call.

---

## 3. Backend Module Map (`backend/src/modules/`)

All business logic is modularized into 14 distinct NestJS modules:

| Module | Core Files | Responsibility |
| :--- | :--- | :--- |
| **Auth** | [`auth.controller.ts`](file:///d:/Antigravity%20Projects/Haven/backend/src/modules/auth/auth.controller.ts)<br>[`auth.service.ts`](file:///d:/Antigravity%20Projects/Haven/backend/src/modules/auth/auth.service.ts) | Login, token refresh, logout, profile retrieval, password hashing with bcrypt |
| **Organizations** | [`organizations.controller.ts`](file:///d:/Antigravity%20Projects/Haven/backend/src/modules/organizations/organizations.controller.ts)<br>[`organizations.service.ts`](file:///d:/Antigravity%20Projects/Haven/backend/src/modules/organizations/organizations.service.ts) | Tenant CRUD, slug generation, activation/suspension, initial Org Admin provisioning |
| **Users** | [`users.controller.ts`](file:///d:/Antigravity%20Projects/Haven/backend/src/modules/users/users.controller.ts)<br>[`users.service.ts`](file:///d:/Antigravity%20Projects/Haven/backend/src/modules/users/users.service.ts) | User administration, role changes, activation status, secure password reset |
| **Employees** | [`employees.controller.ts`](file:///d:/Antigravity%20Projects/Haven/backend/src/modules/employees/employees.controller.ts)<br>[`employees.service.ts`](file:///d:/Antigravity%20Projects/Haven/backend/src/modules/employees/employees.service.ts) | Host employee directory, department associations, host designation |
| **Departments** | [`departments.controller.ts`](file:///d:/Antigravity%20Projects/Haven/backend/src/modules/departments/departments.controller.ts)<br>[`departments.service.ts`](file:///d:/Antigravity%20Projects/Haven/backend/src/modules/departments/departments.service.ts) | Organizational units, department codes, employee mapping |
| **Buildings** | [`buildings.controller.ts`](file:///d:/Antigravity%20Projects/Haven/backend/src/modules/buildings/buildings.controller.ts)<br>[`buildings.service.ts`](file:///d:/Antigravity%20Projects/Haven/backend/src/modules/buildings/buildings.service.ts) | Facilities, physical locations, gate codes, meeting rooms |
| **Visitors** | [`visitors.controller.ts`](file:///d:/Antigravity%20Projects/Haven/backend/src/modules/visitors/visitors.controller.ts)<br>[`visitors.service.ts`](file:///d:/Antigravity%20Projects/Haven/backend/src/modules/visitors/visitors.service.ts) | Visitor identity records, phone/email lookup, photo upload, visit history |
| **Visits** | [`visits.controller.ts`](file:///d:/Antigravity%20Projects/Haven/backend/src/modules/visits/visits.controller.ts)<br>[`visits.service.ts`](file:///d:/Antigravity%20Projects/Haven/backend/src/modules/visits/visits.service.ts) | Visit scheduling, status state machine (`PENDING`, `APPROVED`, `CHECKED_IN`, etc.) |
| **Approvals** | [`approvals.controller.ts`](file:///d:/Antigravity%20Projects/Haven/backend/src/modules/approvals/approvals.controller.ts)<br>[`approvals.service.ts`](file:///d:/Antigravity%20Projects/Haven/backend/src/modules/approvals/approvals.service.ts) | Host approval/rejection queue, required rejection reason logging |
| **Check-In** | [`check-in.controller.ts`](file:///d:/Antigravity%20Projects/Haven/backend/src/modules/check-in/check-in.controller.ts)<br>[`check-in.service.ts`](file:///d:/Antigravity%20Projects/Haven/backend/src/modules/check-in/check-in.service.ts) | SHA-256 QR token verification, fast check-in, badge issuance, check-out |
| **Reports** | [`reports.controller.ts`](file:///d:/Antigravity%20Projects/Haven/backend/src/modules/reports/reports.controller.ts)<br>[`reports.service.ts`](file:///d:/Antigravity%20Projects/Haven/backend/src/modules/reports/reports.service.ts) | Aggregate statistics, 7-day traffic trends, department breakdown, peak hours |
| **Audit Logs** | [`audit-logs.controller.ts`](file:///d:/Antigravity%20Projects/Haven/backend/src/modules/audit-logs/audit-logs.controller.ts)<br>[`audit-logs.service.ts`](file:///d:/Antigravity%20Projects/Haven/backend/src/modules/audit-logs/audit-logs.service.ts) | Immutable security audit trail recording actor, action, IP, and timestamp |
| **Settings** | [`settings.controller.ts`](file:///d:/Antigravity%20Projects/Haven/backend/src/modules/settings/settings.controller.ts)<br>[`settings.service.ts`](file:///d:/Antigravity%20Projects/Haven/backend/src/modules/settings/settings.service.ts) | Organization policy, approval rules, photo requirements, badge styles |
| **Storage** | [`storage.service.ts`](file:///d:/Antigravity%20Projects/Haven/backend/src/modules/storage/storage.service.ts) | Base64 MongoDB-backed grid storage abstraction (`stored_files` collection) |

---

## 4. Frontend Architecture & Directory Map (`frontend/src/`)

### 4.1 Page Routes (`frontend/src/app/`)
| Path | Component | Purpose |
| :--- | :--- | :--- |
| `/` | [`page.tsx`](file:///d:/Antigravity%20Projects/Haven/frontend/src/app/page.tsx) | Professional product landing page with live mockup preview, capability suite, and dynamic login CTAs |
| `/login` | [`(auth)/login/page.tsx`](file:///d:/Antigravity%20Projects/Haven/frontend/src/app/(auth)/login/page.tsx) | Unified login with email/password validation, automatic role routing |
| `/dashboard` | [`(dashboard)/dashboard/page.tsx`](file:///d:/Antigravity%20Projects/Haven/frontend/src/app/(dashboard)/dashboard/page.tsx) | Dynamic KPI cards, live visitor count, host pending approvals, recent logs |
| `/visitors` | [`(dashboard)/visitors/page.tsx`](file:///d:/Antigravity%20Projects/Haven/frontend/src/app/(dashboard)/visitors/page.tsx) | Visitor directory, photo capture modal, detailed visit history view |
| `/appointments` | [`(dashboard)/appointments/page.tsx`](file:///d:/Antigravity%20Projects/Haven/frontend/src/app/(dashboard)/appointments/page.tsx) | Schedule future visits, appointment calendar/table, cancellation modal |
| `/approvals` | [`(dashboard)/approvals/page.tsx`](file:///d:/Antigravity%20Projects/Haven/frontend/src/app/(dashboard)/approvals/page.tsx) | Host approval dashboard with approval/rejection confirmation dialogs |
| `/check-in` | [`(dashboard)/check-in/page.tsx`](file:///d:/Antigravity%20Projects/Haven/frontend/src/app/(dashboard)/check-in/page.tsx) | Security & reception pass scanner, QR verification, quick check-in & check-out |
| `/visitor-logs` | [`(dashboard)/visitor-logs/page.tsx`](file:///d:/Antigravity%20Projects/Haven/frontend/src/app/(dashboard)/visitor-logs/page.tsx) | Live list of currently on-premise visitors, historical entry/exit timestamps |
| `/employees` | [`(dashboard)/employees/page.tsx`](file:///d:/Antigravity%20Projects/Haven/frontend/src/app/(dashboard)/employees/page.tsx) | Employee host database, department linkage, active status |
| `/departments` | [`(dashboard)/departments/page.tsx`](file:///d:/Antigravity%20Projects/Haven/frontend/src/app/(dashboard)/departments/page.tsx) | Department unit configuration and employee count |
| `/buildings` | [`(dashboard)/buildings/page.tsx`](file:///d:/Antigravity%20Projects/Haven/frontend/src/app/(dashboard)/buildings/page.tsx) | Facility/Building registration with location and security codes |
| `/organizations` | [`(dashboard)/organizations/page.tsx`](file:///d:/Antigravity%20Projects/Haven/frontend/src/app/(dashboard)/organizations/page.tsx) | Super Admin tenant management, creation modal, activate/suspend controls |
| `/users` | [`(dashboard)/users/page.tsx`](file:///d:/Antigravity%20Projects/Haven/frontend/src/app/(dashboard)/users/page.tsx) | User account directory, role assignment, password reset modal |
| `/reports` | [`(dashboard)/reports/page.tsx`](file:///d:/Antigravity%20Projects/Haven/frontend/src/app/(dashboard)/reports/page.tsx) | Graphical analytics, visitor volume, status distribution charts |
| `/settings` | [`(dashboard)/settings/page.tsx`](file:///d:/Antigravity%20Projects/Haven/frontend/src/app/(dashboard)/settings/page.tsx) | Tenant settings: approval requirements, NDA signing, badge expiration |

### 4.2 Reusable UI Components (`frontend/src/components/ui/`)
- **Inputs & Red-Line Validation**: [`input.tsx`](file:///d:/Antigravity%20Projects/Haven/frontend/src/components/ui/input.tsx) — Accepts an `error?: string` prop. Automatically applies `border-danger focus:ring-danger text-danger` and displays an inline `<AlertCircle>` message.
- **Buttons**: [`button.tsx`](file:///d:/Antigravity%20Projects/Haven/frontend/src/components/ui/button.tsx) — Variants: `primary`, `secondary`, `outline`, `ghost`, `danger`. Built-in `isLoading` spinner state.
- **Cards**: [`card.tsx`](file:///d:/Antigravity%20Projects/Haven/frontend/src/components/ui/card.tsx) — Clean, rounded white surfaces with subtle borders and shadows.
- **Badges**: [`badge.tsx`](file:///d:/Antigravity%20Projects/Haven/frontend/src/components/ui/badge.tsx) — Status badges for `PENDING`, `APPROVED`, `CHECKED_IN`, `CHECKED_OUT`, `REJECTED`, `CANCELLED`.
- **Modals**: [`modal.tsx`](file:///d:/Antigravity%20Projects/Haven/frontend/src/components/ui/modal.tsx) — Accessible backdrop dialogs powered by Framer Motion, with `max-h-[calc(100dvh-2rem)] flex flex-col` and inner scrolling for mobile keyboard safety.
- **Confirmation Dialogs**: [`confirmation-dialog.tsx`](file:///d:/Antigravity%20Projects/Haven/frontend/src/components/ui/confirmation-dialog.tsx) — Modal for destructive or high-impact actions (Suspend, Cancel, Deactivate, Logout) with vertically stacked mobile actions.
- **Toast Notifications**: [`toast-container.tsx`](file:///d:/Antigravity%20Projects/Haven/frontend/src/components/ui/toast-container.tsx) & [`toast.store.ts`](file:///d:/Antigravity%20Projects/Haven/frontend/src/stores/toast.store.ts) — Globally accessible via `toast.success()`, `toast.error()`, `toast.warning()`, `toast.info()`. Responsive centered layout on mobile.

### 4.3 Mobile & Responsive Design Standards
- **Viewport & Overflow Isolation**: Layout containers enforce `w-full max-w-full overflow-x-hidden min-w-0` to eliminate horizontal body blowout.
- **Table Wrappers**: All tables sit inside `<Card className="p-0 overflow-hidden w-full min-w-0"><div className="overflow-x-auto w-full min-w-0"><table className="w-full text-left text-xs whitespace-nowrap min-w-[...px]">`.
- **Card Padding**: Responsive `p-4 sm:p-6` prevents metric squishing on mobile screens.
- **Typography**: Responsive page titles (`text-xl sm:text-2xl font-bold tracking-tight text-foreground`), subtitles (`text-xs sm:text-sm text-muted mt-1`), stat values (`text-2xl font-bold`), and table headers (`text-[11px] uppercase font-semibold text-muted`).
- **Filter Bars & Actions**: Action toolbars stack vertically on mobile (`flex-col sm:flex-row items-stretch sm:items-center w-full`) and controls use `w-full sm:w-auto`.

### 4.4 Profile Management & Loaders
- **User Avatar Menu & Profile Modal**:
  - Clicking the header user avatar opens an account menu displaying the user's role and organization, with one-click access to **Edit Profile** and **Change Password**.
  - [`ProfileModal`](file:///d:/Antigravity%20Projects/Haven/frontend/src/components/profile/profile-modal.tsx): Dual-tab dialog allowing any authenticated role (`SUPER_ADMIN`, `ORG_ADMIN`, `RECEPTIONIST`, `SECURITY`, `EMPLOYEE`) to update personal details (First Name, Last Name, Phone) and securely change their password (with current password verification, min length 6, and show/hide toggles).
  - Synchronizes linked `Employee` host directory records (`fullName`, `phone`) automatically when profile details change.
- **Loaders & Shimmer States** ([`loader.tsx`](file:///d:/Antigravity%20Projects/Haven/frontend/src/components/ui/loader.tsx)):
  - `HavenBrandLoader`: Pulsing brand emblem with orbital glow and progress bar for full-page loading.
  - `TableSkeleton`: Animated shimmer skeleton rows replacing plain loading text across all table views.
  - `CardSkeleton`: Shimmering placeholder cards for KPI and metric dashboards.
  - `Spinner`: Dual-arc branded SVG spinner with customizable sizes and color variants.

### 4.5 Live Camera QR Scanner & Fast Check-In
- **Component**: [`QrScanner`](file:///d:/Antigravity%20Projects/Haven/frontend/src/components/scanner/qr-scanner.tsx) — Real-time QR decoding engine powered by `jsqr` using `requestAnimationFrame` canvas extraction from `navigator.mediaDevices.getUserMedia`.
- **Viewfinder & UX**:
  - Semi-transparent target vignette with glowing corner brackets and animated sweeping laser scan line.
  - Web Audio API synthesized audio chime (880Hz -> 1320Hz frequency chirp) on successful QR detection.
  - Camera switch toggle (supports environment/rear vs user/front cameras on multi-camera devices) and audio mute toggle.
  - Handles browser permission states gracefully (`prompt`, `granted`, `denied`, `unsupported`) with inline instructions and re-prompt triggers.
- **Check-in Workflow** ([`check-in/page.tsx`](file:///d:/Antigravity%20Projects/Haven/frontend/src/app/(dashboard)/check-in/page.tsx)):
  - Tabbed mode switcher: **Live Camera** vs **Manual Code**.
  - Automatically verifies the decoded QR token or pass code against `/check-in/scan`.
  - Displays the verified visitor details card with photo, host info, and one-click **Confirm Check-In** action, along with a "Clear / Scan Next" action for rapid queuing.

---

## 5. Work Completed in This Session

1. **Full Backend Architecture Implementation**:
   - Implemented all 14 NestJS business modules, services, controllers, DTOs, and schemas.
   - Configured MongoDB Mongoose schemas with strict multi-tenant isolation.
   - Implemented QR code token generation using cryptographically secure 32-byte tokens hashed with SHA-256 at rest, plus human-readable `HV-XXXX` codes.
   - Built MongoDB-backed base64 storage provider for visitor photos and badge assets.
   - Created Super Admin seeder script ([`seed-superadmin.ts`](file:///d:/Antigravity%20Projects/Haven/backend/src/scripts/seed-superadmin.ts)).
   - Tested 14-step end-to-end integration flow ([`test-e2e-workflow.js`](file:///d:/Antigravity%20Projects/Haven/backend/test-e2e-workflow.js)) with 100% pass rate.

2. **Full Frontend Next.js 14 Implementation**:
   - Built all 14 pages matching the SaaS specification.
   - Applied Haven design token system (`--primary: #22285B`, `--background: #F8F9FC`, `--surface: #FFFFFF`).
   - Built role-based sidebar navigation that filters visible links based on the authenticated user's role.
   - Unified single-login page routing users seamlessly to their respective workspaces.

3. **User-Requested Interactive Polish & Quality Assurance**:
   - **Toast Notifications**: Added feedback on all auth events, CRUD operations, visitor approvals, and check-in/out scans.
   - **Confirmation Dialogs**: Added confirmation prompts with loading states for Logout, User Deactivation, Organization Suspension, Appointment Cancellation, and Visitor Check-Out.
   - **Form Field Red-Line Validation**: Added inline `border-danger` highlighting and descriptive alert messages to all form fields across the app.
   - **Production Enterprise Branding**: Removed all "MVP" references, updating badges to "Enterprise Edition" and polishing the user interface.
   - **Compilation**: Resolved all Next.js App Router and TypeScript compilation errors; both frontend and backend build cleanly with zero errors.

4. **Multi-Tenant Global & Scoped Reporting for Super Admin**:
   - **Root Cause Identified**: `ReportsController` previously threw `400 Bad Request: Organization context required` because `SUPER_ADMIN` accounts have `organizationId: null` by design.
   - **Backend Fix**: Enabled `ReportsService` and `ReportsController` to handle global queries across all organizations when `organizationId` is omitted for `SUPER_ADMIN`, while preserving strict tenant isolation for all other roles. Added optional `@Query('organizationId')` for scoped filtering.
   - **Frontend UI Enhancement**: Added an interactive **Scope / Organization Selector** on `/reports` and `/visitor-logs` for `SUPER_ADMIN`, allowing seamless toggling between "All Organizations (Global Overview)" and specific tenant organizations (e.g., Quadricx LLP, Apex Global).
   - **Data Validation**: Verified with live MongoDB records (`Arthur Dent` and `Monalisha Pradhan`). Global summary returns 2 total visitors, 2 completed visits, and active trajectory trends; filtered view returns accurate tenant-specific counts.

5. **Integrated Employee Login Account Provisioning & Two-Way Sync**:
   - **One-Click Provisioning**: Added an "Enable Login Account" toggle and password field directly in the "+ Add Employee" modal ([`employees/page.tsx`](file:///d:/Antigravity%20Projects/Haven/frontend/src/app/(dashboard)/employees/page.tsx)), creating both the employee record and user login credentials with `Role.EMPLOYEE` in one step.
   - **Retroactive Provisioning for Existing Staff**: Added a "Create Login" action button and modal in the Employee Directory for staff members created previously without login accounts, invoking the new `POST /employees/:id/provision-login` endpoint.
   - **Two-Way Synchronization**: Automatically links `employee.userId = user._id` and `user.employeeId = employee._id` whether created from `/employees` or `/users`.
   - **Super Admin Multi-Tenant Support**: Enabled Super Admin to select target tenant organizations when creating employees or users, and displays an Organization column in the `/users` table.

6. **Staging / Local Database Dynamic Environment Switching**:
   - **Environment Key (`DEV_MODE`)**: Added support for `DEV_MODE=staging` vs `DEV_MODE=local` in [`backend/.env`](file:///d:/Antigravity%20Projects/Haven/backend/.env).
   - **MongoDB Atlas Integration**: When `DEV_MODE=staging`, the backend automatically connects to the hosted MongoDB Atlas cluster (`mongodb+srv://...`) under database `haven`.
   - **Local Fallback**: When `DEV_MODE=local` or `development`, the backend falls back to `mongodb://127.0.0.1:27017/haven`.
   - **Seeder & Runtime Verification**: Both the NestJS application bootstrap and the CLI script (`seed:superadmin`) respect the active `DEV_MODE`, and connectivity was tested and confirmed with the live MongoDB Atlas cluster.

7. **Product Landing Page Architecture (`/`)**:
   - Built a high-conversion, professional product landing page on the root `/` route in the Cursor / Linear technical wireframe style.
   - Features a live telemetry console simulation (`HAVEN_TELEMETRY_ENGINE.EXE`), technical capability matrix with hairline 1px borders, enterprise security architecture spec table, and dynamic role-based login routing buttons.

8. **Appointment & Walk-In UX Streamlining**:
   - Unified the appointment creation modal by eliminating redundant tab switches ("Scheduled Appointment" vs "Walk-in Visitor").
   - Added an inline expandable "+ Quick Add New Visitor" sub-form within the modal, allowing receptionists and hosts to register a new visitor on the fly and auto-select them without navigating away from the form.
   - Fixed duplicate `+` prefix formatting inside the searchable Combobox action button.

9. **Complete Design System Revamp (Cursor.com / Linear / Vercel Architecture)**:
   - Installed and implemented Radix UI primitives (`@radix-ui/react-select`, `@radix-ui/react-popover`, `@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-tabs`, `@radix-ui/react-label`, `cmdk`).
   - Replaced all soft rounded elements (`rounded-xl`, `rounded-lg`, `rounded-full`, pills, and bubble shapes) with crisp rectangular geometry (`rounded-none`).
   - Applied high-contrast monochromatic design palette (`#FAFAFA` background, `#FFFFFF` surface, `#09090B` foreground, `#E4E4E7` hairline borders) with technical dot grid patterns and square scrollbars.
   - Revamped all core components (`Button`, `Input`, `Badge`, `Card`, `Modal`, `ConfirmationDialog`, `Select`, `Combobox`, `Tabs`, `Loader`, `ToastContainer`, `EmptyState`, `Sidebar`, `Header`).
   - Upgraded `QrScanner` to a dark optical HUD viewfinder with sharp 90-degree corner brackets, sweeping laser beam, and technical status telemetry.
   - Synchronized all 18 routes to 100% sharp aesthetic consistency.

10. **Combobox Selection Accessibility & Contrast Polish**:
    - Fixed dark-on-dark contrast issue where active/hovered options in searchable Combobox dropdowns were unreadable.
    - Updated `CommandItem` highlight state to clean `bg-zinc-100 text-foreground` matching `SelectItem` focus behavior.
    - Ensured visitor/employee names, phone/email sublabels, and organization badges maintain high-contrast legibility during keyboard navigation and cursor hover.

---

## 5. Centralized Message & String Architecture

All user-facing messages, feedback notifications, confirmation dialogues, and API exceptions are segregated into dedicated constants files:

### 5.1 Backend Message Constants
- **Location**: [`backend/src/common/constants/messages.constant.ts`](file:///d:/Antigravity%20Projects/Haven/backend/src/common/constants/messages.constant.ts)
- **Structure**: Grouped per domain module (`AUTH_MESSAGES`, `ORGANIZATION_MESSAGES`, `VISITOR_MESSAGES`, `VISIT_MESSAGES`, `APPROVAL_MESSAGES`, `CHECK_IN_MESSAGES`, `EMPLOYEE_MESSAGES`, `DEPARTMENT_MESSAGES`, `BUILDING_MESSAGES`, `USER_MESSAGES`, `SETTINGS_MESSAGES`, `STORAGE_MESSAGES`, `COMMON_MESSAGES`).
- **Usage**: Used directly in NestJS HTTP exceptions (`NotFoundException`, `BadRequestException`, `ForbiddenException`, `ConflictException`) and controller response wrappers.

### 5.2 Frontend Message Constants
- **Location**: [`frontend/src/constants/messages.ts`](file:///d:/Antigravity%20Projects/Haven/frontend/src/constants/messages.ts)
- **Structure**: Categorized into form validation errors, toast feedback strings (`toast.success()`, `toast.error()`), confirmation dialog titles & bodies, and modal text (`AUTH_MESSAGES`, `APPOINTMENT_MESSAGES`, `APPROVAL_MESSAGES`, `CHECK_IN_MESSAGES`, `EMPLOYEE_MESSAGES`, `DEPARTMENT_MESSAGES`, `BUILDING_MESSAGES`, `ORGANIZATION_MESSAGES`, `USER_MESSAGES`, `SETTINGS_MESSAGES`, `VISITOR_MESSAGES`, `REPORT_MESSAGES`, `COMMON_MESSAGES`).
- **Usage**: Imported in Next.js page components, form hooks, confirmation dialogues, and toast notifications across all 18 routes.

---

## 6. Development Reference & Credentials

### Super Admin Credentials
- **Email**: `admin@haven.local`
- **Password**: `HavenAdmin2026!Secure`
- **Role**: `SUPER_ADMIN`

### Useful CLI Commands
```powershell
# Run backend development server
cd backend; npm run start:dev

# Run backend production build & server
cd backend; npm run build; npm run start:prod

# Run frontend development server
cd frontend; npm run dev

# Run frontend production build & server
cd frontend; npm run build; npm run start

# Seed initial Super Admin
cd backend; npm run seed:superadmin

# Run End-to-End Workflow Verification Script
cd backend; node test-e2e-workflow.js
```

---

## 7. Instructions for Extending the Codebase

When continuing development or adding new features:
1. **Adding a Backend Endpoint**:
   - Define DTOs in `backend/src/modules/<module>/dto/` with `class-validator` decorators.
   - Add controller method with `@Roles(...)` and `@CurrentUser()` decorators.
   - Implement service logic ensuring queries always include `organizationId: user.organizationId` (unless user is `SUPER_ADMIN`).
   - Audit trail: Call `this.auditLogsService.logAction(...)` for any data modification.
2. **Adding a Frontend View**:
   - Create route in `frontend/src/app/(dashboard)/<route>/page.tsx`.
   - Register route in `frontend/src/components/layout/sidebar.tsx` with allowed roles in the `roles` array.
   - Use TanStack Query (`useQuery`, `useMutation`) with `api` from `@/lib/api`.
   - Wrap interactive mutations with `toast.success(...)` and `toast.error(...)` from `@/stores/toast.store`.
   - For any destructive action, mount `<ConfirmationDialog>` before triggering the mutation.
   - For form validation, manage local `errors` state and pass `error={errors.fieldName}` to `<Input>`.

