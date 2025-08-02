# Claude Agent Orchestration Workflow for MARA+

This document defines how each Claude sub-agent operates within the MARA+ ecosystem.

## 🎭 Registered Agents
- **Admin Dashboard Orchestrator** → `admin-dashboard-orchestrator`
- **Ai Engineer** → `ai-engineer`
- **Backend Architect** → `backend-architect`
- **Daily Missions Engine** → `daily_missions_engine`
- **Data Ingestor** → `data_ingestor`
- **Experiment Tracker** → `experiment-tracker`
- **Feedback Synthesizer** → `feedback-synthesizer`
- **Firebase Connector** → `firebase_connector`
- **Frontend Designer** → `frontend-designer`
- **Frontend Developer** → `frontend-developer`
- **Gamification Designer** → `gamification-designer`
- **Leaderboard Engine** → `leaderboard_engine`
- **Legal Compliance Checker** → `legal-compliance-checker`
- **Lesson Planner** → `lesson_planner`
- **Mentor Contributions Manager** → `mentor-contributions-manager`
- **Mood Analyzer** → `mood_analyzer`
- **Offline Mode Engineer** → `offline-mode-engineer`
- **Orchestration Hub** → `orchestration_hub`
- **Parent Engagement Specialist** → `parent-engagement-specialist`
- **Parent Module** → `parent_module`
- **Performance Benchmarker** → `performance-benchmarker`
- **Project Shipper** → `project-shipper`
- **Prompt Lab Curator** → `prompt-lab-curator`
- **Rapid Prototyper** → `rapid-prototyper`
- **Self Explanation Engine** → `self_explanation_engine`
- **Study Pathway Planner** → `study-pathway-planner`
- **Study Reflection** → `study_reflection`
- **Teacher Integrations Agent** → `teacher-integrations-agent`
- **Teacher Module** → `teacher_module`
- **Test Writer Fixer** → `test-writer-fixer`
- **Ui Designer** → `ui-designer`
- **Ux Researcher** → `ux-researcher`
- **Watchtower Sentinel** → `watchtower-sentinel`
- **Web Scraper** → `web_scraper`
- **Whimsy Injector** → `whimsy-injector`
- **Xp Sync Agent** → `xp_sync_agent`

## 🧠 Execution Protocol
All `.md` files in the `agents/` directory conform to the Claude sub-agent specification.
The orchestrator dynamically loads each `.md`, parses the YAML header and `You are` block, and activates the agent as needed.

### 🔄 Example Chain
1. `mood_analyzer` receives mood log input.
2. `study-pathway-planner` adjusts lesson flow based on that mood.
3. `lesson_planner` converts that into a concrete schedule.
4. `frontend-designer` renders it for the student.

## 🧩 Chainable Types
- `diagnostic`: mood_analyzer, performance-benchmarker
- `planner`: study-pathway-planner, lesson_planner
- `generator`: self_explanation_engine, xp_sync_agent
- `observer`: watchtower-sentinel, feedback-synthesizer
- `connector`: teacher-integrations-agent, parent-engagement-specialist
- `ui/ux`: frontend-designer, ui-designer, whimsy-injector

## ⚙️ Invocation Notes
Use `functions/agentRunner.js` or your Claude orchestration logic to:
1. Load agents dynamically from `/agents/*.md`
2. Parse YAML + prompt
3. Execute via Claude per the subagent manifest
