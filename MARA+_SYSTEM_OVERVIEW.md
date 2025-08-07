# 📘 Project Brief: MARA+ — National-Scale AI-Powered Study Platform

## 🧠 Purpose

MARA+ is a government-backed, AI-enhanced study platform designed for MRSM students across Malaysia. It provides free access to intelligent learning tools inspired by ChatGPT Study Mode — with full gamification, adaptive planning, parental oversight, and role-specific dashboards.

The primary user base includes:
- Students from underprivileged backgrounds (no access to ChatGPT Pro)
- Teachers assigned to MRSM classes
- Parents monitoring child performance
- Admins representing national education oversight

This platform is intended to scale to 10,000+ active users and must be robust, auditable, modular, and emotionally resonant.

---

## 🎯 Core Modules & Features

### 1. Role-Based Access System
- Roles: `student`, `teacher`, `parent`, `admin`
- UID-based authentication with Firebase
- Each role has unique dashboard logic and permissions

### 2. Study Mode (ChatGPT-style Q&A)
- Multiple-choice and short answer sessions
- Claude-powered Q&A generator (fallback to JSON/hardcoded)
- Real-time answer validation and XP rewards
- Data stored in `/studentProgress/{studentId}`

### 3. Cognitive Smart Study Planner
- Weekly adaptive planner based on:
  - XP logs
  - Bloom taxonomy levels
  - Reflection mood/fatigue logs
- Stored in `/studyPlans/{studentId}`

### 4. Gamification Layer
- XP-based leveling system (100 XP = 1 level)
- Daily missions, rotating by goal type
- Achievement badge system (rare, epic, legendary tiers)
- Streak tracking with animation and fire indicator
- Gamified UI: particles, confetti, animations

### 5. Teacher Dashboard
- Real-time class engagement table
- File upload logs
- At-risk student alerts
- Ability to comment per student (stored in subcollections)

### 6. Parent Dashboard
- Linked to student via `linkedStudentId`
- Motivation card generator (based on performance)
- Weekly trend summary and streak viewer
- Reflection log visibility

### 7. Admin System (Watchtower)
- Nation-level analytics, logs, and Claude agent triggers
- User management, bulk role assignment
- Ingestion log viewer and performance stats (future)

### 8. Content Ingestion Engine
- Teachers upload PDF, DOCX, image files
- Claude agent parses into question format (study mode)
- Stores Q&A pairs under subject-specific Firestore nodes
- Status: Upload API built, parsing agent pending

---

## 🔧 Stack & Architecture

- **Frontend**: Next.js, TypeScript, TailwindCSS, SWR
- **Backend**: Firebase (Auth, Firestore, Storage)
- **AI Engine**: Claude sub-agents (Study Formatter, Parser, Watchtower, etc.)
- **Gamification**: Realtime XP + level tracking, UI animations
- **Storage**:
  - `/users/`
  - `/studentProgress/`
  - `/studyPlans/`
  - `/uploads/`
  - `/comments/`
  - `/reflections/`
  - `/achievements/`

---

## ✅ Design Philosophy

- Built to **replace ChatGPT Study Mode** for poor students
- Emotionally intelligent, personalized experience
- Admin-traceable, role-secured, content-licensed
- Zero messaging — just data visibility and engagement insights
- Fully auditable codebase (no blackbox logic)

---

## 🚫 Strict Expectations

- ❌ No mock data in production paths
- ❌ No unfinished components in dashboards
- ❌ No untyped Firestore responses
- ❌ No generic or shallow audit reports
- ❌ No missing fallback strategies (every AI call must degrade safely)

---

## 🧾 Claude Execution Guidelines

When auditing or rewriting:
- Understand each role’s intent and boundaries
- Flag mock dependencies and replace with Firestore logic
- Validate gamified flows: XP, rewards, streaks, missions
- Check that every student interaction updates Firestore
- Check that planner logic adapts to XP + fatigue history
- Log what’s missing with file references and priorities

---

# 📎 Use This Brief As Context Before Any Code Review
