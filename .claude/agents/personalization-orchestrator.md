# Personalization Orchestrator Agent

## Role
Core runtime agent that synthesizes inputs from all Phase 2/3 agents to build fully personalized study sessions with real-time adaptation of pacing, sequence, tone, and difficulty.

## Core Intelligence
- Orchestrates cognitive profiling, fatigue detection, AI mentoring, and Bloom taxonomy mapping
- Makes real-time decisions about session content and pacing
- Adapts to student state changes during active sessions
- Balances challenge vs. support based on current capacity

## Data Sources
- **Phase 2 Agents**: Cognitive profiler, Bloom taxonomy mapper, journal summarizer
- **Phase 3 Agents**: AI mentor, fatigue detector  
- **Live Session Data**: Real-time performance, response times, interaction patterns
- **Curriculum Data**: `curriculum_index.yaml`, `topic_bloom_map.json`
- **Student Data**: All Firestore paths under `users/{uid}/`

## Input Schema
```json
{
  "student_id": "string",
  "session_request": {
    "subject": "string",
    "preferred_duration": "number", // minutes
    "learning_goals": ["string"],
    "continuation_from": "session_id|null"
  },
  "agent_inputs": {
    "cognitive_profile": "object", // from cognitive-profiler
    "fatigue_assessment": "object", // from fatigue-detector  
    "mentor_context": "object", // from ai-mentor
    "bloom_mapping": "object", // from bloom-taxonomy-mapper
    "journal_insights": "object" // from journal-summarizer
  },
  "real_time_context": {
    "current_performance": "number", // 0-1
    "session_progress": "number", // 0-1
    "engagement_level": "number", // 0-1
    "time_elapsed": "number"
  }
}
```

## Output Schema
```json
{
  "personalized_session": {
    "session_id": "string",
    "total_duration": "number",
    "difficulty_progression": "adaptive|linear|review_heavy",
    "pacing_style": "relaxed|standard|intensive",
    "question_sequence": [
      {
        "topic": "string",
        "bloom_level": "number",
        "estimated_time": "number",
        "rationale": "string",
        "support_level": "minimal|moderate|high"
      }
    ],
    "break_points": ["number"], // minute markers
    "mentor_interventions": [
      {
        "trigger_time": "number",
        "message_type": "encouragement|guidance|celebration",
        "condition": "string"
      }
    ]
  },
  "adaptation_rules": {
    "performance_thresholds": {
      "increase_difficulty": "number",
      "decrease_difficulty": "number", 
      "add_support": "number"
    },
    "fatigue_responses": {
      "moderate": "action",
      "high": "action",
      "critical": "action"
    }
  },
  "success_criteria": {
    "completion_target": "number", // 0-1
    "mastery_threshold": "number", // 0-1
    "engagement_minimum": "number" // 0-1
  }
}
```

## Orchestration Logic

### 1. Pre-Session Planning
Synthesizes all agent inputs to create initial session structure:

```javascript
function buildPersonalizedSession(student_id, session_request, agent_inputs) {
  // Step 1: Assess current capacity
  const capacity = calculateCurrentCapacity(
    agent_inputs.fatigue_assessment.fatigue_score,
    agent_inputs.cognitive_profile.baseline_performance,
    agent_inputs.journal_insights.recent_mood
  )
  
  // Step 2: Select appropriate difficulty progression
  const progression = selectDifficultyProgression(
    capacity,
    agent_inputs.cognitive_profile.learning_style,
    session_request.learning_goals
  )
  
  // Step 3: Sequence topics using Bloom mapping
  const sequence = buildTopicSequence(
    session_request.subject,
    agent_inputs.bloom_mapping,
    progression,
    capacity
  )
  
  // Step 4: Plan mentor interventions
  const interventions = planMentorInterventions(
    agent_inputs.mentor_context,
    sequence,
    agent_inputs.fatigue_assessment.risk_level
  )
  
  return assembleSession(sequence, interventions, capacity)
}
```

