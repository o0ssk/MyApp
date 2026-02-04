# Project "Halqati" - Technical White Paper & Developer Manual

**Version:** 1.0
**Generated Date:** 2026-01-28
**Scope:** Full Codebase Deep Scan

---

## 1. The Global Architecture Map

This project is a **Next.js 14 Web Application** using the **App Router** architecture, integrated with **Firebase (Firestore/Auth)** for backend services. It relies heavily on `React Context` and custom `Hooks` for state management, avoiding external state libraries like Redux in favor of a decentralized, hook-based architecture.

### File Tree Visualization

```
src/
├── app/ ............................. [ROUTES] Main application routing and pages
│   ├── app/ ......................... Legacy/Shared application routes (Messages, Profile)
│   ├── login/ ....................... Authentication entry point
│   ├── onboarding/ .................. User role selection and profile setup
│   ├── sheikh/ ...................... [ROLE: SHEIKH] Teacher interface (Dashboard, Reports, Students)
│   ├── student/ ..................... [ROLE: STUDENT] Student interface (Store, Dashboard)
│   ├── api/ ......................... API Endpoints (Backend logic)
│   ├── globals.css .................. Global styles (Tailwind directives)
│   └── layout.tsx ................... Root layout wrapping providers
├── components/ ...................... [UI] Reusable UI components
│   ├── dashboard/ ................... Dashboard-specific widgets
│   ├── gamification/ ................ Game elements (Leaderboard, Rewards, Trees)
│   ├── landing/ ..................... Public marketing pages
│   ├── log/ ......................... Activity logging components
│   ├── messages/ .................... Chat interface components
│   ├── profile/ ..................... User profile management forms
│   ├── providers/ ................... React Context Providers (Auth, Theme)
│   ├── sheikh/ ...................... Sheikh-specific components (Attendance, Reports)
│   ├── student/ ..................... Student-specific widgets
│   └── ui/ .......................... [DESIGN SYSTEM] Primitive atoms (Button, Card, Modal)
├── lib/ ............................. [LOGIC] Business logic and Data Access Layer
│   ├── auth/ ........................ Authentication logic & guards
│   ├── firebase/ .................... Firebase configuration & client initialization
│   ├── hooks/ ....................... [ENGINE ROOM] Data hooks (usePoints, useLogs, useSheikh)
│   └── utils/ ....................... Helper functions and formatters
└── types/ ........................... TypeScript definitions (if present)
```

---

## 2. The Logic & Data Flow

### System Type Inference
**Type:** **Gamified Learning Management System (LMS)** specialized for Quran Memorization.
**Core Dynamics:**
1.  **Teacher-Led:** Sheikhs create circles and manage students.
2.  **Student-Driven:** Students report progress (`Logs`) to get approval.
3.  **Gamified:** Every approved action awards points, which are traded for cosmetic rewards (`Avatars`, `Frames`).

### The "Engine Room" (Core Hooks)
The application avoids a monolithic global store. instead, it uses **Domain-Specific Hooks** that connect directly to Firestore.

*   **Data Source:** Google Cloud Firestore (NoSQL).
*   **State Management:** React `useState` + `useEffect` listening to Firestore `onSnapshot` (Real-time).

**Data Flow Example (The Approval Cycle):**
1.  **Student Action:** `useLogs` -> `addLog()` -> Writes to `logs` collection (Status: `pending_approval`).
2.  **Sheikh Action:** `usePendingLogs` -> Listens to `logs` where `status == pending`.
3.  **Approval:** `usePendingLogs` -> `approveLog()` -> Triggers Batch Write:
    *   Updates Log Status to `approved`.
    *   Increments Student Points (`users/{uid}.points`) atomically.
4.  **Feedback:** `usePoints` (listening on Student side) detects change -> Updates UI -> `StudentAvatar` reflects changes if items are bought.

### Database Schema Reconstruction
Reversed-engineered from `src/lib/hooks/*.ts` files:

#### 1. `users` (Collection)
*   **ID:** `uid` (Auth ID)
*   **Fields:**
    *   `name`, `email`, `role` ("student"|"sheikh")
    *   `points` (Int), `totalPoints` (Int)
    *   `inventory` (Map<ItemId, boolean>)
    *   `equippedFrame` (String), `equippedBadge` (String)

#### 2. `circles` (Collection)
*   **ID:** Auto-generated
*   **Fields:**
    *   `name`, `description`
    *   `sheikhIds` (Array<uid>) - Supports multiple teachers.
    *   `inviteCode` (String) - 6-char unique code.

#### 3. `circleMembers` (Collection)
*   **ID:** Auto-generated
*   **Fields:**
    *   `circleId`, `userId`
    *   `status` ("pending"|"approved")
    *   `roleInCircle` ("student")

#### 4. `logs` (Collection)
*   **ID:** Auto-generated
*   **Fields:**
    *   `studentId`, `circleId`
    *   `type` ("memorization"|"revision")
    *   `amount` (Map: { pages, surah... })
    *   `status` ("pending_approval"|"approved")
    *   `teacherNotes`, `studentNotes`

#### 5. `attendance` (Collection)
*   **ID:** Composite (`{circleId}_{date}_{studentId}`)
*   **Fields:**
    *   `status` ("present"|"absent"|"late"|"excused")
    *   `date` (YYYY-MM-DD)

