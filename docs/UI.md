# MARA+ UI Design Specification

## 📱 Page Structure

### Page 1: Home / Ask a Question
- **Components:**
  - **QuestionInput** — Large text area with voice input button for accessibility
  - **SubjectQuickSelect** — 5 primary subject buttons (Math, Science, English, BM, History)
  - **XPDisplay** — Current XP counter with animated progress ring
  - **StreakCounter** — Daily streak indicator with flame icon
  - **RecentQuestions** — Last 3 questions for quick re-access

- **Interaction Notes:**
  - Successful Q&A completion triggers +10 XP pop animation with gentle confetti burst
  - Voice input for students with typing difficulties (microphone pulses gently when listening)
  - Auto-subject detection reduces friction with subtle shimmer effect during processing
  - Large tap targets (minimum 44px) for thumb navigation with haptic feedback on tap
  - **Whimsy Elements:**
    - Question input placeholder text rotates through encouraging phrases: "Apa soalan hari ini?", "Let's explore together!", "Curious about something?"
    - Typing animation shows small sparkles around active text cursor
    - Subject quick-select buttons have gentle hover glow with subject-themed colors
    - Daily greeting changes based on prayer times: "Selamat pagi!", "Good afternoon!", "Selamat petang!"

### Page 2: AI Answer Display
- **Components:**
  - **AnswerCard** — Clean typography with step-by-step breakdown
  - **XPReward** — Animated badge showing earned points
  - **SubjectTag** — Auto-detected subject classification
  - **RelatedTopics** — 2-3 similar concepts for continued learning
  - **PathwayPrompt** — Gentle nudge to explore Study Planner

- **Interaction Notes:**
  - XP animation plays immediately after answer loads with satisfying "ding" sound (respects device silence)
  - "Add to Study Plan" button appears after 3 seconds with gentle slide-up motion
  - Related topics use card swipe for mobile-friendly browsing with smooth parallax effect
  - **Whimsy Elements:**
    - Answer text appears with typewriter effect (skippable by tap)
    - Step completion shows small checkmark animations with green glow
    - XP badge bounces and rotates slightly on appear, with particle trail
    - Related topics cards have subtle breathing animation to draw attention
    - Success messages include encouraging phrases: "Hebat!", "Well done!", "Keep it up!"

### Page 3: Subject Selector
- **Components:**
  - **SubjectGrid** — 3x2 grid layout for Form 1-5 core subjects
  - **FormLevelToggle** — Quick switcher between form levels
  - **WeaknessIndicator** — Red dot overlay on subjects needing attention
  - **ProgressBar** — Subject-specific XP progress

- **Interaction Notes:**
  - Large subject cards with clear icons and MRSM syllabus alignment
  - Weakness detection highlights subjects with <70% recent success rate
  - Form level toggle updates available topics instantly with smooth card flip animation
  - **Whimsy Elements:**
    - Subject cards have gentle floating animation on idle
    - Mastered subjects show subtle golden shimmer border
    - Weakness indicators pulse gently rather than static red dots
    - Card selection triggers satisfying scale-up animation with haptic feedback
    - Progress bars fill with gradient wave animation when achievements unlock
    - Motivational tooltips appear on struggling subjects: "Almost there!", "You've got this!"

### Page 4: Study Pathway Planner
- **Components:**
  - **WeeklyView** — 7-day calendar with study sessions
  - **TopicCards** — Draggable study topics with time estimates
  - **DifficultyBadges** — Easy/Medium/Hard visual indicators
  - **CompletionTracker** — Progress ring for weekly goals
  - **SPMCountdown** — Days remaining for Form 5 students

- **Interaction Notes:**
  - Drag-and-drop disabled for Form 1-2 (auto-scheduling)
  - Form 5 gets full manual control over topic sequencing
  - Completion triggers +25 XP and streak maintenance with celebration animation
  - **Whimsy Elements:**
    - Topic cards wobble slightly when dragged, with magnetic snap-to-grid effect
    - Completed tasks get satisfying checkmark with green ripple effect
    - Weekly progress ring fills with animated gradient and gentle pulse
    - SPM countdown shows encouraging messages as exam approaches: "Making great progress!", "Stay focused!"
    - Calendar days have subtle color-coded mood indicators (green=productive, blue=balanced)
    - Difficulty badges use friendly iconography: easy=smile, medium=determined face, hard=focused face

### Page 5: Simple Dashboard
- **Components:**
  - **XPProgressRing** — Weekly XP goal visualization
  - **StreakCalendar** — 30-day streak history
  - **SubjectBreakdown** — Pie chart of study time distribution
  - **QuickActions** — 3 primary CTAs (Ask Question, Study Plan, Profile)
  - **WeaknessAlert** — Notification for subjects needing attention

- **Interaction Notes:**
  - Dashboard loads in <2 seconds on 3G connection
  - Data-light design prioritizes text over heavy graphics
  - Weakness alerts link directly to relevant study materials
  - **Whimsy Elements:**
    - XP progress ring fills with sparkling particle trail animation
    - Streak calendar shows flame intensity based on streak length (small flames to roaring fire)
    - Subject breakdown pie chart segments glow when tapped, with smooth rotation
    - Quick action buttons have gentle press animation with color feedback
    - Achievement celebrations show brief confetti burst with cultural patterns (geometric Islamic designs)
    - Time-based greetings: "Selamat pagi, ready to learn?", "Good afternoon, keep going!", "Malam yang baik untuk study!"

