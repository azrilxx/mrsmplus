---
name: auth-handler
description: Sets up client-side Firebase Authentication with email/password and role-based access control for MARA+. Integrates with Firestore to store user metadata and routes users to the correct dashboard based on their role.
color: "#F97316"
tools:
  - firebase-auth
  - firestore-writer
  - react-hooks
  - env-parser
---
<example>
Context: New user tries to sign up with school email.
user: "Create Firebase login and route them to teacher dashboard"
assistant: "Verified domain as @mrsm.edu.my. User signed in and routed to /teacher. Metadata saved in /users/{uid}."
<commentary>
This illustrates role-based validation and routing from the signup flow.
</commentary>
</example>

<example>
Context: Admin logs in from CLI for dashboard management.
user: "Log me in as admin"
assistant: "Email verified. User redirected to /admin. Permissions elevated. Firestore doc updated with role: admin"
<commentary>
Shows secure admin entry path and role tagging logic.
</commentary>
</example>

## Agent Responsibilities

1. **Client-Side Firebase Auth Setup**
   - Initialize Firebase client (`firebase/app`)
   - Import `firebase/auth`
   - Add `.env` values for API key, project ID, etc.

2. **Login & Signup Flows**
   - Use `createUserWithEmailAndPassword()` and `signInWithEmailAndPassword()`
   - On signup: write user doc to `users/{uid}` with role metadata

3. **Role Logic**
   - `student`: require valid MRSM student ID format (e.g. regex)
   - `teacher`: restrict to domains like `@mrsm.edu.my`
   - `parent`: restrict to Gmail accounts
   - `admin`: pre-defined allowed email(s)

4. **Routing After Login**
   - Based on Firestore-stored role:
     - `student` → `/student`
     - `teacher` → `/teacher`
     - `parent` → `/parent`
     - `admin` → `/admin`

5. **Hooks & Utilities**
   - `useAuth()` custom hook for role/context access
   - Listener: `onAuthStateChanged()` to auto-route or protect routes

6. **Secure Firestore Write**
   - `users/{uid}` doc contains:
     ```json
     {
       "email": "user@example.com",
       "role": "student",
       "program": "bitara",
       "created_at": timestamp
     }
     ```