#### 6. `teacherInvites` (Collection)
*   **ID:** The Invite Code itself (e.g., "TEACH2024").
*   **Fields:** `isActive`, `maxUses`, `usedCount`.

---

## 3. Comprehensive File-by-File Dictionary

### `src/lib/hooks/` (The Brains)
| File | Purpose | Key Functions | Dependencies | Complexity |
| :--- | :--- | :--- | :--- | :--- |
| `useAuth.ts` | manages user session & profile | `useAuth`, `createUserProfile` | Firebase Auth | 3/5 |
| `usePoints.ts` | Gamification wallet logic | `spendPoints` (Atomic Transaction), `equipItem` | Firestore | 4/5 |
| `useLogs.ts` | Student activity history | `useLogs` (fetches with stats calculation), `addLog` | Firestore | 3/5 |
| `useSheikh.ts` | Teacher circle management | `createCircle`, `useSheikhCircles` (Array-contains query) | Firestore | 3/5 |
| `useMembership.ts` | Joining logic | `joinCircleByCode` (Validates code -> Creates entry) | Firestore | 3/5 |
| `useTasks.ts` | Assignment system | `useTasks`, `submitTask` (Creates Log + Updates Task) | Firestore | 3/5 |
| `useAttendance.ts` | Tracking presence | `saveAttendance` (Batch write), `fetchDailyAttendance` | Firestore | 4/5 |
| `useSheikhStudents.ts`| Deep drill-down on students | `approveLogWithPoints` (Critical business logic) | Firestore | 4/5 |

### `src/components/ui/` (Design System)
| File | Purpose | Key Functions | Complexity |
| :--- | :--- | :--- | :--- |
| `StudentAvatar.tsx` | **Visual Core** of gamification | Maps inventory IDs (strings) to CSS classes/Icons. Renders Frame + Badge + Photo. | 3/5 |
| `Button.tsx` | Standard button | Supports variants (Gold, Ghost, Danger) and Loading state. | 1/5 |
| `Card.tsx` | Container component | Standard whitespace and shadow wrapper. | 1/5 |
| `Modal.tsx` | Pop-up dialog | Accessible overlay for forms (Add Log, Join Circle). | 2/5 |

### `src/app/` (Pages & Routes)
| File | Purpose | Key Features | Complexity |
| :--- | :--- | :--- | :--- |
| `student/page.tsx` | **Student Dashboard** | Aggregates `useLogs` (Charts), `useTasks` (Cards), and `StudentAvatar`. | 4/5 |
| `student/store/page.tsx` | **Marketplace** | Lists items, handles `buy` transaction, updates UI on success. | 3/5 |
| `sheikh/dashboard/page.tsx` | **Teacher command center** | Shows `usePendingLogs` count, quick actions, and circle stats. | 3/5 |
| `sheikh/attendance/page.tsx` | Attendence Sheet | Grids students vs dates. Allows batch toggle of status. | 4/5 |
| `login/page.tsx` | Entry point | Handles Phone/Email auth flows and redirects based on Role. | 3/5 |

### `src/components/gamification/`
| File | Purpose | Key Features | Complexity |
| :--- | :--- | :--- | :--- |
| `Leaderboard.tsx` | Competition view | Real-time listener for top 5 `users` by `totalPoints`. Renders ranks (Gold/Silver/Bronze). | 3/5 |
| `KhatmaTree.tsx` | Visualization | Visual tree that grows as pages are memorized (Recursive/SVG logic likely). | 3/5 |

---

## 4. Integration & Relationships

### Feature A: The Gamification Loop (Critical)
**Goal:** User performs work -> Gets Rewarded -> Spends Reward -> Shows off Reward.
1.  **Work:** `src/app/student/page.tsx` uses `AddLogModal` to call `useLogs.addLog()`.
2.  **Verification:** Sheikh uses `src/app/sheikh/dashboard` -> `usePendingLogs.approveLogWithPoints()`.
    *   *System Event:* Firestore updates `users/{uid}/points`.
3.  **Reward:** `src/app/student/store/page.tsx` uses `usePoints` to listen to the new balance. User clicks "Buy".
    *   *System Event:* `runTransaction` deducts points and adds Item ID to `inventory`.
4.  **Display:** `src/components/ui/StudentAvatar.tsx` reads `equippedFrame` and renders the purchased frame around the user's photo.

### Feature B: The Circle Lifecycle
**Goal:** Connect Teacher to Student.
1.  **Creation:** Sheikh calls `useSheikh.createCircle()`. Access code generated (e.g., "X9Y2Z").
2.  **Distribution:** Sheikh shares code offline.
3.  **Connection:** Student enters code in `JoinCircleModal` (`src/lib/hooks/useMembership.ts`).
    *   *System Event:* `circleMembers` doc created with status `pending`.
4.  **Acceptance:** Sheikh sees request in `src/app/sheikh/students` and approves.
    *   *Result:* Student now sees `activeCircle` data in their dashboard.

### Feature C: Attendance with Excuses
**Goal:** Track presence and handle exceptions.
1.  **Marking:** Sheikh opens `AttendanceSheet`. Toggles status.
    *   *System Event:* `useAttendance.saveAttendance` performs batch write for all students for that day.
2.  **Exception:** Student submits excuse (`useAttendance.submitExcuse`).
3.  **Resolution:** Sheikh approves excuse.
    *   *System Event:* Status in `attendance` table for that day is overwritten from `absent` to `excused`.

---
**End of White Paper**