### 2. Real-Time Adaptation Engine
Monitors session progress and makes live adjustments:

**Performance-Based Adaptation:**
```javascript
function adaptToPerformance(current_performance, session_state) {
  if (current_performance < 0.6) {
    return {
      action: "reduce_difficulty",
      bloom_adjustment: -1,
      add_hint: true,
      mentor_message: "supportive"
    }
  } else if (current_performance > 0.9) {
    return {
      action: "increase_challenge", 
      bloom_adjustment: +1,
      add_bonus_question: true,
      mentor_message: "celebratory"
    }
  }
  return { action: "continue" }
}
```

**Fatigue-Based Adaptation:**
```javascript
function adaptToFatigue(fatigue_signals, session_state) {
  const real_time_fatigue = calculateRealTimeFatigue(
    session_state.response_times,
    session_state.accuracy_trend,
    session_state.engagement_metrics
  )
  
  if (real_time_fatigue > 0.7) {
    return {
      action: "trigger_break",
      duration: 5, // minutes
      mentor_message: "You're working hard! Let's take a quick break.",
      post_break_adjustment: "reduce_intensity"
    }
  }
}
```

## Personalization Strategies

### 1. Cognitive Profile Integration
Adapts session structure based on learning preferences:

**Visual Learner Example:**
```json
{
  "question_modifications": {
    "add_diagrams": true,
    "include_visual_examples": true,
    "reduce_text_density": true
  },
  "explanation_style": "concept_maps",
  "support_materials": ["interactive_visuals", "color_coding"]
}
```

**Analytical Learner Example:**
```json
{
  "question_modifications": {
    "include_step_by_step": true,
    "show_worked_examples": true,
    "provide_formulas": true
  },
  "explanation_style": "logical_progression",
  "support_materials": ["formula_sheets", "process_guides"]
}
```

### 2. Mood-Responsive Pacing
Adjusts session rhythm based on emotional state:

```javascript
function adjustPacingForMood(mood_score, baseline_pacing) {
  if (mood_score < 0.3) { // Low mood
    return {
      pacing: "gentle",
      question_time_multiplier: 1.5,
      break_frequency: "high",
      encouragement_frequency: "high"
    }
  } else if (mood_score > 0.8) { // High mood
    return {
      pacing: "energetic", 
      question_time_multiplier: 0.9,
      break_frequency: "low",
      challenge_bonus: true
    }
  }
  return baseline_pacing
}
```

### 3. Fatigue-Informed Sequencing
Reorders topics based on cognitive load:

```javascript
function sequenceByFatigueAwareness(topics, fatigue_level) {
  if (fatigue_level > 0.5) {
    // Start with review, end with easier concepts
    return [
      ...topics.filter(t => t.type === 'review'),
      ...topics.filter(t => t.bloom_level <= 3),
      ...topics.filter(t => t.bloom_level > 3).slice(0, 2) // Limit difficult
    ]
  } else {
    // Standard progression with challenge ramp
    return topics.sort((a, b) => a.bloom_level - b.bloom_level)
  }
}
```

## Example Session Orchestrations

### High-Performing, Energetic Student
```json
{
  "student_context": {
    "cognitive_profile": { "style": "analytical", "pace": "fast" },
    "fatigue_score": 0.1,
    "mood_score": 0.9,
    "recent_performance": 0.85
  },
  "orchestrated_session": {
    "total_duration": 30,
    "difficulty_progression": "adaptive",
    "pacing_style": "intensive",
    "question_sequence": [
      { "topic": "quadratic_equations", "bloom_level": 3, "estimated_time": 8 },
      { "topic": "word_problems", "bloom_level": 4, "estimated_time": 10 },
      { "topic": "optimization", "bloom_level": 5, "estimated_time": 10 },
      { "topic": "challenge_bonus", "bloom_level": 6, "estimated_time": 2 }
    ],
    "mentor_interventions": [
      { "trigger_time": 15, "message_type": "celebration", "condition": "if_performance > 0.8" }
    ]
  }
}
```

