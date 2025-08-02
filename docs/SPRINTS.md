# 🧩 Sprint Roadmap

Based on UX analysis findings, MARA+ will be delivered in 4 focused sprints to minimize student cognitive overload while ensuring each sprint delivers standalone value.

## Sprint 1: Quick Win Foundation
- 🧭 **Goal**: Deliver instant value through AI-powered quick answers and immediate XP rewards
- 🔧 **Modules**:
  - Core AI question-answer engine (quizmaster-agent)
  - Basic XP system with instant feedback
  - Simple mobile-first UI (single question flow)
  - Basic student authentication
  - Minimal Firebase schema for questions and XP
- 📎 **Dependencies**: 
  - Firebase project setup
  - Basic question database (Form 1-5 curriculum)
  - Mobile responsive framework

**Success Metrics**: Students can ask questions and receive instant AI answers + XP within 30 seconds

---

## Sprint 2: Study Path Discovery
- 🧭 **Goal**: Unlock personalized study paths based on subject weaknesses and learning patterns
- 🔧 **Modules**:
  - Study pathway planner agent
  - Subject weakness detection algorithm
  - Modular onboarding flow (subject-specific)
  - Progress tracking dashboard
  - Enhanced XP system with streaks
- 📎 **Dependencies**: 
  - Sprint 1 XP system
  - Student interaction data from Sprint 1
  - Subject taxonomy and curriculum mapping

**Success Metrics**: 70% of active students complete subject weakness assessment and access personalized study paths

---

## Sprint 3: Reflection & Mood Intelligence
- 🧭 **Goal**: Enhance learning effectiveness through mood-aware planning and study reflection
- 🔧 **Modules**:
  - Mood analyzer agent
  - Study reflection engine
  - Adaptive scheduling based on mood/energy
  - Daily missions system
  - Optional reflection prompts (non-blocking)
- 📎 **Dependencies**: 
  - Sprint 2 study paths
  - User engagement patterns
  - Mood taxonomy and intervention strategies

**Success Metrics**: 40% of students engage with mood tracking; 60% complete daily missions

---

## Sprint 4: Social Proof & Advanced Features
- 🧭 **Goal**: Drive engagement through social elements and advanced analytics for Form 5 students
- 🔧 **Modules**:
  - Leaderboard system (class/school level)
  - Achievement system with badges
  - Parent dashboard (engagement metrics only)
  - Performance analytics for Form 5 students
  - Offline mode for rural connectivity
- 📎 **Dependencies**: 
  - Sprint 3 engagement data
  - Parent user flows
  - Teacher integration points

**Success Metrics**: 30% parent dashboard adoption; improved retention for Form 5 students

---

## 📌 Design Notes

### Why This Order Matters
1. **Sprint 1** addresses the critical "immediate value" problem - students see benefit within seconds
2. **Sprint 2** unlocks the core promise - personalized learning without overwhelming features
3. **Sprint 3** adds intelligence without complexity - mood/reflection are optional enhancements
4. **Sprint 4** tackles retention through social proof once core habits are established

### Agent Responsibility Matrix

| Sprint | Primary Agents | Supporting Agents |
|--------|---------------|-------------------|
| 1 | `quizmaster-agent`, `xp_sync_agent`, `frontend-developer` | `firebase_connector`, `ui-designer` |
| 2 | `study-pathway-planner`, `lesson_planner`, `data_ingestor` | `performance-benchmarker`, `frontend-designer` |
| 3 | `mood_analyzer`, `study_reflection`, `daily_missions_engine` | `ai-engineer`, `whimsy-injector` |
| 4 | `leaderboard_engine`, `achievement_system`, `parent_module` | `offline-mode-engineer`, `teacher-integrations-agent` |

### UX Checkpoint Strategy
- **Post-Sprint 1**: Mobile usability testing with Form 1 students
- **Post-Sprint 2**: Subject engagement analysis across Form 1-3
- **Post-Sprint 3**: Mood/reflection adoption rates
- **Post-Sprint 4**: Retention and parent satisfaction metrics

### Risk Mitigation
- **Feature Overload**: Each sprint is independently valuable
- **Mobile Performance**: Mobile-first design enforced from Sprint 1
- **Rural Connectivity**: Offline mode prioritized in Sprint 4
- **Language Barriers**: Simplified UI text, tested with Form 1 students

### Technical Checkpoints
- **Sprint 1**: Firebase performance under load
- **Sprint 2**: Algorithm accuracy for weakness detection
- **Sprint 3**: Mood data privacy compliance
- **Sprint 4**: Parent dashboard security audit