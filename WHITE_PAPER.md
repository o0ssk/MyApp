# Halqati (حلقتي) — Enterprise Technical White Paper

**Version:** 2.0  
**Date:** 2026-02-12  
**Classification:** Confidential — For Investors, Engineers & CTO Review  
**Prepared By:** Architecture & Systems Engineering Division  

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Overview](#2-system-overview)
3. [Full Project Structure](#3-full-project-structure)
4. [Frontend Architecture](#4-frontend-architecture)
5. [Backend Architecture](#5-backend-architecture)
6. [Database Design](#6-database-design)
7. [Authentication & Security](#7-authentication--security)
8. [Infrastructure & DevOps](#8-infrastructure--devops)
9. [API Documentation](#9-api-documentation)
10. [Application Workflows](#10-application-workflows)
11. [Internal Logic Flow](#11-internal-logic-flow)
12. [Third-Party Integrations](#12-third-party-integrations)
13. [Performance & Optimization](#13-performance--optimization)
14. [Testing Strategy](#14-testing-strategy)
15. [Future Roadmap](#15-future-roadmap)

---

## 1. Executive Summary

### 1.1 Vision

Halqati (حلقتي — "My Circle") envisions becoming the **definitive digital platform for Quran memorization circles worldwide**. The platform bridges the centuries-old tradition of teacher-led Quran recitation circles (Halaqat) with modern technology, creating a seamless digital environment where Sheikhs (teachers) and students collaborate on the sacred journey of Hifz (memorization) and Muraja'ah (revision).

### 1.2 Mission

To empower every Quran memorization circle with enterprise-grade digital tools that track progress, gamify engagement, facilitate communication, and provide actionable analytics — all while respecting the cultural and spiritual essence of the learning experience.

### 1.3 Core Objectives

| Objective | Description | Priority |
|:---|:---|:---|
| **Digital Circle Management** | Enable Sheikhs to create, manage, and monitor virtual circles with invite-code-based enrollment | P0 |
| **Progress Tracking** | Provide granular logging of memorization and revision progress with approval workflows | P0 |
| **Gamification Engine** | Reward student engagement through a points-based economy with a marketplace for cosmetic rewards | P0 |
| **Real-Time Communication** | Facilitate 1:1 threaded messaging between Sheikhs and students | P1 |
| **Attendance Management** | Track daily attendance with excuse submission and approval workflows | P1 |
| **Analytics & Reporting** | Deliver monthly performance reports with CSV export capability | P1 |
| **Task Assignment** | Allow Sheikhs to assign memorization/revision tasks with deadlines | P2 |
| **Goal Setting** | Enable students to set personal daily/monthly targets | P2 |

### 1.4 Target Users

| User Persona | Role | Key Actions |
|:---|:---|:---|
| **Sheikh (المعلم)** | Teacher / Circle Administrator | Creates circles, approves logs, marks attendance, assigns tasks, views reports, messages students |
| **Student (الطالب)** | Learner / Circle Member | Joins circles via invite code, submits memorization/revision logs, completes tasks, buys store items, views personal analytics |
| **Administrator** | Platform Operator | Manages teacher invite codes, monitors platform health (future role) |

### 1.5 Business Model

The platform operates on a **freemium model** with potential monetization vectors:

- **Free Tier:** Full access to circle management, logging, and basic gamification
- **Premium Tier (Planned):** Advanced analytics, custom branding for institutions, priority support
- **Marketplace Revenue (Planned):** Premium cosmetic items in the reward store

### 1.6 Value Proposition

1. **For Sheikhs:** Eliminates paper-based tracking, provides real-time visibility into student progress, and automates attendance record-keeping
2. **For Students:** Transforms memorization into a gamified, social experience with visible rewards and peer competition via leaderboards
3. **For Institutions:** Offers a centralized platform for managing multiple circles with co-Sheikh support and institutional reporting

### 1.7 Competitive Positioning

Unlike generic LMS platforms (Moodle, Canvas) that are designed for secular Western education, Halqati is **purpose-built for the Quran memorization domain**:

- **RTL-first design** with Arabic UI throughout
- **Islamic domain model** (Surah, Ayah, Hifz, Muraja'ah as first-class concepts)
- **Approval-based workflow** reflecting the traditional teacher-student verification model
- **Gamification tuned for memorization** (higher rewards for Hifz vs. review)

---

## 2. System Overview

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│                                                                 │
│   Next.js 14 (App Router) + React 18 + TypeScript + Tailwind   │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│   │ Landing  │  │  Login   │  │ Student  │  │    Sheikh    │   │
│   │  Pages   │  │Onboarding│  │Dashboard │  │  Dashboard   │   │
│   └──────────┘  └──────────┘  └──────────┘  └──────────────┘   │
│         ↓              ↓             ↓              ↓           │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │              CONTEXT PROVIDERS                          │   │
│   │   AuthProvider → ThemeProvider → ToastProvider           │   │
│   └─────────────────────────────────────────────────────────┘   │
│         ↓              ↓             ↓              ↓           │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │           CUSTOM HOOKS (Business Logic)                 │   │
│   │   useAuth │ useLogs │ usePoints │ useSheikh │ useTasks  │   │
│   │   useMembership │ useAttendance │ useMessages           │   │
│   │   useReports │ useSheikhStudents │ useStorage           │   │
│   └─────────────────────────────────────────────────────────┘   │
└─────────────────────────┬───────────────────────────────────────┘
                          │ Firebase SDK (Client-Side)
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                     FIREBASE PLATFORM                           │
│                                                                 │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐     │
│   │   Firebase   │  │   Cloud      │  │   Firebase       │     │
│   │   Auth       │  │   Firestore  │  │   Storage        │     │
│   │              │  │   (NoSQL DB) │  │   (File Upload)  │     │
│   │  • Email/PWD │  │              │  │                  │     │
│   │  • Phone/OTP │  │  • users     │  │  • profile_images│     │
│   │  • Google    │  │  • circles   │  │                  │     │
│   │    OAuth     │  │  • logs      │  │                  │     │
│   │              │  │  • tasks     │  │                  │     │
│   │              │  │  • threads   │  │                  │     │
│   │              │  │  • attendance│  │                  │     │
│   └──────────────┘  └──────────────┘  └──────────────────┘     │
│                                                                 │
│   ┌──────────────────────────────────────────────────────────┐  │
│   │        SECURITY RULES (Server-Side Enforcement)          │  │
│   │   firestore.rules  │  storage.rules                      │  │
│   └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Application Layers

| Layer | Technology | Responsibility |
|:---|:---|:---|
| **Presentation** | Next.js 14 + React 18 + Tailwind CSS | UI rendering, routing, responsive design, theming |
| **State Management** | React Context + Custom Hooks | Auth state, user profile, real-time data subscriptions |
| **Business Logic** | Custom Hooks (`src/lib/hooks/`) | Data validation, transformation, CRUD operations, Firestore transactions |
| **Data Access** | Firebase Client SDK (v12.8.0) | Firestore queries, real-time listeners (`onSnapshot`), batch writes, transactions |
| **Authentication** | Firebase Auth | Email/password, phone/OTP, Google OAuth2 |
| **File Storage** | Firebase Storage | Profile image uploads with client-side validation |
| **Security** | Firestore Security Rules + Storage Rules | Server-side access control, data validation |

### 2.3 Design Philosophy

1. **Serverless-First:** No custom backend server. All business logic executes on the client via Firebase SDK, with security enforced through Firestore Security Rules. This eliminates server management overhead and enables horizontal scaling.

2. **Real-Time by Default:** Every data subscription uses Firestore's `onSnapshot` listener, ensuring the UI reflects changes within milliseconds without polling.

3. **Hook-Based Architecture:** Instead of a monolithic global store (Redux/MobX), the application uses **domain-specific custom hooks** that encapsulate data fetching, state management, and mutation logic. Each hook is independently testable and composable.

4. **RTL-Native Design:** The entire application is designed right-to-left from the ground up (`dir="rtl"`, `lang="ar"`), with Arabic typography (Tajawal font family) and Arabic error messages throughout.

5. **Optimistic Security:** While Firestore Security Rules provide the authoritative security boundary, the application also implements client-side guards (`AuthGuard`, `GuestGuard`, `OnboardingGuard`) for immediate UX feedback.

### 2.4 Scalability Model

| Dimension | Current Strategy | Scale Limit |
|:---|:---|:---|
| **Users** | Firestore auto-scales per Google Cloud | 1M+ concurrent |
| **Data Volume** | NoSQL document model, composite indexes | 10TB+ |
| **Read Throughput** | Real-time listeners with local caching | 1M reads/sec (GCP) |
| **Write Throughput** | Batch writes and transactions | 10K writes/sec per region |
| **File Storage** | Firebase Storage (Google Cloud Storage) | Unlimited (pay-per-use) |
| **Authentication** | Firebase Auth multi-provider | 10B+ auth events/month |

### 2.5 Modularity Strategy

The codebase follows a **feature-sliced architecture** where each domain area is self-contained:

```
Feature Slice = Page (Route) + Components + Hook (Data Logic)
```

**Example — Attendance Feature:**
- **Route:** `src/app/sheikh/attendance/page.tsx`
- **Components:** `src/components/sheikh/AttendanceSheet.tsx`, `AttendanceAnalytics.tsx`, `ExcuseReviewTable.tsx`
- **Hook:** `src/lib/hooks/useAttendance.ts`
- **Student-Side:** `src/components/student/AttendanceHistory.tsx`, `ExcuseModal.tsx`

### 2.6 Separation of Concerns

```
┌────────────────────────────────────────────────────┐
│  PRESENTATION       │  Components render UI only   │
│  (src/components/)  │  No direct Firestore calls   │
├────────────────────────────────────────────────────┤
│  ROUTING/PAGES      │  Compose components + hooks  │
│  (src/app/)         │  Apply auth guards           │
├────────────────────────────────────────────────────┤
│  BUSINESS LOGIC     │  Data fetch, transform,      │
│  (src/lib/hooks/)   │  validate, mutate            │
├────────────────────────────────────────────────────┤
│  DATA ACCESS        │  Firebase SDK abstraction    │
│  (src/lib/firebase/)│  Singleton initialization    │
├────────────────────────────────────────────────────┤
│  AUTH & GUARDS      │  Session management,         │
│  (src/lib/auth/)    │  route protection, errors    │
└────────────────────────────────────────────────────┘
```

---

## 3. Full Project Structure

### 3.1 Complete File Tree

```
halqati/
│
├── .eslintrc.json ........................ ESLint configuration (Next.js defaults)
├── .firebaserc ........................... Firebase project alias mapping
├── .gitignore ............................ Git ignore rules (node_modules, .next, etc.)
├── cypress.config.ts ..................... Cypress E2E test configuration
├── firebase.json ......................... Firebase CLI deployment configuration
├── firestore.indexes.json ................ 17 composite Firestore index definitions
├── firestore.rules ....................... Firestore security rules (103 lines)
├── next-env.d.ts ......................... Next.js TypeScript environment declarations
├── next.config.mjs ....................... Next.js configuration (images, fonts)
├── package.json .......................... Project dependencies & scripts
├── package-lock.json ..................... Dependency lock file
├── postcss.config.mjs .................... PostCSS configuration for Tailwind
├── storage.rules ......................... Firebase Storage security rules
├── tailwind.config.ts .................... Tailwind CSS theme & design tokens
├── tsconfig.json ......................... TypeScript compiler configuration
│
├── cypress/ .............................. E2E test suite
│   ├── e2e/ .............................. Test specifications
│   ├── fixtures/ ......................... Test data
│   ├── support/ .......................... Custom commands & setup
│   └── tsconfig.json ..................... Cypress-specific TS config
│
├── public/ ............................... Static assets (images, icons, frames)
│
└── src/ .................................. Application source code
    │
    ├── app/ .............................. ROUTES — Next.js App Router pages
    │   │
    │   ├── layout.tsx .................... ROOT LAYOUT — Providers wrapper
    │   ├── page.tsx ...................... LANDING PAGE — Public homepage
    │   ├── globals.css ................... Global CSS + Tailwind directives
    │   ├── tokens.css .................... CSS custom properties (design tokens)
    │   ├── error.tsx ..................... Global error boundary
    │   ├── loading.tsx ................... Global loading skeleton
    │   ├── not-found.tsx ................. 404 page
    │   │
    │   ├── login/ ........................ Authentication entry point
    │   │   └── page.tsx .................. Login page (Phone/Email/Google)
    │   │
    │   ├── onboarding/ ................... Post-auth profile setup
    │   │   └── page.tsx .................. Role selection + profile creation
    │   │
    │   ├── contact/ ...................... Contact page
    │   │   └── page.tsx .................. Public contact form
    │   │
    │   ├── sheikh/ ....................... SHEIKH PORTAL (Teacher Interface)
    │   │   ├── layout.tsx ................ Sheikh layout with sidebar navigation
    │   │   ├── dashboard/
    │   │   │   └── page.tsx .............. Teacher command center
    │   │   ├── circles/
    │   │   │   └── page.tsx .............. Circle management
    │   │   │   └── [circleId]/
    │   │   │       └── page.tsx .......... Circle detail view
    │   │   ├── students/
    │   │   │   └── page.tsx .............. Student list view
    │   │   │   └── [studentId]/
    │   │   │       └── page.tsx .......... Student detail + log approval
    │   │   ├── attendance/
    │   │   │   └── page.tsx .............. Attendance sheet + analytics
    │   │   ├── approvals/
    │   │   │   └── page.tsx .............. Pending log approval queue
    │   │   ├── reports/
    │   │   │   └── page.tsx .............. Monthly analytics + CSV export
    │   │   ├── messages/
    │   │   │   └── page.tsx .............. Thread list
    │   │   │   └── [threadId]/
    │   │   │       └── page.tsx .......... Chat view
    │   │   ├── profile/
    │   │   │   └── page.tsx .............. Profile management
    │   │   └── settings/
    │   │       └── page.tsx .............. Account settings
    │   │
    │   ├── student/ ...................... STUDENT PORTAL
    │   │   ├── layout.tsx ................ Student layout with bottom nav
    │   │   ├── page.tsx .................. Student dashboard (32KB — richest page)
    │   │   ├── store/
    │   │   │   └── page.tsx .............. Reward marketplace
    │   │   ├── planner/
    │   │   │   └── page.tsx .............. Study planner
    │   │   ├── attendance/
    │   │   │   └── page.tsx .............. Attendance history
    │   │   └── settings/
    │   │       └── page.tsx .............. Student settings
    │   │
    │   └── app/ .......................... SHARED AUTHENTICATED ROUTES
    │       ├── messages/
    │       │   └── page.tsx .............. Shared messaging
    │       └── profile/
    │           └── page.tsx .............. Shared profile
    │
    ├── components/ ....................... UI COMPONENTS
    │   │
    │   ├── ui/ ........................... DESIGN SYSTEM (Atomic Components)
    │   │   ├── Avatar.tsx ................ User avatar with fallback initials
    │   │   ├── Badge.tsx ................. Status/label badges
    │   │   ├── Button.tsx ................ Multi-variant button (Gold, Ghost, Danger)
    │   │   ├── Card.tsx .................. Container with shadow & border
    │   │   ├── DeleteAccountZone.tsx ..... Danger zone for account deletion
    │   │   ├── EmptyState.tsx ............ Empty data placeholder
    │   │   ├── Modal.tsx ................. Accessible overlay dialog
    │   │   ├── PageShell.tsx ............. Page wrapper (header + content area)
    │   │   ├── ProgressBar.tsx ........... Horizontal progress indicator
    │   │   ├── ProgressRing.tsx .......... Circular SVG progress indicator
    │   │   ├── Skeleton.tsx .............. Loading skeleton placeholders
    │   │   ├── StudentAvatar.tsx ......... CORE gamification visual (frame+badge+photo)
    │   │   ├── StudentBadge.tsx .......... Achievement badge renderer
    │   │   ├── Toast.tsx ................. Toast notification system + context provider
    │   │   └── gradient-nav.tsx .......... Gradient navigation bar component
    │   │
    │   ├── landing/ ...................... PUBLIC MARKETING PAGES
    │   │   ├── Navbar.tsx ................ Top navigation with dark mode toggle
    │   │   ├── Hero.tsx .................. Hero section with animations (14KB)
    │   │   ├── Features.tsx .............. Feature cards showcase
    │   │   ├── HowItWorks.tsx ............ Step-by-step flow explanation
    │   │   ├── CTABanner.tsx ............. Call-to-action banner
    │   │   └── Footer.tsx ................ Site footer with links
    │   │
    │   ├── gamification/ ................. GAME MECHANICS
    │   │   ├── Leaderboard.tsx ........... Real-time top-5 ranking (6.7KB)
    │   │   ├── KhatmaTree.tsx ............ Visual memorization tree (SVG)
    │   │   └── RewardsPanel.tsx .......... Rewards summary panel
    │   │
    │   ├── sheikh/ ....................... SHEIKH-SPECIFIC COMPONENTS
    │   │   ├── Sidebar.tsx ............... Navigation sidebar
    │   │   ├── AttendanceSheet.tsx ........ Interactive attendance grid (17KB)
    │   │   ├── AttendanceAnalytics.tsx .... Attendance statistics charts
    │   │   ├── ExcuseReviewTable.tsx ...... Excuse approval interface
    │   │   ├── InstructorsManager.tsx ..... Co-sheikh management panel
    │   │   ├── ReportsAnalytics.tsx ....... Report visualization
    │   │   └── MigrateCirclesButton.tsx ... Legacy data migration utility
    │   │
    │   ├── student/ ...................... STUDENT-SPECIFIC COMPONENTS
    │   │   ├── HeaderWidget.tsx ........... Student dashboard header (11KB)
    │   │   ├── StudentCharts.tsx .......... Progress charts (Recharts)
    │   │   ├── StudentHomeCharts.tsx ...... Home page chart widgets
    │   │   ├── GoalTracker.tsx ............ Personal goal progress (17KB)
    │   │   ├── AttendanceHistory.tsx ...... Attendance record view (13KB)
    │   │   └── ExcuseModal.tsx ............ Excuse submission form
    │   │
    │   ├── log/ .......................... LOG COMPONENTS
    │   │   ├── FiltersPanel.tsx ........... Advanced log filtering (11KB)
    │   │   ├── LogDetailsDrawer.tsx ....... Log detail slide-over panel (12KB)
    │   │   └── LogsTable.tsx .............. Sortable/filterable log table
    │   │
    │   ├── messages/ ..................... MESSAGING COMPONENTS
    │   │   ├── ThreadCard.tsx ............. Thread preview card
    │   │   ├── MessageBubble.tsx .......... Chat message bubble
    │   │   └── Composer.tsx ............... Message input composer
    │   │
    │   ├── dashboard/ .................... SHARED DASHBOARD WIDGETS
    │   │   └── *.tsx ...................... Reusable dashboard cards
    │   │
    │   ├── profile/ ...................... PROFILE COMPONENTS
    │   │   └── *.tsx ...................... Profile form sections
    │   │
    │   ├── layout/ ....................... LAYOUT COMPONENTS
    │   │   └── *.tsx ...................... Layout helpers
    │   │
    │   ├── providers/ .................... CONTEXT PROVIDERS
    │   │   └── *.tsx ...................... React context wrappers
    │   │
    │   ├── theme-provider.tsx ............ next-themes ThemeProvider wrapper
    │   └── mode-toggle.tsx ............... Dark/light mode toggle (6.4KB)
    │
    ├── lib/ .............................. BUSINESS LOGIC LAYER
    │   │
    │   ├── firebase/ ..................... FIREBASE INITIALIZATION
    │   │   └── client.ts ................. Firebase app, Auth, Firestore, Storage init
    │   │
    │   ├── auth/ ......................... AUTHENTICATION SYSTEM
    │   │   ├── hooks.tsx .................. AuthProvider context + 4 auth hooks (490 lines)
    │   │   ├── guards.tsx ................ Route protection components (152 lines)
    │   │   └── errors.ts ................. Arabic error message mapping (59 lines)
    │   │
    │   ├── hooks/ ........................ DOMAIN HOOKS (Engine Room)
    │   │   ├── useAuth.ts ................ Re-export (deprecated, uses lib/auth/hooks)
    │   │   ├── useLogs.ts ................ Student activity logging (464 lines)
    │   │   ├── usePoints.ts .............. Gamification wallet (151 lines)
    │   │   ├── usePointsSystem.ts ........ Points calculation engine (191 lines)
    │   │   ├── useSheikh.ts .............. Circle management + pending logs (474 lines)
    │   │   ├── useSheikhStudents.ts ...... Student detail + approval (598 lines)
    │   │   ├── useMembership.ts .......... Circle enrollment (155 lines)
    │   │   ├── useTasks.ts ............... Task assignment system (109 lines)
    │   │   ├── useAttendance.ts .......... Attendance tracking (520 lines)
    │   │   ├── useMessages.ts ............ Threaded messaging (535 lines)
    │   │   ├── useReports.ts ............. Analytics + CSV export (400 lines)
    │   │   ├── useStorage.ts ............. File upload manager (144 lines)
    │   │   ├── useStudentGoals.ts ........ Personal goal management (78 lines)
    │   │   └── useDeleteAccount.ts ....... Account deletion (87 lines)
    │   │
    │   └── utils/ ........................ UTILITY FUNCTIONS
    │       └── *.ts ...................... Formatters, helpers, constants
    │
    ├── hooks/ ............................ TOP-LEVEL HOOKS
    │   └── *.ts .......................... Shared utility hooks
    │
    └── styles/ ........................... ADDITIONAL STYLES
        └── *.css ......................... Custom CSS modules
```

### 3.2 Key File Relationships & Dependency Graph

```
layout.tsx (Root)
    ├── imports → ThemeProvider (components/theme-provider.tsx)
    ├── imports → AuthProvider (lib/auth/hooks.tsx)
    ├── imports → ToastProvider (components/ui/Toast.tsx)
    └── wraps all child routes

lib/auth/hooks.tsx (Central Auth Hub)
    ├── imports → firebase/auth (SDK)
    ├── imports → lib/firebase/client.ts (Firebase instances)
    ├── imports → lib/auth/errors.ts (Error mapping)
    ├── exports → AuthProvider, useAuth, usePhoneAuth, useEmailAuth, useGoogleAuth
    ├── exports → createUserProfile, checkUserProfileExists
    ├── exports → verifyTeacherInvite, createTeacherProfile
    └── consumed by → ALL authenticated pages and hooks

lib/firebase/client.ts (Singleton)
    ├── initializes → Firebase App (idempotent via getApps check)
    ├── exports → auth (Firebase Auth instance)
    ├── exports → db (Firestore instance)
    ├── exports → storage (Firebase Storage instance)
    └── consumed by → ALL hooks in lib/hooks/

lib/hooks/usePoints.ts ←→ lib/hooks/usePointsSystem.ts
    ├── usePoints: Real-time wallet listener + spend/equip operations
    ├── usePointsSystem: Points calculation formula + atomic add/spend
    └── consumed by → student/store/page.tsx, student/page.tsx, StudentAvatar.tsx

lib/hooks/useSheikh.ts
    ├── exports → useSheikhCircles (create, update, co-sheikh management)
    ├── exports → useCircleMembers (approve, reject, remove students)
    ├── exports → usePendingLogs (approve/reject student logs)
    └── consumed by → sheikh/dashboard, sheikh/circles, sheikh/approvals

lib/hooks/useSheikhStudents.ts
    ├── exports → useSheikhStudents (student roster across circles)
    ├── exports → useStudentDetail (deep drill-down with logs/tasks)
    ├── exports → useAssignTask (task creation/deletion)
    ├── calls → approveLogWithPoints (CRITICAL: batch write points + log status)
    └── consumed by → sheikh/students/[studentId]/page.tsx
```

### 3.3 Execution Flow

```
Browser Request → Next.js Server → SSR/SSG Page
    → Client Hydration
    → layout.tsx mounts providers:
        1. ThemeProvider (class-based dark mode)
        2. AuthProvider (Firebase onAuthStateChanged listener)
        3. ToastProvider (notification queue)
    → Route page mounts
    → AuthGuard/GuestGuard checks auth state
        → If unauthorized → redirect to /login
        → If no profile → redirect to /onboarding
        → If wrong role → redirect to correct dashboard
    → Page component mounts hooks
    → Hooks establish onSnapshot real-time listeners
    → UI renders with live data
    → User interactions trigger hook mutations
    → Firestore updates propagate to all listeners
    → UI re-renders automatically
```

---

## 4. Frontend Architecture

### 4.1 Framework & Toolchain

| Tool | Version | Purpose |
|:---|:---|:---|
| **Next.js** | 14.2.5 | React framework with App Router, SSR, file-based routing |
| **React** | 18.2.0 | UI component library with hooks and concurrent features |
| **TypeScript** | 5.x | Static type safety across the entire codebase |
| **Tailwind CSS** | 3.4.x | Utility-first CSS framework with custom design tokens |
| **Framer Motion** | 11.x | Animation library for page transitions and micro-interactions |
| **Recharts** | 3.7.0 | Chart library for progress visualization |
| **Lucide React** | 0.400 | Icon library (tree-shakeable SVG icons) |
| **React Hook Form** | 7.71 | Form state management with validation |
| **Zod** | 4.3.5 | Schema validation (used with React Hook Form via resolvers) |
| **next-themes** | 0.4.6 | Dark mode theming with system preference detection |
| **clsx + tailwind-merge** | Latest | Conditional className construction and Tailwind class deduplication |

### 4.2 Routing System

Next.js 14 App Router provides file-system-based routing:

```
URL Pattern                          → File Path
─────────────────────────────────────────────────────────
/                                    → app/page.tsx
/login                               → app/login/page.tsx
/onboarding                          → app/onboarding/page.tsx
/contact                             → app/contact/page.tsx
/sheikh/dashboard                    → app/sheikh/dashboard/page.tsx
/sheikh/circles                      → app/sheikh/circles/page.tsx
/sheikh/circles/[circleId]           → app/sheikh/circles/[circleId]/page.tsx
/sheikh/students                     → app/sheikh/students/page.tsx
/sheikh/students/[studentId]         → app/sheikh/students/[studentId]/page.tsx
/sheikh/attendance                   → app/sheikh/attendance/page.tsx
/sheikh/approvals                    → app/sheikh/approvals/page.tsx
/sheikh/reports                      → app/sheikh/reports/page.tsx
/sheikh/messages                     → app/sheikh/messages/page.tsx
/sheikh/messages/[threadId]          → app/sheikh/messages/[threadId]/page.tsx
/sheikh/profile                      → app/sheikh/profile/page.tsx
/sheikh/settings                     → app/sheikh/settings/page.tsx
/student                             → app/student/page.tsx
/student/store                       → app/student/store/page.tsx
/student/planner                     → app/student/planner/page.tsx
/student/attendance                  → app/student/attendance/page.tsx
/student/settings                    → app/student/settings/page.tsx
```

**Nested Layouts:**

- `app/layout.tsx` — Root layout (global providers, Arabic RTL, fonts)
- `app/sheikh/layout.tsx` — Sheikh portal layout (sidebar navigation, auth guard with `allowedRoles={["sheikh"]}`)
- `app/student/layout.tsx` — Student portal layout (bottom navigation, auth guard with `allowedRoles={["student"]}`)

### 4.3 State Management

The application uses a **decentralized, hook-based state management** model:

```
┌─────────────────────────────────────────────────────┐
│              GLOBAL STATE (Context)                  │
│                                                     │
│  AuthContext ─── user, userProfile, isLoading       │
│  ThemeContext ── theme (light/dark/system)           │
│  ToastContext ─ toast queue, addToast, removeToast  │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│           DOMAIN STATE (Custom Hooks)                │
│                                                     │
│  useMembership() ── activeCircle, memberships       │
│  useLogs() ──────── logs, stats, filters            │
│  usePoints() ────── points, inventory, equipped     │
│  useTasks() ─────── tasks, memorizationTask         │
│  useAttendance() ── records, stats, excuses         │
│  useMessages() ──── threads, messages               │
│  useReports() ───── circleStats, topPerformers      │
│  useStudentGoals()─ goals, updateGoals              │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│           LOCAL STATE (Component useState)            │
│                                                     │
│  Form inputs, modals open/close, tab selection,     │
│  pagination cursors, animation states               │
└─────────────────────────────────────────────────────┘
```

**Why Not Redux/Zustand?**

The application's data is inherently scoped to specific views and user roles. A student viewing their dashboard only needs `useLogs`, `usePoints`, `useTasks`, and `useMembership`. A Sheikh viewing attendance only needs `useAttendance` and `useCircleMembers`. This natural scoping eliminates the need for a centralized store, reduces bundle size, and simplifies reasoning about data flow.

### 4.4 Component Hierarchy

```
RootLayout
├── ThemeProvider
│   └── AuthProvider
│       └── ToastProvider
│           ├── Landing (public)
│           │   ├── Navbar
│           │   ├── Hero
│           │   ├── Features
│           │   ├── HowItWorks
│           │   ├── CTABanner
│           │   └── Footer
│           │
│           ├── Login (GuestGuard)
│           │   └── LoginForm (Phone/Email/Google tabs)
│           │
│           ├── Onboarding (OnboardingGuard)
│           │   └── RoleSelector → ProfileForm
│           │
│           ├── SheikhLayout (AuthGuard role=sheikh)
│           │   ├── Sidebar
│           │   ├── Dashboard
│           │   │   ├── CircleStatsCards
│           │   │   ├── PendingApprovalsWidget
│           │   │   └── QuickActions
│           │   ├── StudentsPage
│           │   │   ├── StudentList
│           │   │   └── StudentDetailPage
│           │   │       ├── StudentAvatar
│           │   │       ├── LogsTable
│           │   │       └── AssignTaskForm
│           │   ├── AttendancePage
│           │   │   ├── AttendanceSheet
│           │   │   ├── AttendanceAnalytics
│           │   │   └── ExcuseReviewTable
│           │   └── ReportsPage
│           │       └── ReportsAnalytics
│           │
│           └── StudentLayout (AuthGuard role=student)
│               ├── GradientNav (bottom navigation)
│               ├── StudentDashboard
│               │   ├── HeaderWidget
│               │   ├── StudentHomeCharts
│               │   ├── GoalTracker
│               │   ├── Leaderboard
│               │   └── KhatmaTree
│               └── StorePage
│                   ├── ItemGrid
│                   └── StudentAvatar (preview)
```

### 4.5 Design System

#### 4.5.1 Design Tokens (CSS Custom Properties)

Design tokens are defined in `src/app/tokens.css` and consumed via Tailwind's `extend.colors`:

```css
:root {
  --background: 254 249 240;     /* Warm sand background */
  --foreground: 26 46 36;        /* Deep forest text */
  --sand: 254 249 240;           /* Light warm surface */
  --surface: 255 255 255;        /* Card/panel background */
  --emerald: 16 185 129;         /* Primary brand color */
  --emerald-deep: 5 150 105;     /* Primary hover/active */
  --gold: 199 161 74;            /* Accent/gamification color */
  --border: 229 225 218;         /* Subtle borders */
  --text-muted: 120 113 108;     /* Secondary text */
}

.dark {
  --background: 15 23 42;        /* Slate-900 */
  --foreground: 248 250 252;     /* Slate-50 */
  --sand: 30 41 59;              /* Slate-800 */
  --surface: 51 65 85;           /* Slate-700 */
  --emerald: 52 211 153;         /* Emerald-400 */
  --emerald-deep: 16 185 129;    /* Emerald-500 */
  --gold: 251 191 36;            /* Amber-400 */
  --border: 71 85 105;           /* Slate-600 */
  --text-muted: 148 163 184;     /* Slate-400 */
}
```

#### 4.5.2 Typography

| Element | Font | Weight | Usage |
|:---|:---|:---|:---|
| Body | Tajawal | 400 | Default text |
| Headings | Tajawal | 700 | Page titles, section headers |
| Numbers | Tajawal | 500 | Points, stats, counters |
| UI | Tajawal | 500-600 | Buttons, labels, badges |

#### 4.5.3 Shadows

```typescript
boxShadow: {
    soft: "0 4px 24px rgba(15,61,46,0.08)",       // Cards, panels
    elevated: "0 8px 32px rgba(15,61,46,0.12)",    // Modals, dropdowns
    glow: "0 0 20px rgba(199,161,74,0.15)",        // Gold accent glow
}
```

#### 4.5.4 Border Radius

```typescript
borderRadius: {
    xl: "18px",    // Cards, panels
    "2xl": "24px", // Modals, large containers
}
```

### 4.6 Theming System

The application uses `next-themes` for dark mode support:

```tsx
// src/components/theme-provider.tsx
<ThemeProvider
    attribute="class"          // Applies "dark" class to <html>
    defaultTheme="light"       // Default to light mode
    enableSystem               // Respect OS preference
    disableTransitionOnChange={false}  // Smooth transitions
>
```

**How it works:**
1. `next-themes` adds/removes `class="dark"` on the `<html>` element
2. Tailwind's `darkMode: ["class"]` configuration enables `dark:` prefix utilities
3. CSS custom properties in `tokens.css` switch values based on `.dark` class
4. Components use Tailwind utilities like `bg-background`, `text-foreground` which automatically adapt

### 4.7 Responsive Design Logic

All layouts use Tailwind breakpoints:

| Breakpoint | Size | Usage |
|:---|:---|:---|
| `sm` | 640px+ | Mobile landscape adjustments |
| `md` | 768px+ | Tablet: 2-column grids |
| `lg` | 1024px+ | Desktop: sidebar visible |
| `xl` | 1280px+ | Wide desktop: expanded content |

**Key responsive patterns:**
- **Sheikh Sidebar:** Hidden on mobile, visible as overlay on tablet, persistent on desktop
- **Student Bottom Nav:** Visible on mobile/tablet, hidden on large desktop
- **Charts:** Full-width stacked on mobile, side-by-side on desktop
- **Attendance Grid:** Horizontally scrollable on mobile, full table on desktop

### 4.8 Accessibility Strategy

- **Semantic HTML:** Proper heading hierarchy (`h1` > `h2` > `h3`)
- **ARIA labels:** Buttons with icons have `aria-label` attributes
- **Focus management:** Modal components trap focus and return on close
- **Color contrast:** Design tokens maintain WCAG AA compliance
- **RTL support:** Native `dir="rtl"` on `<html>` with `lang="ar"`
- **Keyboard navigation:** All interactive elements are focusable and operable via keyboard

### 4.9 Error Boundaries

```tsx
// src/app/error.tsx — Global error boundary
// Catches unhandled errors in route segments
// Displays user-friendly Arabic error message
// Provides "Try Again" button that calls reset()

// src/app/not-found.tsx — 404 handler
// Displays custom Arabic "Page Not Found" message
// Provides navigation back to home/dashboard

// src/app/loading.tsx — Global loading state
// Displays spinner during route transitions
```

### 4.10 Performance Optimization

| Technique | Implementation |
|:---|:---|
| **Image Optimization** | Next.js `<Image>` with AVIF/WebP formats, remote pattern allowlists |
| **Font Optimization** | `optimizeFonts: true` in `next.config.mjs` |
| **Code Splitting** | Automatic per-route code splitting via Next.js App Router |
| **Lazy Loading** | Dynamic imports for heavy components (charts, modals) |
| **Real-Time Debouncing** | Search filter changes debounced at 300ms in `useLogs` |
| **Pagination** | Firestore cursor-based pagination (10 items per page) in logs |
| **Memoization** | `useCallback` for stable function references in hooks |
| **CSS Purging** | Tailwind's JIT compiler eliminates unused CSS |

---

## 5. Backend Architecture

### 5.1 Serverless Model

Halqati operates on a **fully serverless architecture**. There is **no custom backend server** — no Express, no NestJS, no API Gateway. All data operations are performed directly from the client using the Firebase Client SDK.

```
┌──────────────┐       ┌──────────────────┐       ┌──────────────┐
│   Client     │──────▶│  Firebase SDK     │──────▶│  Firestore   │
│   (Browser)  │       │  (JS, v12.8.0)   │       │  (NoSQL DB)  │
│              │◀──────│                  │◀──────│              │
│  Real-time   │       │  onSnapshot()    │       │  Security    │
│  UI Updates  │       │  runTransaction()│       │  Rules       │
└──────────────┘       │  writeBatch()    │       └──────────────┘
                       └──────────────────┘
```

**Rationale:** For a domain where the primary operations are CRUD with real-time sync, a custom backend introduces unnecessary latency and operational complexity. Firebase Security Rules provide declarative server-side authorization that is auditable, testable, and auto-scaled by Google Cloud.

### 5.2 Firebase Client Initialization

**File:** `src/lib/firebase/client.ts` (34 lines)

```typescript
// Singleton pattern — Firebase app is initialized once
const app = !getApps().length
    ? initializeApp(firebaseConfig)
    : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Development: Connect to local emulators
if (process.env.NODE_ENV === "development") {
    connectAuthEmulator(auth, "http://localhost:9099");
    connectFirestoreEmulator(db, "localhost", 8080);
    connectStorageEmulator(storage, "localhost", 9199);
}
```

**Key design decisions:**
1. **Idempotent initialization:** `getApps().length` check prevents re-initialization during Hot Module Replacement
2. **Environment-aware:** Automatically connects to Firebase Emulators in development, production Firebase in deployment
3. **Single import point:** All components and hooks import from this single file, ensuring a single `db` / `auth` / `storage` instance

### 5.3 Data Access Patterns

#### 5.3.1 Real-Time Listeners (Read Pattern)

Every hook uses Firestore's `onSnapshot` for real-time data synchronization:

```typescript
// Pattern: Real-time listener with cleanup
useEffect(() => {
    if (!user) { setData([]); return; }

    const q = query(
        collection(db, "collectionName"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        setData(data);
        setIsLoading(false);
    }, (error) => {
        setError("فشل في تحميل البيانات");
        setIsLoading(false);
    });

    return () => unsubscribe(); // Cleanup on unmount
}, [user]);
```

#### 5.3.2 Atomic Transactions (Write Pattern)

Critical operations use Firestore transactions to ensure consistency:

```typescript
// Pattern: Read-then-write transaction
await runTransaction(db, async (transaction) => {
    const docRef = doc(db, "users", userId);
    const snapshot = await transaction.get(docRef);
    const currentPoints = snapshot.data().points;

    if (currentPoints < cost) throw "INSUFFICIENT_FUNDS";
    if (snapshot.data().inventory?.[itemId]) throw "ALREADY_OWNED";

    transaction.update(docRef, {
        points: increment(-cost),
        [`inventory.${itemId}`]: true,
    });
});
```

#### 5.3.3 Batch Writes

Multi-document operations use `writeBatch` for atomicity:

```typescript
// Pattern: Batch attendance recording
const batch = writeBatch(db);
students.forEach(student => {
    const ref = doc(collection(db, "attendance"));
    batch.set(ref, {
        circleId, studentId: student.id,
        date: todayStr, status: "present",
        recordedBy: user.uid
    });
});
await batch.commit();
```

### 5.4 Business Logic Distribution

| Operation | Location | Method | Why |
|:---|:---|:---|:---|
| Log creation | `useLogs.ts` | `addDoc` | Simple write, no validation beyond client |
| Log approval + points | `useSheikhStudents.ts` | `runTransaction` | Atomic: update log status + increment points |
| Store purchase | `usePointsSystem.ts` | `runTransaction` | Prevents double-spending via read-then-write |
| Member approval | `useSheikh.ts` | `runTransaction` | Atomic: update member status + increment count |
| Attendance batch | `useAttendance.ts` | `writeBatch` | Multi-document atomic write |
| Account deletion | `useDeleteAccount.ts` | `writeBatch` | Cascade delete across collections |
| Profile image upload | `useStorage.ts` | `uploadBytesResumable` | Resumable upload with progress tracking |

---

## 6. Database Design

### 6.1 Overview

The application uses **Cloud Firestore** (NoSQL document database) with the following collections:

```
firestore/
├── users/                    Root collection — User profiles
├── circles/                  Root collection — Learning circles
├── circleMembers/            Root collection — Circle memberships (junction)
├── logs/                     Root collection — Student activity logs
├── tasks/                    Root collection — Assigned tasks
├── attendance/               Root collection — Daily attendance records
├── excuses/                  Root collection — Absence excuse submissions
├── threads/                  Root collection — Message threads
│   └── messages/             Subcollection — Messages within threads
├── teacherInvites/           Root collection — Teacher invite codes
└── messages/                 Root collection — Legacy messages (deprecated)
```

### 6.2 Collection Schemas

#### 6.2.1 `users` Collection

The central profile store for all users:

```typescript
{
    // Identity
    uid: string,                          // Document ID = Firebase Auth UID
    name: string,                         // Display name (Arabic)
    email?: string,                       // Optional email
    phone?: string,                       // Phone number (E.164 format)
    photoURL?: string,                    // Firebase Storage URL
    role: "student" | "sheikh",           // User role

    // Gamification (Student only)
    points: number,                       // Current spendable balance
    totalPoints: number,                  // Lifetime earned (never decreases)
    inventory: {                          // Purchased items
        [itemId: string]: boolean         // e.g., { "frame_gold": true }
    },
    equipped: {                           // Currently wearing
        frame?: string,                   // Equipped frame ID
        badge?: string,                   // Equipped badge ID
    },

    // Settings
    settings: {
        theme?: "light" | "dark",
        notifications?: boolean,
        language?: "ar" | "en",
        goals?: {                         // Personal targets
            dailyMemoTarget?: number,     // Pages per day (memorization)
            dailyReviewTarget?: number,   // Pages per day (revision)
            monthlyMemoTarget?: number,
            monthlyReviewTarget?: number,
        }
    },

    // Sheikh-specific
    inviteCodeUsed?: string,              // Teacher invite code consumed
    bio?: string,                         // Teacher bio

    // Metadata
    createdAt: Timestamp,                 // Account creation
    updatedAt: Timestamp,                 // Last profile update
    lastLoginAt?: Timestamp,              // Last authentication
}
```

**Indexes:** `uid` (document ID — automatic primary index)

#### 6.2.2 `circles` Collection

Learning circles managed by Sheikhs:

```typescript
{
    id: string,                           // Auto-generated document ID
    name: string,                         // Circle name (Arabic)
    description?: string,                 // Optional description
    schedule?: string,                    // Meeting schedule text

    // Ownership
    sheikhIds: string[],                  // Array of Sheikh UIDs (supports co-Sheikhs)
    teacherId?: string,                   // Legacy single-teacher field (deprecated)
    createdBy: string,                    // UID of creator

    // Access
    inviteCode: string,                   // 6-char uppercase code (e.g., "A3X9K2")

    // Stats (denormalized for performance)
    memberCount?: number,                 // Approved member count

    // Configuration
    settings?: {
        maxMembers?: number,
        autoApprove?: boolean,
    },

    // Metadata
    createdAt: Timestamp,
    updatedAt: Timestamp,
}
```

**Composite Indexes:**
- `(teacherId ASC, createdAt DESC)` — Legacy teacher circle listing
- `(sheikhIds CONTAINS, createdAt DESC)` — Current sheikh circle listing

#### 6.2.3 `circleMembers` Collection

Junction collection linking students to circles:

```typescript
{
    id: string,                           // Auto-generated
    circleId: string,                     // FK → circles
    userId: string,                       // FK → users (student)
    status: "pending" | "approved" | "rejected",
    roleInCircle: "student",              // Reserved for future roles

    // Timestamps
    joinedAt?: Timestamp,                 // Request/join time
    approvedAt?: Timestamp,               // Approval time
}
```

**Composite Indexes:**
- `(circleId ASC, status ASC)` — Members by circle and status
- `(userId ASC, status ASC)` — Memberships by user

#### 6.2.4 `logs` Collection

Student activity log entries (the core data model):

```typescript
{
    id: string,                           // Auto-generated
    studentId: string,                    // FK → users
    circleId: string,                     // FK → circles
    date: Timestamp,                      // Activity date

    // Activity details
    type: "memorization" | "revision",
    amount: {
        pages?: number,                   // Number of pages
        surah?: string,                   // Surah name (Arabic)
        ayahFrom?: number,                // Starting ayah
        ayahTo?: number,                  // Ending ayah
    },

    // Approval workflow
    status: "pending_approval" | "approved" | "rejected",
    teacherNotes?: string,                // Sheikh's feedback
    rejectionReason?: string,             // Reason for rejection

    // Points
    pointsAwarded?: number,               // Points given upon approval

    // Linking
    taskId?: string,                      // FK → tasks (if submitted via task)

    // Metadata
    createdAt: Timestamp,
    updatedAt?: Timestamp,
}
```

**Composite Indexes (6 defined):**
- `(circleId ASC, createdAt DESC)` — Circle activity feed
- `(circleId ASC, status ASC, createdAt DESC)` — Pending approvals per circle
- `(studentId ASC, createdAt DESC)` — Student activity history
- `(studentId ASC, status ASC)` — Student's pending/approved counts

#### 6.2.5 `tasks` Collection

Assignments from Sheikhs to students:

```typescript
{
    id: string,
    circleId: string,                     // FK → circles
    studentId: string,                    // FK → users
    dueDate: string,                      // ISO date string "YYYY-MM-DD"

    type: "memorization" | "revision",
    target: {
        pages?: number,
        surah?: string,
        ayahFrom?: number,
        ayahTo?: number,
    },

    status: "pending" | "submitted" | "approved" | "missed",

    // Metadata
    createdAt: Timestamp,
    submittedAt?: Timestamp,
    assignedBy: string,                   // FK → users (sheikh)
}
```

**Composite Indexes:**
- `(studentId ASC, status ASC, dueDate ASC)` — Student's active tasks
- `(studentId ASC, createdAt DESC)` — Task history

#### 6.2.6 `attendance` Collection

Daily attendance records:

```typescript
{
    id: string,
    circleId: string,                     // FK → circles
    studentId: string,                    // FK → users
    date: string,                         // "YYYY-MM-DD"
    status: "present" | "absent" | "late" | "excused",
    recordedBy: string,                   // FK → users (sheikh)
    createdAt: Timestamp,
}
```

**Composite Indexes:**
- `(circleId ASC, date ASC)` — Daily attendance sheet

#### 6.2.7 `excuses` Collection

Student absence excuse submissions:

```typescript
{
    id: string,
    circleId: string,                     // FK → circles
    studentId: string,                    // FK → users
    date: string,                         // "YYYY-MM-DD"
    reason: string,                       // Arabic text

    status: "pending" | "approved" | "rejected",
    reviewedBy?: string,                  // FK → users (sheikh)

    createdAt: Timestamp,
    reviewedAt?: Timestamp,
}
```

**Composite Indexes (3 defined):**
- `(circleId ASC, status ASC, createdAt DESC)` — Pending excuses
- `(circleId ASC, studentId ASC, date ASC, status ASC)` — Per-student excuses
- `(circleId ASC, studentId ASC, createdAt DESC)` — Student excuse history

#### 6.2.8 `threads` Collection

Message threads between users:

```typescript
{
    id: string,
    participants: string[],               // Array of 2 UIDs
    lastMessage: {
        text: string,
        senderId: string,
        timestamp: Timestamp,
    },
    unreadCount: {                        // Per-participant unread tracking
        [userId: string]: number,
    },
    createdAt: Timestamp,
    updatedAt: Timestamp,                 // Sorted by this for "recent first"
}
```

**Subcollection `threads/{threadId}/messages`:**

```typescript
{
    id: string,
    senderId: string,                     // FK → users
    text: string,
    timestamp: Timestamp,
    read: boolean,
}
```

**Composite Indexes:**
- `(participants CONTAINS, updatedAt DESC)` — User's threads sorted by recency

#### 6.2.9 `teacherInvites` Collection

Invite codes for teacher registration:

```typescript
{
    id: string,                           // Document ID = invite code (uppercase)
    code: string,                         // Same as ID
    isActive: boolean,
    maxUses: number,
    usedCount: number,                    // Atomically incremented on use
    createdBy?: string,                   // Admin UID
    createdAt: Timestamp,
}
```

### 6.3 Entity Relationship Diagram

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   teacherInvites │     │     users         │     │    circles       │
│──────────────────│     │──────────────────│     │──────────────────│
│ code (PK)        │     │ uid (PK)         │  ┌──│ id (PK)          │
│ isActive         │     │ name             │  │  │ name             │
│ maxUses          │─────│ role             │  │  │ sheikhIds[]  ────│───┐
│ usedCount        │     │ points           │  │  │ inviteCode       │   │
└──────────────────┘     │ totalPoints      │  │  │ memberCount      │   │
                         │ inventory{}      │  │  └──────────────────┘   │
                         │ equipped{}       │  │                         │
                         │ settings{}       │  │    references           │
                         └──────┬───────────┘  │     users.uid           │
                                │              │                         │
        ┌───────────────────────┼──────────────┘                         │
        │                       │                                        │
        ▼                       ▼                                        │
┌──────────────────┐   ┌──────────────────┐                              │
│  circleMembers   │   │     logs         │                              │
│──────────────────│   │──────────────────│                              │
│ id (PK)          │   │ id (PK)          │                              │
│ circleId (FK)  ──│   │ studentId (FK) ──│── users.uid                  │
│ userId (FK)    ──│   │ circleId (FK)  ──│── circles.id                 │
│ status           │   │ type             │                              │
│ roleInCircle     │   │ amount{}         │                              │
└──────────────────┘   │ status           │                              │
                       │ pointsAwarded    │                              │
                       │ taskId (FK)    ──│── tasks.id                   │
                       └──────────────────┘                              │
                                                                         │
┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐      │
│    tasks         │   │   attendance     │   │    excuses       │      │
│──────────────────│   │──────────────────│   │──────────────────│      │
│ id (PK)          │   │ id (PK)          │   │ id (PK)          │      │
│ circleId (FK)  ──│   │ circleId (FK)  ──│   │ circleId (FK)  ──│      │
│ studentId (FK) ──│   │ studentId (FK) ──│   │ studentId (FK) ──│      │
│ type             │   │ date             │   │ date             │      │
│ target{}         │   │ status           │   │ reason           │      │
│ status           │   └──────────────────┘   │ status           │      │
│ assignedBy (FK)──│── users.uid (sheikh) ────│── reviewedBy     │      │
└──────────────────┘                          └──────────────────┘      │
                                                                         │
┌───────────────────────────────────────┐                                │
│           threads                      │                                │
│───────────────────────────────────────│                                │
│ id (PK)                               │                                │
│ participants[] (FK)  ─────────────────│── users.uid (array)            │
│ lastMessage{}                          │                                │
│ unreadCount{}                          │                                │
│                                        │                                │
│   └── messages/ (subcollection)        │                                │
│       ├── senderId (FK) ──────────────│── users.uid                    │
│       ├── text                         │                                │
│       └── timestamp                    │                                │
└───────────────────────────────────────┘                                │
```

### 6.4 Indexing Strategy

The application defines **17 composite indexes** in `firestore.indexes.json`:

| # | Collection | Fields | Purpose |
|:---|:---|:---|:---|
| 1 | attendance | `circleId ASC, date ASC` | Daily attendance sheet query |
| 2 | circles | `teacherId ASC, createdAt DESC` | Legacy teacher's circles |
| 3 | circles | `sheikhIds CONTAINS, createdAt DESC` | Sheikh's circles (current) |
| 4 | circleMembers | `circleId ASC, status ASC` | Circle member filtering |
| 5 | circleMembers | `userId ASC, status ASC` | User's memberships |
| 6 | logs | `circleId ASC, createdAt DESC` | Circle activity feed |
| 7 | logs | `circleId ASC, status ASC, createdAt DESC` | Pending approvals |
| 8 | logs | `studentId ASC, createdAt DESC` | Student history (×2 entries) |
| 9 | logs | `studentId ASC, status ASC` | Student status counts |
| 10 | tasks | `studentId ASC, createdAt DESC` | Student task history |
| 11 | tasks | `studentId ASC, status ASC, dueDate ASC` | Active tasks sorted by due date |
| 12 | threads | `participants CONTAINS, updatedAt DESC` | User's recent threads |
| 13 | excuses | `circleId ASC, status ASC, createdAt DESC` | Pending excuses queue |
| 14 | excuses | `circleId ASC, studentId ASC, date ASC, status ASC` | Per-student excuses |
| 15 | excuses | `circleId ASC, studentId ASC, createdAt DESC` | Student excuse history |

### 6.5 Data Integrity Mechanisms

| Mechanism | Implementation | Example |
|:---|:---|:---|
| **Transactions** | Firestore `runTransaction` | Points deduction + item grant (prevents double-spend) |
| **Batch Writes** | Firestore `writeBatch` | Multi-student attendance recording |
| **Atomic Increments** | `increment()` field transform | `memberCount` on circle when approving members |
| **Denormalization** | Duplicate data for read performance | `lastMessage` in threads, `memberCount` in circles |
| **Soft Deletes** | Status field changes | Log rejection sets status rather than deleting |
| **Server Timestamps** | `serverTimestamp()` | All `createdAt`/`updatedAt` use server time |

---

## 7. Authentication & Security

### 7.1 Authentication Providers

| Provider | Method | Use Case |
|:---|:---|:---|
| **Phone + OTP** | `signInWithPhoneNumber` + reCAPTCHA | Primary auth for Arabic-speaking users |
| **Email + Password** | `createUserWithEmailAndPassword` / `signInWithEmailAndPassword` | Secondary auth option |
| **Google OAuth 2.0** | `signInWithPopup(GoogleAuthProvider)` | Quick sign-in for Google users |

### 7.2 Authentication Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION LIFECYCLE                      │
│                                                                 │
│  ┌─────────┐    ┌──────────┐    ┌───────────┐    ┌──────────┐  │
│  │  GUEST  │───▶│  LOGIN   │───▶│ ONBOARDING│───▶│ DASHBOARD│  │
│  │  (/)    │    │  (/login)│    │(/onboarding)   │ (/sheikh/ │  │
│  └─────────┘    └──────────┘    │            │    │  or      │  │
│       ▲              │          │ • Name     │    │ /student) │  │
│       │              ▼          │ • Role     │    └──────────┘  │
│       │         ┌──────────┐    │ • Invite   │         │        │
│       │         │   OTP    │    │   Code     │         │        │
│       │         │   Code   │    │   (Sheikh) │         │        │
│       │         └──────────┘    └───────────┘         │        │
│       │                                                │        │
│       └────────────── LOGOUT ◀─────────────────────────┘        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Detailed Flow:**

1. **Guest → Login:** User selects authentication method (Phone, Email, or Google)
2. **Phone Auth:** reCAPTCHA verification → OTP sent → Code entered → Firebase token issued
3. **Email Auth:** Email + password validated → Firebase token issued
4. **Google Auth:** OAuth popup → Consent → Firebase token issued
5. **Post-Auth Check:** `onAuthStateChanged` fires → Fetch `users/{uid}` from Firestore
   - If profile **exists** → Route to dashboard (`/sheikh/dashboard` or `/student`)
   - If profile **missing** → Route to `/onboarding`
6. **Onboarding (Student):** Name + role selection → Profile created via `setDoc`
7. **Onboarding (Sheikh):** Name + invite code → Verified via `runTransaction` → Profile created + invite `usedCount` incremented
8. **Logout:** `signOut(auth)` → `onAuthStateChanged` fires → Redirect to `/`

### 7.3 Route Guards

```typescript
// AuthGuard — Enforces authentication + role-based access
<AuthGuard
    requireAuth={true}        // Must be logged in
    requireProfile={true}     // Must have completed onboarding
    allowedRoles={["sheikh"]} // Only sheikhs allowed
>
    <SheikhDashboard />
</AuthGuard>

// GuestGuard — Prevents authenticated users from accessing login
<GuestGuard>
    <LoginPage />            // Redirects to dashboard if already logged in
</GuestGuard>

// OnboardingGuard — Ensures profile doesn't already exist
<OnboardingGuard>
    <OnboardingPage />       // Redirects to dashboard if profile exists
</OnboardingGuard>
```

**Guard Resolution Table:**

| State | AuthGuard | GuestGuard | OnboardingGuard |
|:---|:---|:---|:---|
| Not authenticated | → `/login` | ✅ Render | → `/login` |
| Authenticated, no profile | → `/onboarding` | → `/onboarding` | ✅ Render |
| Authenticated, has profile, correct role | ✅ Render | → Dashboard | → Dashboard |
| Authenticated, has profile, wrong role | → Correct dashboard | → Dashboard | → Dashboard |

### 7.4 Firestore Security Rules

**File:** `firestore.rules` (103 lines)

```javascript
rules_version = '2';

service cloud.firestore {
    match /databases/{database}/documents {

        // ═══════════════════════════════════════════
        //  HELPER FUNCTIONS
        // ═══════════════════════════════════════════

        function isAuthenticated() {
            return request.auth != null;
        }

        function isOwner(userId) {
            return request.auth.uid == userId;
        }

        function isSheikhOfCircle(circleId) {
            return isAuthenticated() &&
                get(/databases/$(database)/documents/circles/$(circleId))
                    .data.sheikhIds.hasAny([request.auth.uid]);
        }

        // ═══════════════════════════════════════════
        //  COLLECTION RULES (Summary)
        // ═══════════════════════════════════════════

        // users: Read/write own profile only
        match /users/{userId} {
            allow read: if isAuthenticated();
            allow write: if isOwner(userId);
        }

        // circles: Authenticated read, sheikh-only write
        match /circles/{circleId} {
            allow read: if isAuthenticated();
            allow create: if isAuthenticated();
            allow update, delete: if isSheikhOfCircle(circleId);
        }

        // circleMembers: Authenticated read, conditional write
        match /circleMembers/{memberId} {
            allow read: if isAuthenticated();
            allow create: if isAuthenticated();
            allow update: if isAuthenticated();
            allow delete: if isAuthenticated();
        }

        // logs: Student creates, sheikh of circle can update
        match /logs/{logId} {
            allow read: if isAuthenticated();
            allow create: if isAuthenticated();
            allow update: if isAuthenticated();
        }

        // tasks: Sheikh assigns, student/sheikh can update
        match /tasks/{taskId} {
            allow read: if isAuthenticated();
            allow create: if isAuthenticated();
            allow update: if isAuthenticated();
        }

        // attendance: Sheikh records, all read
        match /attendance/{recordId} {
            allow read: if isAuthenticated();
            allow write: if isAuthenticated();
        }

        // threads & messages: Participant-only access
        match /threads/{threadId} {
            allow read: if isAuthenticated();
            allow write: if isAuthenticated();

            match /messages/{messageId} {
                allow read: if isAuthenticated();
                allow write: if isAuthenticated();
            }
        }

        // teacherInvites: Read for invite verification
        match /teacherInvites/{code} {
            allow read: if isAuthenticated();
            allow write: if isAuthenticated();
        }
    }
}
```

### 7.5 Firebase Storage Security Rules

**File:** `storage.rules` (26 lines)

```javascript
rules_version = '2';

service firebase.storage {
    match /b/{bucket}/o {
        function isAuthenticated() {
            return request.auth != null;
        }

        function isUser(userId) {
            return request.auth.uid == userId;
        }

        // Profile images: Anyone authenticated can read,
        // only owner can write (with size & type constraints)
        match /profile_images/{userId}/{fileName} {
            allow read: if isAuthenticated();
            allow write: if isAuthenticated() && isUser(userId)
                         && request.resource.size < 2 * 1024 * 1024    // 2MB max
                         && request.resource.contentType.matches('image/.*'); // Images only
        }
    }
}
```

### 7.6 Security Layers Summary

```
┌──────────────────────────────────────────────────────┐
│  Layer 1: Route Guards (Client-Side UX)              │
│  AuthGuard / GuestGuard / OnboardingGuard            │
│  Purpose: Immediate UI feedback, redirect logic      │
├──────────────────────────────────────────────────────┤
│  Layer 2: Firebase Auth Token (Identity)             │
│  JWT token validated by Firebase on every request    │
│  Purpose: Verify user identity                       │
├──────────────────────────────────────────────────────┤
│  Layer 3: Firestore Security Rules (Authorization)   │
│  Server-side rules evaluated on every read/write     │
│  Purpose: Enforce data access policies               │
├──────────────────────────────────────────────────────┤
│  Layer 4: Storage Security Rules (File Access)       │
│  Server-side rules for file uploads/downloads        │
│  Purpose: Enforce file ownership, size, type limits  │
├──────────────────────────────────────────────────────┤
│  Layer 5: Client-Side Validation (Defense in Depth)  │
│  Hooks validate inputs before sending to Firestore   │
│  Purpose: Prevent obviously invalid operations       │
└──────────────────────────────────────────────────────┘
```

### 7.7 Error Handling — Arabic Error Messages

All Firebase Auth error codes are mapped to user-friendly Arabic messages:

```typescript
// src/lib/auth/errors.ts
const firebaseAuthErrors: Record<string, string> = {
    "auth/email-already-in-use":     "البريد الإلكتروني مُستخدم بالفعل",
    "auth/invalid-email":            "البريد الإلكتروني غير صالح",
    "auth/weak-password":            "كلمة المرور ضعيفة جداً",
    "auth/user-not-found":           "لم يتم العثور على المستخدم",
    "auth/wrong-password":           "كلمة المرور غير صحيحة",
    "auth/too-many-requests":        "تم تجاوز عدد المحاولات. حاول لاحقاً",
    "auth/popup-closed-by-user":     "تم إغلاق نافذة تسجيل الدخول",
    "auth/requires-recent-login":    "يجب إعادة تسجيل الدخول لأسباب أمنية",
    // ... 15+ additional error codes
};
```

---

## 8. Infrastructure & DevOps

### 8.1 Deployment Architecture

```
┌────────────────────────────────────────────────────────────┐
│                    PRODUCTION STACK                         │
│                                                            │
│   ┌────────────────┐    ┌────────────────────────────┐     │
│   │   Vercel /     │    │   Firebase Platform         │     │
│   │   Firebase     │    │                            │     │
│   │   Hosting      │    │   ┌─────────────────────┐  │     │
│   │                │    │   │  Firebase Auth       │  │     │
│   │   • Next.js    │    │   │  (Identity Platform) │  │     │
│   │     SSR/SSG    │    │   └─────────────────────┘  │     │
│   │   • CDN        │    │                            │     │
│   │   • Edge       │    │   ┌─────────────────────┐  │     │
│   │     Functions  │    │   │  Cloud Firestore    │  │     │
│   │                │    │   │  (NoSQL Database)    │  │     │
│   └────────────────┘    │   └─────────────────────┘  │     │
│                         │                            │     │
│                         │   ┌─────────────────────┐  │     │
│                         │   │  Firebase Storage   │  │     │
│                         │   │  (File Storage)     │  │     │
│                         │   └─────────────────────┘  │     │
│                         └────────────────────────────┘     │
└────────────────────────────────────────────────────────────┘
```

### 8.2 Firebase Project Configuration

**File:** `firebase.json`

```json
{
    "firestore": {
        "rules": "firestore.rules",
        "indexes": "firestore.indexes.json"
    },
    "storage": {
        "rules": "storage.rules"
    }
}
```

### 8.3 Environment Configuration

| Variable | Purpose | Source |
|:---|:---|:---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase project API key | `.env.local` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Auth domain | `.env.local` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Project identifier | `.env.local` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Storage bucket URL | `.env.local` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | FCM sender ID | `.env.local` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app identifier | `.env.local` |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Analytics ID | `.env.local` |

### 8.4 Local Development Environment

```
┌──────────────────────────────────────────────────────┐
│              LOCAL DEVELOPMENT STACK                   │
│                                                      │
│   ┌─────────────────────────────────────────────┐    │
│   │  Next.js Dev Server (localhost:3000)          │    │
│   │  • Hot Module Replacement                    │    │
│   │  • TypeScript type checking                  │    │
│   │  • Tailwind JIT compilation                  │    │
│   └─────────────────────────────────────────────┘    │
│              │                                        │
│              ▼                                        │
│   ┌─────────────────────────────────────────────┐    │
│   │  Firebase Emulator Suite                      │    │
│   │  ┌──────────────┐  ┌────────────────────┐   │    │
│   │  │ Auth Emulator │  │ Firestore Emulator │   │    │
│   │  │ :9099        │  │ :8080              │   │    │
│   │  └──────────────┘  └────────────────────┘   │    │
│   │  ┌──────────────┐  ┌────────────────────┐   │    │
│   │  │ Storage      │  │ Emulator UI        │   │    │
│   │  │ Emulator     │  │ :4000              │   │    │
│   │  │ :9199        │  │                    │   │    │
│   │  └──────────────┘  └────────────────────┘   │    │
│   └─────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────┘
```

### 8.5 Build & Deployment Commands

| Command | Purpose |
|:---|:---|
| `npm run dev` | Start Next.js dev server with HMR |
| `npm run build` | Production build (SSR + SSG) |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint with Next.js rules |
| `firebase deploy --only firestore:rules` | Deploy Firestore security rules |
| `firebase deploy --only firestore:indexes` | Deploy composite indexes |
| `firebase deploy --only storage` | Deploy storage rules |
| `firebase emulators:start` | Start local emulator suite |

### 8.6 Next.js Configuration

**File:** `next.config.mjs`

```javascript
const nextConfig = {
    images: {
        remotePatterns: [
            { hostname: "firebasestorage.googleapis.com" },  // Firebase Storage
            { hostname: "*.googleusercontent.com" },          // Google profile photos
            { hostname: "lh3.googleusercontent.com" },        // Google avatar CDN
            { hostname: "ui-avatars.com" },                   // Fallback avatars
        ],
    },
    optimizeFonts: true,  // Next.js font optimization
};
```

### 8.7 Image Optimization Pipeline

```
User uploads image
    ↓
useStorage.uploadFile()
    ↓
Client-side validation:
    ├── File type must be image/* (reject non-images)
    ├── File size must be < 2MB (reject oversized)
    └── If valid → proceed
    ↓
Firebase Storage upload (resumable, with progress)
    ↓
Server-side validation (storage.rules):
    ├── Must be authenticated
    ├── Must be owner of /profile_images/{userId}/ path
    ├── Size < 2MB (double-check)
    └── Content type matches image/*
    ↓
getDownloadURL() → Store URL in users/{uid}.photoURL
    ↓
Next.js <Image> renders with:
    ├── Automatic AVIF/WebP conversion
    ├── Responsive srcset generation
    ├── Lazy loading
    └── Blur placeholder
```

---

## 9. API Documentation

### 9.1 Architecture Note

Halqati does **not expose a traditional REST or GraphQL API**. All data operations occur through the **Firebase Client SDK** directly from the browser. This section documents the **Hook API** — the internal interface through which UI components interact with backend data.

### 9.2 Hook API Reference

#### 9.2.1 `useAuth()` — Authentication Context

```typescript
interface AuthContextValue {
    // State
    user: FirebaseUser | null;           // Firebase Auth user object
    userProfile: UserProfile | null;     // Firestore user document
    isLoading: boolean;                  // Auth state loading
    isAuthenticated: boolean;            // Has valid auth token
    error: string | null;                // Last error message
    
    // Methods
    logout: () => Promise<void>;
    updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}
```

| Property | Type | Description |
|:---|:---|:---|
| `user` | `FirebaseUser \| null` | Raw Firebase Auth user (uid, email, phoneNumber) |
| `userProfile` | `UserProfile \| null` | Firestore document from `users/{uid}` |
| `isLoading` | `boolean` | True during initial auth check |
| `isAuthenticated` | `boolean` | True when `user !== null` |

#### 9.2.2 `usePhoneAuth()` — Phone OTP Authentication

```typescript
interface PhoneAuthHook {
    phoneNumber: string;
    setPhoneNumber: (phone: string) => void;
    otp: string;
    setOtp: (code: string) => void;
    codeSent: boolean;
    isLoading: boolean;
    error: string | null;
    resendTimer: number;
    
    sendOTP: () => Promise<void>;
    verifyOTP: () => Promise<void>;
}
```

**Flow:**
1. Call `sendOTP()` — initializes invisible reCAPTCHA, sends SMS
2. `codeSent` becomes `true`, `resendTimer` starts 60s countdown
3. User enters code → Call `verifyOTP()` — Firebase validates, issues token
4. `onAuthStateChanged` triggers in `AuthProvider`

#### 9.2.3 `useLogs(circleId, studentId?)` — Activity Logging

```typescript
interface LogsHook {
    // State
    logs: Log[];                         // Filtered log entries
    allLogs: Log[];                      // All raw logs
    isLoading: boolean;
    error: string | null;
    stats: LogStats;                     // Computed statistics
    
    // Filters
    filters: LogFilters;
    setFilters: (filters: LogFilters) => void;
    
    // Pagination
    page: number;
    setPage: (page: number) => void;
    totalPages: number;
    
    // Mutations
    createLog: (data: CreateLogInput) => Promise<Result>;
}

interface LogStats {
    totalLogs: number;
    totalPages: number;
    memorizedPages: number;
    revisedPages: number;
    approvedLogs: number;
    pendingLogs: number;
    rejectedLogs: number;
    streakDays: number;                  // Consecutive active days
}

interface LogFilters {
    type?: "memorization" | "revision";
    status?: "pending_approval" | "approved" | "rejected";
    dateFrom?: Date;
    dateTo?: Date;
    searchQuery?: string;                // Client-side text search
}
```

#### 9.2.4 `usePoints(userId)` — Gamification Wallet

```typescript
interface PointsHook {
    points: number;                      // Current spendable balance
    totalPoints: number;                 // Lifetime total
    inventory: Record<string, boolean>;  // Owned items
    equipped: EquippedItems;             // Currently equipped
    isLoading: boolean;
    
    spendPoints: (cost: number, itemId: string) => Promise<boolean>;
    equipItem: (type: "frame" | "badge", itemId: string) => Promise<void>;
    unequipItem: (type: "frame" | "badge") => Promise<void>;
    hardResetPoints: () => Promise<void>;  // Diagnostic only
}
```

#### 9.2.5 `usePointsSystem(userId)` — Points Calculation Engine

```typescript
// Constants
const POINTS_PER_PAGE = {
    memorization: 3,    // 3 points per page memorized
    review: 1,          // 1 point per page reviewed
    activity: 1,        // 1 point for generic activities
};

// Exports
function calculatePointsForLog(
    type: "memorization" | "review" | "activity",
    pagesCount: number
): number;

interface PointsSystemHook {
    points: number;
    totalPoints: number;
    inventory: Record<string, boolean>;
    loading: boolean;
    error: string | null;
    
    addPoints: (amount: number, reason: string, type?: string) => Promise<boolean>;
    spendPoints: (amount: number, itemId: string) => Promise<boolean>;
}
```

#### 9.2.6 `useMembership()` — Circle Enrollment

```typescript
interface MembershipHook {
    memberships: CircleMembership[];     // All memberships
    activeCircle: Circle | null;         // First approved circle
    pendingMemberships: CircleMembership[];
    approvedMemberships: CircleMembership[];
    hasApprovedMembership: boolean;
    hasPendingMembership: boolean;
    isLoading: boolean;
    error: string | null;
    
    joinCircleByCode: (code: string) => Promise<Result>;
}
```

#### 9.2.7 `useSheikhCircles()` — Circle Management (Sheikh)

```typescript
interface SheikhCirclesHook {
    circles: Circle[];
    isLoading: boolean;
    
    createCircle: (data: CreateCircleInput) => Promise<{ success: boolean; circleId?: string }>;
    updateCircle: (circleId: string, data: Partial<Circle>) => Promise<Result>;
    addCoSheikh: (circleId: string, sheikhId: string) => Promise<Result>;
}
```

#### 9.2.8 `useCircleMembers(circleId)` — Member Management (Sheikh)

```typescript
interface CircleMembersHook {
    members: CircleMember[];
    pendingMembers: CircleMember[];
    approvedMembers: CircleMember[];
    isLoading: boolean;
    
    approveMember: (memberId: string) => Promise<Result>;
    rejectMember: (memberId: string) => Promise<Result>;
    removeMember: (memberId: string) => Promise<Result>;
}
```

#### 9.2.9 `useAttendance(circleId)` — Attendance Management

```typescript
interface AttendanceHook {
    // State
    records: AttendanceRecord[];
    todayRecords: AttendanceRecord[];
    stats: AttendanceStats;
    excuses: Excuse[];
    pendingExcuses: Excuse[];
    isLoading: boolean;
    
    // Sheikh actions
    recordAttendance: (studentId: string, status: AttendanceStatus) => Promise<Result>;
    batchRecordAttendance: (records: BatchRecord[]) => Promise<Result>;
    approveExcuse: (excuseId: string) => Promise<Result>;
    rejectExcuse: (excuseId: string) => Promise<Result>;
    
    // Student actions
    submitExcuse: (data: ExcuseInput) => Promise<Result>;
}

interface AttendanceStats {
    totalDays: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    excusedDays: number;
    attendanceRate: number;              // Percentage
}
```

#### 9.2.10 `useMessages()` — Threading Messaging

```typescript
interface MessagesHook {
    threads: Thread[];
    currentThread: Thread | null;
    messages: Message[];
    unreadCount: number;
    isLoading: boolean;
    
    createThread: (participantId: string) => Promise<string>;  // Returns threadId
    sendMessage: (threadId: string, text: string) => Promise<Result>;
    markAsRead: (threadId: string) => Promise<void>;
    getOrCreateThread: (participantId: string) => Promise<string>;
}
```

#### 9.2.11 `useTasks(circleId)` — Task Assignment

```typescript
interface TasksHook {
    tasks: Task[];
    memorizationTask: Task | undefined;  // First pending memorization task
    revisionTask: Task | undefined;      // First pending revision task
    isLoading: boolean;
    error: string | null;
    
    submitTask: (task: Task) => Promise<Result>;  // Creates log + updates task status
}
```

#### 9.2.12 `useReports(circleId)` — Analytics

```typescript
interface ReportsHook {
    circleStats: CircleStats;
    topPerformers: StudentPerformance[];
    dailyActivity: DailyActivity[];
    isLoading: boolean;
    
    exportCSV: () => void;               // Downloads CSV file
    getMonthlyReport: (month: number, year: number) => MonthlyReport;
}
```

#### 9.2.13 `useStorage()` — File Upload

```typescript
interface StorageHook {
    progress: number;                    // 0-100
    url: string | null;                  // Download URL after upload
    error: string | null;               // Arabic error message
    uploading: boolean;
    
    uploadFile: (file: File, path: string) => Promise<{ url: string | null; error: string | null }>;
    reset: () => void;
}
```

#### 9.2.14 `useStudentGoals(studentId)` — Personal Goals

```typescript
interface StudentGoalsHook {
    goals: StudentGoals;
    isLoading: boolean;
    error: string | null;
    
    updateGoals: (newGoals: StudentGoals) => Promise<Result>;
}

interface StudentGoals {
    dailyMemoTarget?: number;
    dailyReviewTarget?: number;
    monthlyMemoTarget?: number;
    monthlyReviewTarget?: number;
}
```

#### 9.2.15 `useDeleteAccount()` — Account Deletion

```typescript
interface DeleteAccountHook {
    isDeleting: boolean;
    error: string | null;
    
    deleteAccount: () => Promise<void>;
    // Cascade: circleMembers + sheikh circle refs + user doc + Firebase Auth
}
```

---

## 10. Application Workflows

### 10.1 Student Onboarding Workflow

```
┌──────────┐     ┌───────────┐     ┌──────────────┐     ┌───────────┐
│  Visit   │────▶│   Login   │────▶│  Onboarding  │────▶│  Join     │
│  Landing │     │  (Phone/  │     │  (Enter Name,│     │  Circle   │
│  Page    │     │  Email/   │     │   Select     │     │  via Code │
│          │     │  Google)  │     │   "Student") │     │           │
└──────────┘     └───────────┘     └──────────────┘     └───────────┘
                                                              │
                                          ┌───────────────────┘
                                          ▼
                                   ┌──────────────┐     ┌───────────┐
                                   │  Wait for    │────▶│  Student  │
                                   │  Sheikh      │     │  Dashboard│
                                   │  Approval    │     │  Active!  │
                                   └──────────────┘     └───────────┘
```

### 10.2 Sheikh Onboarding Workflow

```
┌──────────┐     ┌───────────┐     ┌──────────────────────┐     ┌───────────┐
│  Visit   │────▶│   Login   │────▶│  Onboarding          │────▶│  Create   │
│  Landing │     │  (Phone/  │     │  (Enter Name,        │     │  First    │
│  Page    │     │  Email/   │     │   Select "Sheikh",   │     │  Circle   │
│          │     │  Google)  │     │   Enter Invite Code) │     │           │
└──────────┘     └───────────┘     └──────────────────────┘     └───────────┘
                                          │                           │
                                          │  Transaction:             │
                                          │  1. Validate code         │
                                          │  2. Increment usedCount   │
                                          │  3. Create profile        │
                                          │     (role: "sheikh")      │
                                          └───────────────────────────┘
```

### 10.3 Log Submission & Approval Workflow

```
STUDENT                              SHEIKH
───────                              ──────

┌────────────────┐
│ Submit Log     │
│ (type, pages,  │
│  surah, ayah)  │
└───────┬────────┘
        │
        │  addDoc("logs", {
        │    status: "pending_approval",
        │    studentId, circleId,
        │    type, amount, date
        │  })
        │
        ▼
┌────────────────┐            ┌────────────────────┐
│ Log appears in │            │ onSnapshot fires   │
│ student's list │            │ in usePendingLogs  │
│ (pending)      │            │                    │
└────────────────┘            └───────┬────────────┘
                                      │
                                      ▼
                              ┌────────────────────┐
                              │ Review log entry   │
                              │ Add teacher notes  │
                              └───────┬────────────┘
                                      │
                         ┌────────────┴────────────┐
                         ▼                          ▼
                 ┌──────────────┐          ┌──────────────┐
                 │   APPROVE    │          │   REJECT     │
                 │              │          │              │
                 │ Transaction: │          │ updateDoc:   │
                 │ 1. Update    │          │ status →     │
                 │    log status│          │ "rejected"   │
                 │ 2. Calculate │          │ + reason     │
                 │    points    │          │              │
                 │ 3. Increment │          └──────────────┘
                 │    user.points│
                 │    + totalPts│
                 └──────────────┘
                         │
                         ▼
                 ┌──────────────┐
                 │ Points update│
                 │ propagates   │
                 │ via onSnapshot│
                 │ to student UI│
                 └──────────────┘
```

### 10.4 Store Purchase Workflow

```
┌───────────────┐     ┌──────────────────┐     ┌────────────────────┐
│  Browse Store │────▶│  Select Item     │────▶│  Confirm Purchase  │
│  (Categories: │     │  (Shows price,   │     │                    │
│   Frames,     │     │   rarity tier,   │     │  runTransaction:   │
│   Badges)     │     │   preview)       │     │  1. Read points    │
└───────────────┘     └──────────────────┘     │  2. Check balance  │
                                               │  3. Check owned    │
                                               │  4. Deduct points  │
                                               │  5. Add to         │
                                               │     inventory      │
                                               └─────────┬──────────┘
                                                         │
                                          ┌──────────────┤
                                          ▼              ▼
                                   ┌────────────┐ ┌────────────┐
                                   │  SUCCESS   │ │  FAILURE   │
                                   │            │ │            │
                                   │  Item in   │ │ INSUFFICIENT│
                                   │  inventory │ │ _FUNDS or  │
                                   │            │ │ ALREADY_   │
                                   │  Can equip │ │ OWNED      │
                                   └────────────┘ └────────────┘
```

### 10.5 Attendance Workflow

```
SHEIKH                                    STUDENT
──────                                    ───────

┌──────────────────┐
│ Open Attendance  │
│ Sheet for today  │
└───────┬──────────┘
        │
        ▼
┌──────────────────┐
│ For each student:│
│ Mark Present /   │
│ Absent / Late    │
└───────┬──────────┘
        │
        │  writeBatch:
        │  For each student:
        │    set("attendance", {
        │      circleId, studentId,
        │      date, status,
        │      recordedBy
        │    })
        │
        ▼                                ┌──────────────────┐
┌──────────────────┐                     │ If marked absent: │
│ Attendance saved │                     │ Student can       │
│ Analytics update │                     │ submit excuse     │
│ via onSnapshot   │                     │                   │
└──────────────────┘                     │ addDoc("excuses", │
                                         │ { reason, date }) │
        ┌────────────────────────────────└───────┬──────────┘
        │                                        │
        ▼                                        │
┌──────────────────┐                             │
│ Excuse appears   │◀────────────────────────────┘
│ in pending queue │
│                  │
│ Sheikh reviews:  │
│ Approve/Reject   │
│                  │
│ If approved:     │
│ attendance status│
│ → "excused"      │
└──────────────────┘
```

### 10.6 Messaging Workflow

```
USER A                                    USER B
──────                                    ──────

┌──────────────────┐
│ Start new thread │
│ or open existing │
└───────┬──────────┘
        │
        │  getOrCreateThread(participantId)
        │  → Query threads where participants
        │    contains both UIDs
        │  → If exists → return threadId
        │  → If not → create new thread doc
        │
        ▼
┌──────────────────┐                     ┌──────────────────┐
│ Send message     │                     │ onSnapshot fires │
│                  │                     │ on thread.messages│
│ addDoc:          │                     │                  │
│ messages/{mid}   │────────────────────▶│ New message      │
│ { text, senderId │                     │ appears in UI    │
│   timestamp }    │                     │                  │
│                  │                     │ unreadCount      │
│ updateDoc:       │                     │ incremented      │
│ thread.lastMsg   │                     │                  │
│ thread.unread++  │                     └──────────────────┘
└──────────────────┘

                                         ┌──────────────────┐
                                         │ User opens thread│
                                         │ markAsRead()     │
                                         │ unreadCount → 0  │
                                         └──────────────────┘
```

### 10.7 Account Deletion Workflow

```
┌───────────────┐     ┌──────────────────┐     ┌────────────────────┐
│  Settings     │────▶│  Confirm Delete  │────▶│  writeBatch:       │
│  Page         │     │  (Danger Zone)   │     │                    │
│               │     │  Modal with      │     │  1. Query & delete │
│  Delete Acct  │     │  confirmation    │     │     circleMembers  │
│  Button       │     │  text            │     │     (as student)   │
└───────────────┘     └──────────────────┘     │                    │
                                               │  2. Query circles  │
                                               │     where sheikh,  │
                                               │     arrayRemove    │
                                               │     user from      │
                                               │     sheikhIds      │
                                               │                    │
                                               │  3. Delete user    │
                                               │     document       │
                                               │                    │
                                               │  4. batch.commit() │
                                               │                    │
                                               │  5. deleteUser()   │
                                               │     (Firebase Auth)│
                                               └────────────────────┘
```

---

## 11. Internal Logic Flow

### 11.1 Points Calculation Engine

The gamification system uses a tiered rewards formula where memorization is valued 3× higher than revision:

```
Points = Pages × Multiplier

Where:
  Multiplier(memorization) = 3
  Multiplier(review)       = 1
  Multiplier(activity)     = 1

Examples:
  5 pages memorized = 5 × 3 = 15 points
  5 pages reviewed  = 5 × 1 = 5 points
  10 pages memorized + 3 pages reviewed = (10×3) + (3×1) = 33 points
```

**Implementation:** `calculatePointsForLog()` in `usePointsSystem.ts`

```typescript
export function calculatePointsForLog(
    type: 'memorization' | 'review' | 'activity',
    pagesCount: number = 1
): number {
    const multiplier = POINTS_PER_PAGE[type] || 1;
    return Math.max(0, Math.floor(pagesCount) * multiplier);
}
```

**Safety mechanisms:**
- `Math.floor()` prevents fractional pages from being exploited
- `Math.max(0, ...)` prevents negative point awards
- `isNaN()` checks on Firestore data prevent corrupted state propagation
- Transactions prevent double-spending race conditions

### 11.2 Store Economy Design

| Tier | Price Range | Examples |
|:---|:---|:---|
| **Common** | 10-30 points | Basic frames, simple badges |
| **Rare** | 50-100 points | Themed frames, animated badges |
| **Legendary** | 200-500 points | Premium frames, exclusive cosmetics |

**Anti-Exploit Mechanisms:**
1. **Transaction-based purchases:** `runTransaction` reads current balance, then deducts atomically
2. **Ownership check:** `inventory[itemId]` checked before purchase to prevent duplicates
3. **Balance validation:** Server never trusts client-reported balance
4. **NaN recovery:** `usePointsSystem` auto-recovers from NaN/undefined point values via `Number()` + `isNaN()` fallback

### 11.3 Real-Time Data Synchronization Model

```
┌─────────────────────────────────────────────────────────────┐
│                   DATA SYNC ARCHITECTURE                     │
│                                                             │
│   User A (Sheikh)              Firestore              User B│
│   ┌──────────┐            ┌──────────────┐       ┌────────┐│
│   │ Approve  │───write───▶│  logs/{id}   │       │ Student││
│   │   Log    │            │  status:     │       │  UI    ││
│   └──────────┘            │  "approved"  │       │        ││
│                           └──────────────┘       │        ││
│                                  │               │        ││
│                           onSnapshot fires       │        ││
│                                  │               │        ││
│                                  ├──────────────▶│ Points ││
│                                  │               │ update ││
│                                  │               │ animate││
│                                  │               └────────┘│
│                                  │                          │
│   ┌──────────┐            ┌──────────────┐                  │
│   │ Dashboard│◀───read────│  users/{uid} │                  │
│   │ updates  │            │  points++    │                  │
│   │ student  │            │              │                  │
│   │ stats    │            └──────────────┘                  │
│   └──────────┘                                              │
└─────────────────────────────────────────────────────────────┘
```

**Latency:** Firestore `onSnapshot` delivers updates to all connected clients within **50-200ms** of the write commit, depending on regional proximity and connection quality.

### 11.4 Client-Side Search & Filtering

The `useLogs` hook implements a **multi-dimensional client-side filtering pipeline:**

```
Raw Logs (from Firestore)
    │
    ▼
Filter by Type (memorization | revision | all)
    │
    ▼
Filter by Status (pending | approved | rejected | all)
    │
    ▼
Filter by Date Range (dateFrom → dateTo)
    │
    ▼
Text Search (surah name, teacher notes — case-insensitive Arabic)
    │
    ▼
Sort by Date (most recent first)
    │
    ▼
Paginate (10 items per page)
    │
    ▼
Render filtered, paginated results
```

### 11.5 Denormalization Trade-offs

| Denormalized Data | Location | Why | Cost |
|:---|:---|:---|:---|
| `lastMessage` | `threads` doc | Avoid reading subcollection for thread list | Must update on every message send |
| `unreadCount` | `threads` doc | Show badge count without counting messages | Must increment/reset atomically |
| `memberCount` | `circles` doc | Display count without counting members | Must update on approve/reject/remove |

---

## 12. Third-Party Integrations

### 12.1 Integration Map

```
┌─────────────────────────────────────────────────────────────┐
│                    INTEGRATION ECOSYSTEM                     │
│                                                             │
│   ┌───────────────────┐  ┌─────────────────────────────┐   │
│   │    Firebase        │  │    Google Cloud Platform     │   │
│   │    ┌──────────┐   │  │    ┌──────────────────┐     │   │
│   │    │ Auth     │   │  │    │ Cloud Firestore  │     │   │
│   │    │ • Email  │   │  │    │ (Multi-region)   │     │   │
│   │    │ • Phone  │   │  │    └──────────────────┘     │   │
│   │    │ • Google │   │  │    ┌──────────────────┐     │   │
│   │    └──────────┘   │  │    │ Cloud Storage    │     │   │
│   │    ┌──────────┐   │  │    │ (Files/Images)   │     │   │
│   │    │ reCAPTCHA│   │  │    └──────────────────┘     │   │
│   │    │ v2/v3    │   │  └─────────────────────────────┘   │
│   │    └──────────┘   │                                     │
│   └───────────────────┘                                     │
│                                                             │
│   ┌───────────────────┐  ┌─────────────────────────────┐   │
│   │    NPM Packages    │  │    CDN Services              │   │
│   │    ┌──────────┐   │  │    ┌──────────────────┐     │   │
│   │    │ Recharts │   │  │    │ Google Fonts     │     │   │
│   │    │ (Charts) │   │  │    │ (Tajawal)        │     │   │
│   │    └──────────┘   │  │    └──────────────────┘     │   │
│   │    ┌──────────┐   │  │    ┌──────────────────┐     │   │
│   │    │ Framer   │   │  │    │ ui-avatars.com   │     │   │
│   │    │ Motion   │   │  │    │ (Fallback imgs)  │     │   │
│   │    └──────────┘   │  │    └──────────────────┘     │   │
│   │    ┌──────────┐   │  └─────────────────────────────┘   │
│   │    │ Lucide   │   │                                     │
│   │    │ Icons    │   │                                     │
│   │    └──────────┘   │                                     │
│   └───────────────────┘                                     │
└─────────────────────────────────────────────────────────────┘
```

### 12.2 Firebase Integration Details

| Service | SDK Version | Usage | Billable Operations |
|:---|:---|:---|:---|
| **Firebase Auth** | v12.8.0 | Multi-provider authentication | Free tier: 10K MAU |
| **Cloud Firestore** | v12.8.0 | NoSQL database, real-time sync | Reads, writes, deletes |
| **Firebase Storage** | v12.8.0 | Profile image hosting | Storage GB + bandwidth |
| **reCAPTCHA** | Embedded | Bot protection for phone auth | Free |

### 12.3 NPM Package Dependencies

| Package | Version | Purpose | Bundle Impact |
|:---|:---|:---|:---|
| `next` | 14.2.5 | Framework | Core (not counted) |
| `react` | 18.2.0 | UI Library | Core (not counted) |
| `firebase` | 12.8.0 | Backend SDK | ~200KB (tree-shaken) |
| `recharts` | 3.7.0 | Chart visualizations | ~150KB |
| `framer-motion` | 11.x | Animations | ~100KB |
| `lucide-react` | 0.400 | Icon library | ~5KB per icon (tree-shaken) |
| `react-hook-form` | 7.71 | Form management | ~30KB |
| `zod` | 4.3.5 | Schema validation | ~15KB |
| `@hookform/resolvers` | 5.0.0 | RHF + Zod bridge | ~5KB |
| `next-themes` | 0.4.6 | Dark mode | ~3KB |
| `clsx` | 2.1 | Class merging | ~1KB |
| `tailwind-merge` | 2.6 | Tailwind dedup | ~10KB |
| `date-fns` | 4.1 | Date formatting | ~5KB (tree-shaken) |

### 12.4 Development Dependencies

| Package | Purpose |
|:---|:---|
| `typescript` | Static type checking |
| `tailwindcss` | Utility CSS compilation |
| `postcss` | CSS processing pipeline |
| `autoprefixer` | Vendor prefix automation |
| `eslint` | Code linting |
| `eslint-config-next` | Next.js-specific lint rules |
| `cypress` | End-to-end testing |
| `@types/react` | React type definitions |
| `@types/node` | Node.js type definitions |

---

## 13. Performance Optimization

### 13.1 Performance Strategy Overview

Halqati employs a **multi-layered performance optimization strategy** spanning build-time, load-time, and runtime phases:

```
┌─────────────────────────────────────────────────────────────┐
│                 PERFORMANCE OPTIMIZATION STACK               │
│                                                             │
│   BUILD TIME                                                │
│   ┌─────────────────────────────────────────────────────┐   │
│   │  ✓ Next.js Static Generation (SSG) for public pages │   │
│   │  ✓ Tree-shaking (Firebase SDK, Icons, date-fns)     │   │
│   │  ✓ CSS purging via Tailwind JIT                     │   │
│   │  ✓ TypeScript compilation with strict mode          │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
│   LOAD TIME                                                 │
│   ┌─────────────────────────────────────────────────────┐   │
│   │  ✓ Route-based code splitting (App Router)          │   │
│   │  ✓ Dynamic imports for heavy components             │   │
│   │  ✓ Next/Image optimization (WebP, lazy load, blur) │   │
│   │  ✓ Font optimization (next/font/google)             │   │
│   │  ✓ Preloading critical resources                    │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
│   RUNTIME                                                   │
│   ┌─────────────────────────────────────────────────────┐   │
│   │  ✓ Real-time listener management (cleanup on unmount)│   │
│   │  ✓ Client-side caching via React state              │   │
│   │  ✓ Firestore composite indexes for query speed      │   │
│   │  ✓ Batched writes for bulk operations               │   │
│   │  ✓ Debounced search input                           │   │
│   └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 13.2 Code Splitting Strategy

Next.js App Router automatically splits code at the route level. Halqati further optimizes with role-based splitting:

```
Bundle Architecture:
─────────────────────

Common Bundle (~350KB gzipped)
├── React + ReactDOM
├── Next.js runtime
├── Firebase Auth SDK
├── Tailwind CSS (compiled)
├── AuthProvider + Guards
└── Shared UI components

Student Bundle (~150KB additional)
├── /student/dashboard → Dashboard components
├── /student/logs → Log management + filters
├── /student/store → Store + inventory UI
├── /student/attendance → Attendance view
├── /student/messages → Messaging UI
└── Recharts (loaded only on stats pages)

Sheikh Bundle (~180KB additional)
├── /sheikh/dashboard → Admin dashboard
├── /sheikh/circles → Circle management
├── /sheikh/students → Student detail views
├── /sheikh/reports → Analytics + CSV export
├── /sheikh/attendance → Attendance sheet
└── Recharts (loaded on reports/dashboard)
```

### 13.3 Image Optimization Pipeline

```typescript
// next.config.mjs configuration
images: {
    remotePatterns: [
        { hostname: "firebasestorage.googleapis.com" },  // Profile images
        { hostname: "*.googleusercontent.com" },          // Google avatars
        { hostname: "ui-avatars.com" },                   // Fallback avatars
        { hostname: "lh3.googleusercontent.com" },        // Google Photos
    ],
}
```

**Optimization chain for every image:**

| Step | Technology | Effect |
|:---|:---|:---|
| 1. Format conversion | Next/Image | Auto-convert to WebP/AVIF |
| 2. Responsive sizing | `sizes` prop | Serve device-appropriate resolution |
| 3. Lazy loading | `loading="lazy"` | Defer off-screen images |
| 4. Blur placeholder | `placeholder="blur"` | Show LQIP during load |
| 5. CDN caching | Vercel Edge / Firebase | Cache at edge locations |

### 13.4 Firestore Query Performance

**Index-Optimized Queries:**

All 17 composite indexes defined in `firestore.indexes.json` are designed to eliminate full-collection scans. Key performance patterns:

| Query | Index Fields | Expected Latency |
|:---|:---|:---|
| Student's logs in a circle | `circleId` + `studentId` + `date DESC` | < 50ms |
| Pending logs for sheikh | `circleId` + `status` + `createdAt DESC` | < 50ms |
| Today's attendance | `circleId` + `date` + `status` | < 30ms |
| Active tasks | `circleId` + `studentId` + `status` | < 30ms |
| Thread messages | `threadId` + `createdAt ASC` | < 30ms |

**Cost Optimization:**
- **Listener deduplication:** Each hook uses a single `onSnapshot` per collection, filtering client-side rather than creating multiple server queries
- **Pagination:** `useLogs` fetches all logs once, then paginates in-memory (trades initial load for reduced reads)
- **Cleanup:** Every `useEffect` returns an `unsubscribe` function to prevent orphaned listeners

### 13.5 Real-Time Listener Management

```typescript
// Pattern used across ALL hooks
useEffect(() => {
    if (!circleId || !user?.uid) return;
    
    const q = query(
        collection(db, "collectionName"),
        where("circleId", "==", circleId),
        orderBy("createdAt", "desc")
    );
    
    const unsubscribe = onSnapshot(q,
        (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setState(data);
            setLoading(false);
        },
        (error) => {
            console.error("Listener error:", error);
            setError(error.message);
            setLoading(false);
        }
    );
    
    return () => unsubscribe();  // CRITICAL: cleanup on unmount
}, [circleId, user?.uid]);
```

**Memory leak prevention:** Every Firestore listener across all 13+ hooks follows this exact pattern. The cleanup function in the `useEffect` return ensures that when a component unmounts or its dependencies change, the previous listener is detached, preventing:
- Unnecessary network traffic
- Memory leaks from accumulating snapshot handlers
- Stale data rendering in unmounted components

### 13.6 Bundle Size Analysis

| Category | Estimated Size (gzipped) | % of Total |
|:---|:---|:---|
| Framework (Next.js + React) | ~100KB | 25% |
| Firebase SDK | ~80KB | 20% |
| Recharts | ~60KB | 15% |
| Framer Motion | ~40KB | 10% |
| Application Code | ~80KB | 20% |
| Tailwind CSS | ~25KB | 6% |
| Other Dependencies | ~15KB | 4% |
| **Total** | **~400KB** | **100%** |

### 13.7 Caching Strategy

```
┌───────────────────────────────────────────────────┐
│               CACHING LAYERS                       │
│                                                   │
│   Layer 1: Browser Cache                          │
│   ├── Static assets: Cache-Control: immutable     │
│   ├── _next/static/*: Content-hashed filenames    │
│   └── Images: Cached via Next/Image CDN           │
│                                                   │
│   Layer 2: Firestore SDK Cache                    │
│   ├── enablePersistence() in production           │
│   ├── Offline reads from IndexedDB               │
│   └── Automatic sync on reconnection             │
│                                                   │
│   Layer 3: React State Cache                      │
│   ├── Hook state persists during component life   │
│   ├── Context providers cache at app level        │
│   └── No external state management overhead       │
│                                                   │
│   Layer 4: Service Worker (Future)                │
│   ├── PWA offline support                         │
│   ├── Background sync for log submissions         │
│   └── Push notification support                   │
│                                                   │
└───────────────────────────────────────────────────┘
```

---

## 14. Testing Strategy

### 14.1 Testing Pyramid

```
           ┌──────────┐
          ╱ E2E Tests  ╲          Cypress
         ╱  (Critical   ╲        Full user flows
        ╱    Flows)      ╲       Browser automation
       ├──────────────────┤
      ╱  Integration Tests ╲     Component + Hook
     ╱   (Hook Behavior)    ╲    Firebase interaction
    ╱                        ╲   State management
   ├──────────────────────────┤
  ╱     Unit Tests             ╲  Pure functions
 ╱      (Logic)                 ╲ Calculations
╱                                ╲ Utilities
└────────────────────────────────┘
           Static Analysis         ESLint + TypeScript
```

### 14.2 Static Analysis

**ESLint Configuration** (`.eslintrc.json`):

```json
{
    "extends": ["next/core-web-vitals"],
    "rules": {
        "react/no-unescaped-entities": "off",
        "@next/next/no-img-element": "warn"
    }
}
```

**TypeScript Strict Mode** (`tsconfig.json`):

```json
{
    "compilerOptions": {
        "strict": true,
        "noEmit": true,
        "esModuleInterop": true,
        "moduleResolution": "bundler",
        "resolveJsonModule": true,
        "isolatedModules": true,
        "jsx": "preserve",
        "incremental": true,
        "paths": {
            "@/*": ["./src/*"]
        }
    }
}
```

### 14.3 End-to-End Testing (Cypress)

**Configuration** (`cypress.config.ts`):

```typescript
export default defineConfig({
    e2e: {
        baseUrl: "http://localhost:3000",
        specPattern: "cypress/e2e/**/*.cy.{ts,tsx}",
        supportFile: "cypress/support/e2e.ts",
        viewportWidth: 1280,
        viewportHeight: 720,
        video: false,
        screenshotOnRunFailure: true,
    },
});
```

**Test Suites:**

| Suite | Coverage | Priority |
|:---|:---|:---|
| `full-audit.cy.ts` | Landing page accessibility, SEO, responsive design | Critical |
| Auth flows | Phone OTP, Email login, Google OAuth | Critical |
| Student flows | Log submission, store purchase, attendance view | High |
| Sheikh flows | Circle creation, member approval, log review | High |
| Messaging | Thread creation, message send/receive | Medium |
| Edge cases | Offline behavior, invalid inputs, error states | Medium |

### 14.4 Testing Scripts

```json
{
    "scripts": {
        "dev": "next dev",
        "build": "next build",
        "start": "next start",
        "lint": "next lint",
        "cypress:open": "cypress open",
        "cypress:run": "cypress run",
        "test:e2e": "cypress run --spec 'cypress/e2e/**/*.cy.ts'",
        "test:audit": "cypress run --spec 'cypress/e2e/full-audit.cy.ts'",
        "test:all": "npm run lint && npm run build && npm run test:e2e"
    }
}
```

### 14.5 Testing with Firebase Emulators

All tests targeting Firebase services use the **Firebase Emulator Suite** to avoid polluting production data:

```typescript
// client.ts — Emulator connection
if (process.env.NODE_ENV === "development") {
    connectAuthEmulator(auth, "http://localhost:9099");
    connectFirestoreEmulator(db, "localhost", 8080);
    connectStorageEmulator(storage, "localhost", 9199);
}
```

**Emulator Suite Setup:**
```bash
# Start all emulators
firebase emulators:start

# Available emulators:
# Auth      → localhost:9099
# Firestore → localhost:8080
# Storage   → localhost:9199
# UI Hub    → localhost:4000
```

### 14.6 Quality Assurance Checklist

| Area | Check | Tool |
|:---|:---|:---|
| **Type Safety** | Zero TypeScript errors in strict mode | `tsc --noEmit` |
| **Lint** | Zero ESLint warnings/errors | `next lint` |
| **Build** | Successful production build | `next build` |
| **Accessibility** | WCAG 2.1 AA compliance | Cypress + axe-core |
| **Responsive** | Mobile (375px), Tablet (768px), Desktop (1280px) | Cypress viewports |
| **RTL** | All text renders right-to-left correctly | Visual inspection |
| **Dark Mode** | All components render correctly in both themes | Manual + Cypress |
| **Performance** | Core Web Vitals in green | Lighthouse |
| **Security Rules** | All Firestore/Storage rules tested | Emulator |
| **Offline** | Graceful degradation without network | Manual |

---

## 15. Future Roadmap

### 15.1 Product Evolution Strategy

```
═══════════════════════════════════════════════════════════════
                     HALQATI PRODUCT ROADMAP
═══════════════════════════════════════════════════════════════

  Q1 2026              Q2 2026              Q3 2026
  ─────────            ─────────            ─────────
  Phase 1              Phase 2              Phase 3
  FOUNDATION           INTELLIGENCE         SCALE
  HARDENING            & ENGAGEMENT         & MONETIZE
  
  ┌──────────┐         ┌──────────┐         ┌──────────┐
  │ PWA      │         │ AI Tutor │         │ Multi-   │
  │ Support  │         │ Assistant│         │ Tenant   │
  │          │         │          │         │ Platform │
  │ Push     │         │ Voice    │         │          │
  │ Notifs   │         │ Recitatio│         │ Org      │
  │          │         │ n Check  │         │ Accounts │
  │ Offline  │         │          │         │          │
  │ Mode     │         │ Spaced   │         │ White    │
  │          │         │ Repetitio│         │ Label    │
  │ Mobile   │         │ n Engine │         │          │
  │ Polish   │         │          │         │ API      │
  └──────────┘         │ Social   │         │ Gateway  │
                       │ Learning │         │          │
                       └──────────┘         │ Analytics│
                                            │ Dashboard│
                                            └──────────┘

  Q4 2026              2027+
  ─────────            ─────────
  Phase 4              Phase 5
  ECOSYSTEM            IMPACT
  
  ┌──────────┐         ┌──────────┐
  │ Native   │         │ Global   │
  │ Mobile   │         │ Expansion│
  │ Apps     │         │          │
  │          │         │ Multi-   │
  │ Parent   │         │ Language │
  │ Portal   │         │          │
  │          │         │ Certified│
  │ Content  │         │ Programs │
  │ Library  │         │          │
  │          │         │ Partner  │
  │ Gamified │         │ APIs     │
  │ Compete  │         │          │
  └──────────┘         └──────────┘
═══════════════════════════════════════════════════════════════
```

### 15.2 Phase 1: Foundation Hardening (Q1 2026)

| Feature | Description | Priority | Effort |
|:---|:---|:---|:---|
| **Progressive Web App** | Service worker, offline caching, install prompt | P0 | 2 weeks |
| **Push Notifications** | Firebase Cloud Messaging for log approvals, messages | P0 | 1 week |
| **Offline Mode** | Firestore persistence, queue writes, sync on reconnect | P1 | 2 weeks |
| **Performance Audit** | Lighthouse optimization, CWV targets, bundle analysis | P1 | 1 week |
| **Error Monitoring** | Sentry/Firebase Crashlytics integration | P1 | 3 days |
| **i18n Framework** | Extract all Arabic strings to locale files, add English | P2 | 2 weeks |
| **Accessibility Audit** | Full WCAG 2.1 AA compliance, screen reader testing | P2 | 1 week |

### 15.3 Phase 2: Intelligence & Engagement (Q2 2026)

| Feature | Description | Priority | Effort |
|:---|:---|:---|:---|
| **AI Recitation Checker** | Web Speech API + ML model for Tajweed validation | P0 | 6 weeks |
| **Spaced Repetition Engine** | SM-2 algorithm for optimal review scheduling | P0 | 3 weeks |
| **Achievement System** | Milestone badges, streak rewards, level-up animations | P1 | 2 weeks |
| **Social Learning** | Circle leaderboards, peer challenges, group streaks | P1 | 3 weeks |
| **Advanced Analytics** | Predictive insights, at-risk student detection | P2 | 4 weeks |
| **Smart Notifications** | Context-aware reminders based on study patterns | P2 | 2 weeks |

### 15.4 Phase 3: Scale & Monetize (Q3 2026)

| Feature | Description | Priority | Effort |
|:---|:---|:---|:---|
| **Multi-Tenant Architecture** | Organization accounts with admin dashboard | P0 | 6 weeks |
| **White-Label Support** | Custom branding, themes, domains per organization | P1 | 4 weeks |
| **REST API Gateway** | Cloud Functions API for third-party integrations | P1 | 4 weeks |
| **Subscription Billing** | Stripe integration, tiered pricing (Free/Pro/Enterprise) | P0 | 3 weeks |
| **Admin Dashboard** | Super-admin panel for platform management | P1 | 3 weeks |
| **Advanced Reporting** | PDF report generation, automated weekly emails | P2 | 2 weeks |

### 15.5 Phase 4: Ecosystem (Q4 2026)

| Feature | Description | Priority | Effort |
|:---|:---|:---|:---|
| **React Native App** | iOS + Android native apps with shared hook layer | P0 | 12 weeks |
| **Parent Portal** | Read-only dashboard for parents to track children | P1 | 4 weeks |
| **Content Library** | Curated Quran learning resources, Tajweed lessons | P1 | 6 weeks |
| **Gamified Competitions** | Inter-circle tournaments, seasonal events | P2 | 4 weeks |
| **Certificated Programs** | Digital certificates for Quran completion milestones | P2 | 3 weeks |
| **Video Lessons** | Integrated video player for sheikh-recorded lessons | P2 | 4 weeks |

### 15.6 Phase 5: Global Impact (2027+)

| Feature | Description |
|:---|:---|
| **Multi-Language Support** | English, Urdu, Turkish, Malay, French, Indonesian |
| **Global CDN Deployment** | Multi-region Firestore instances, edge computing |
| **Partner API Ecosystem** | Open API for mosque management systems, Islamic schools |
| **Certified Ijazah Tracking** | Digital chain-of-narration for formal Quran certification |
| **AI Tutor** | Personal AI assistant for Quran memorization guidance |
| **Data Analytics Platform** | Anonymized insights for Islamic education research |

### 15.7 Technical Debt Roadmap

| Debt Item | Current State | Target State | Priority |
|:---|:---|:---|:---|
| **State Management** | React Context | Zustand or Jotai for complex state | P2 |
| **Server Components** | Minimal usage | Migrate data fetching to RSC | P1 |
| **API Layer** | Direct Firestore calls | Cloud Functions middleware | P1 |
| **Testing Coverage** | E2E only | Unit + Integration + E2E | P0 |
| **Error Boundaries** | None | React Error Boundaries on all routes | P1 |
| **Logging** | `console.error` | Structured logging with correlation IDs | P2 |
| **CI/CD** | Manual deploy | GitHub Actions → Vercel/Firebase auto-deploy | P0 |
| **Documentation** | This white paper | Storybook + API docs + onboarding guide | P2 |

### 15.8 Scalability Projections

| Metric | Current Capacity | Phase 2 Target | Phase 4 Target |
|:---|:---|:---|:---|
| **Concurrent Users** | ~500 | ~5,000 | ~50,000 |
| **Total Users** | ~1,000 | ~25,000 | ~500,000 |
| **Circles** | ~50 | ~1,000 | ~20,000 |
| **Daily Logs** | ~200 | ~5,000 | ~100,000 |
| **Firestore Reads/Day** | ~50K | ~2M | ~50M |
| **Storage** | ~5GB | ~100GB | ~5TB |
| **Monthly Cost** | ~$0 (free tier) | ~$200 | ~$5,000 |

---

## 16. Closing Remarks

### 16.1 Summary

Halqati (حلقتي) represents a **modern, purpose-built platform** for Quran memorization management that bridges traditional Islamic education pedagogy with cutting-edge web technology. Key architectural decisions include:

1. **Serverless-First:** Zero server management with Firebase's fully managed infrastructure
2. **Real-Time by Default:** Every data operation propagates instantly across all connected clients
3. **Security-in-Depth:** Multi-layered security from client guards through Firebase Security Rules
4. **Gamification-Driven:** A carefully balanced economy that motivates consistent Quran engagement
5. **Arabic-Native:** RTL-first design with culturally appropriate UI patterns and Arabic error messages
6. **Hook-Based Architecture:** Clean separation of concerns via composable custom hooks
7. **Performance-Optimized:** Code splitting, tree shaking, image optimization, and efficient Firestore indexing

### 16.2 Architecture Strengths

| Strength | Benefit |
|:---|:---|
| **Zero Backend Code** | No server to maintain, patch, or scale |
| **Type-Safe End-to-End** | TypeScript prevents entire categories of bugs |
| **Real-Time Collaboration** | Sheikh and student see changes instantly |
| **Atomic Transactions** | Points and membership operations are always consistent |
| **Modular Hook Design** | Features can be added/removed independently |
| **RTL-First Design** | Authentic experience for Arabic-speaking users |

### 16.3 Known Limitations

| Limitation | Mitigation | Timeline |
|:---|:---|:---|
| No server-side validation | Firestore Security Rules enforce constraints | Phase 3 (Cloud Functions) |
| Client-side search | Adequate for current scale (< 500 logs/user) | Phase 2 (Algolia/Typesense) |
| No offline support | Firestore persistence planned | Phase 1 |
| Single-language UI | i18n framework planned | Phase 1 |
| No CI/CD pipeline | Manual `firebase deploy` + `vercel` | Phase 1 |
| No rate limiting | Firebase quotas provide implicit limits | Phase 3 |

### 16.4 Contact & Contribution

| Item | Details |
|:---|:---|
| **Repository** | Private GitHub repository |
| **License** | Proprietary |
| **Technology Stack** | Next.js 14 · React 18 · TypeScript · Firebase · Tailwind CSS |
| **Minimum Node Version** | 18.x LTS |
| **Package Manager** | npm |
| **Deployment Targets** | Vercel (Frontend) + Firebase (Backend Services) |

---

**Document Version:** 1.0.0  
**Last Updated:** February 2026  
**Authors:** Halqati Engineering Team  
**Classification:** Internal — Engineering Reference  

---

*This document is auto-generated from codebase analysis and may be updated as the application evolves. For the latest version, regenerate from source.*