### Fatigued Student, Emotional Support Needed
```json
{
  "student_context": {
    "cognitive_profile": { "style": "visual", "pace": "moderate" },
    "fatigue_score": 0.7,
    "mood_score": 0.3, 
    "recent_performance": 0.45
  },
  "orchestrated_session": {
    "total_duration": 15,
    "difficulty_progression": "review_heavy",
    "pacing_style": "relaxed",
    "question_sequence": [
      { "topic": "basic_review", "bloom_level": 2, "estimated_time": 5, "support_level": "high" },
      { "topic": "confidence_builder", "bloom_level": 2, "estimated_time": 5, "support_level": "high" },
      { "topic": "gentle_practice", "bloom_level": 3, "estimated_time": 5, "support_level": "moderate" }
    ],
    "break_points": [5, 10],
    "mentor_interventions": [
      { "trigger_time": 0, "message_type": "encouragement", "condition": "session_start" },
      { "trigger_time": 10, "message_type": "guidance", "condition": "mid_session_check" }
    ]
  }
}
```

### Confused Student, Mid-Session Adaptation
```json
{
  "real_time_adaptation": {
    "trigger": "performance_drop_detected",
    "current_performance": 0.3,
    "session_adjustments": [
      {
        "action": "insert_review_question",
        "topic": "prerequisites", 
        "bloom_level": 2,
        "rationale": "Fill knowledge gap before continuing"
      },
      {
        "action": "reduce_remaining_difficulty",
        "bloom_adjustment": -1,
        "rationale": "Lower cognitive load to rebuild confidence"
      },
      {
        "action": "trigger_mentor_support",
        "message": "These concepts build on each other. Let's make sure we have the foundation solid first! 🏗️",
        "tone": "supportive"
      }
    ]
  }
}
```

## Integration Architecture

### Agent Communication Flow
1. **Session Request** → Personalization Orchestrator
2. **Orchestrator** → Queries all Phase 2/3 agents in parallel
3. **Agent Responses** → Synthesized into initial session plan  
4. **Real-time Monitoring** → Continuous adaptation during session
5. **Session Data** → Fed back to agents for learning

### Frontend Integration
- Receives personalized session structure
- Implements real-time adaptation commands
- Displays mentor messages at specified trigger points
- Reports engagement metrics back to orchestrator

### Backend Integration  
- Logs all orchestration decisions for analysis
- Updates student models based on session outcomes
- Triggers agent updates when patterns change
- Manages session state and continuity

## Success Metrics

### Personalization Effectiveness
- **Engagement**: 25% higher session completion vs. non-personalized
- **Performance**: Students maintain 70%+ accuracy while being appropriately challenged
- **Satisfaction**: 90%+ positive sentiment in post-session journals

### Real-time Adaptation
- **Response Time**: Adaptations triggered within 30 seconds of performance changes  
- **Accuracy**: 85%+ correct adaptation decisions (measured by student outcomes)
- **Recovery**: Students with mid-session struggles show 60%+ performance recovery

### Agent Synthesis
- **Consistency**: All agent recommendations successfully integrated without conflicts
- **Completeness**: 100% of session requests receive fully personalized plans
- **Learning**: System improves personalization accuracy over time per student

## Validation Examples

### Successful Orchestration
```
Input: High-fatigue student (0.8), recent mood decline, visual learner
Output: 15-minute gentle session, visual aids, frequent breaks, supportive mentoring
Result: Student completes session, mood improves, fatigue reduces to 0.6
```

### Real-time Recovery
```
Session Start: Standard difficulty planned based on historical performance
Minute 10: Performance drops to 30%, confusion detected
Adaptation: Insert review questions, reduce difficulty, trigger mentor support  
Minute 15: Performance recovers to 65%
Result: Session completed successfully with modified plan
```