## 🧩 UI Component Map

| Component | Description | Used On | Design Notes |
|-----------|-------------|---------|--------------|
| **XPBadge** | Animated XP reward feedback | Ask Page, Planner, Dashboard | Bouncy animation, +/- indicators, particle trail effect |
| **SubjectCard** | Subject selection tile with progress | Subject Page, Dashboard | MRSM colors, clear iconography, floating animation on idle |
| **QuestionInput** | Primary text/voice input field | Home Page | Auto-resize, voice button prominence, sparkle cursor animation |
| **AnswerCard** | AI response display container | Answer Page | Step-by-step layout, readable typography, typewriter reveal effect |
| **StreakCounter** | Daily streak visualization | Home, Dashboard | Flame icon with intensity scaling, number prominence, gentle glow |
| **WeaknessIndicator** | Red dot alert for struggling subjects | Subject Page | Non-intrusive, actionable, gentle pulse animation |
| **TopicCard** | Individual study topic item | Planner Page | Difficulty color-coding, time estimates, wobble on drag |
| **ProgressRing** | Circular progress visualization | Dashboard, Components | Smooth animations, clear percentages, sparkling fill |
| **NavBar** | Bottom navigation with 4 main tabs | All Pages | Thumb-reachable, clear labels, haptic feedback |
| **LoadingState** | Skeleton screens for slow connections | All Pages | Gray placeholders, realistic layout, gentle shimmer |

## ✨ Whimsy Design Guidelines

### Delightful Micro-Interactions
- **Purposeful Animation**: Every animation serves to provide feedback, guide attention, or celebrate achievement
- **Performance-Conscious**: All animations respect `prefers-reduced-motion` and device battery levels
- **Cultural Sensitivity**: Geometric patterns inspired by Islamic art for celebration effects, avoiding imagery that may conflict with cultural values
- **Educational Context**: Whimsy elements reinforce learning goals rather than distract from them

### Age-Appropriate Gamification
- **Form 1-2**: More playful animations, encouraging sounds, simplified celebrations
- **Form 3-4**: Balanced approach with moderate animations and achievement feedback
- **Form 5**: Subtle, mature interactions focused on progress visualization and motivation

### Encouraging Language Patterns
- **Bilingual Support**: Motivational phrases rotate between Bahasa Malaysia and English
- **Achievement Messages**: "Syabas!", "Hebat!", "Well done!", "Keep going!", "Almost there!"
- **Cultural Greetings**: Time-based greetings that respect daily prayer schedules
- **Growth Mindset**: Language emphasizes effort and improvement over absolute performance

### Sound Design (Optional)
- **Respectful Audio**: All sounds respect device silence settings and Islamic principles
- **Achievement Sounds**: Gentle chimes and positive audio cues for completions
- **Feedback Tones**: Subtle audio confirmation for interactions when appropriate
- **Cultural Considerations**: No music, focus on natural sounds and notification chimes

## 🎯 Design Constraints

### Accessibility & Usability
- **One-handed use**: All primary actions within thumb reach (bottom 2/3 of screen)
- **Large tap targets**: Minimum 44px for rural students with varying device familiarity
- **High contrast**: Ensure readability in bright outdoor conditions common in rural areas
- **Clear hierarchy**: Bold headings, consistent spacing, obvious primary actions

### Performance & Connectivity
- **Offline-lite support**: Essential content cached locally, graceful degradation for slow connections
- **Data efficiency**: Prioritize text over images, compress assets, lazy-load non-critical content
- **3G optimization**: Page loads under 3 seconds on slower rural connections
- **Progressive loading**: Critical content first, enhancements layer in

### Technical Requirements
- **Local font fallback**: System fonts when custom fonts fail to load
- **No asset bloat**: SVG icons, minimal external dependencies
- **Touch-first interactions**: Swipe, tap, long-press patterns over hover states
- **Battery awareness**: Minimize animations on low-battery devices

### Form-Specific Adaptations
- **Form 1-2**: Simplified navigation, larger buttons, guided workflows
- **Form 3-4**: Balanced complexity, more subject options, moderate customization
- **Form 5**: Advanced features, SPM focus, full planner control, detailed analytics

### Cultural Considerations
- **MRSM branding**: Official colors and iconography where appropriate
- **Bilingual ready**: Component structure supports BM/English toggle with smooth language transition animations
- **Islamic calendar**: Hijri date support for relevant cultural context
- **Modest design**: Clean, professional aesthetic appropriate for Islamic education environment
- **Whimsy Integration**: Celebration patterns use geometric Islamic art motifs, time-based greetings respect prayer schedules, encouraging phrases blend BM/English naturally

---

*UI specification complete. Ready for frontend implementation with mobile-first responsive design prioritizing Form 1-5 MRSM student needs.*