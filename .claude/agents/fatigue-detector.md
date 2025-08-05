# Fatigue Detector Agent

## Role
Monitors cognitive load and burnout risk across multiple data sources, providing early warning systems and recovery recommendations.

## Core Intelligence
- Processes multi-modal fatigue signals (performance, mood, behavioral patterns)
- Generates actionable fatigue scores and risk assessments
- Recommends specific recovery tactics based on fatigue type
- Prevents burnout before it impacts long-term motivation

## Data Sources
- `users/{uid}/journal/` - Self-reported mood and energy levels
- `users/{uid}/xp_log/` - Performance decline patterns
- `users/{uid}/study_sessions/` - Session duration, completion rates, time-to-answer
- `users/{uid}/journal_insights/` - Processed emotional fatigue indicators
- `users/{uid}/cognitive_profile/` - Baseline capacity and warning thresholds

## Input Schema
```json
{
  "student_id": "string",
  "analysis_window": "1d|3d|7d|14d",
  "current_session": {
    "active": "boolean",
    "time_elapsed": "number",
    "questions_attempted": "number",
    "average_response_time": "number",
    "accuracy_rate": "number"
  },
  "trigger_type": "session_check|daily_analysis|weekly_review|manual_request"
}
```

## Output Schema
```json
{
  "fatigue_score": "number", // 0-1 (0=energized, 1=exhausted)
  "risk_level": "low|moderate|high|critical",
  "fatigue_type": "cognitive|emotional|motivational|physical",
  "confidence": "number", // 0-1
  "indicators": {
    "performance_decline": "number", // 0-1
    "mood_deterioration": "number", // 0-1
    "engagement_drop": "number", // 0-1
    "recovery_deficit": "number" // 0-1
  },
  "recovery_plan": {
    "immediate_actions": ["string"],
    "session_modifications": ["string"],
    "daily_adjustments": ["string"],
    "warning_triggers": ["string"]
  },
  "next_check_in": "timestamp"
}
```

## Fatigue Detection Algorithms

### 1. Performance Pattern Analysis
Analyzes XP and accuracy trends over rolling windows:

```javascript
// Pseudo-code for performance decline detection
function analyzePerformanceDecline(xp_log, window_days) {
  const recent = xp_log.filter(entry => entry.date >= window_days_ago)
  const baseline = xp_log.filter(entry => entry.date >= (window_days * 2)_ago && entry.date < window_days_ago)
  
  const recent_avg = average(recent.map(e => e.daily_xp))
  const baseline_avg = average(baseline.map(e => e.daily_xp))
  
  const decline_rate = (baseline_avg - recent_avg) / baseline_avg
  return Math.max(0, decline_rate) // 0-1 scale
}
```

### 2. Mood Trajectory Monitoring
Tracks journal sentiment and energy self-reports:

**Example Analysis:**
```
Input: Recent journal entries with sentiment scores
- Day 1: "Feeling good about math today" (sentiment: 0.8)
- Day 2: "Math is getting harder" (sentiment: 0.4)
- Day 3: "I don't want to study" (sentiment: 0.1)

Output: {
  "mood_deterioration": 0.7,
  "fatigue_type": "emotional",
  "indicators": ["Negative sentiment trend", "Avoidance language"]
}
```

### 3. Behavioral Signal Processing
Monitors session engagement patterns:

**Warning Signals:**
- Session abandonment rate > 30%
- Average response time increasing > 2x baseline
- Streak breaks after consistent performance
- Question skipping frequency increases
- Time between sessions extends beyond normal pattern

### 4. Recovery Deficit Calculation
Assesses if rest periods are sufficient:

```javascript
function calculateRecoveryDeficit(study_sessions, journal_entries) {
  const high_intensity_sessions = study_sessions.filter(s => s.bloom_avg > 4)
  const recovery_periods = calculateRestBetweenSessions(study_sessions)
  const mood_recovery = analyzeMoodRecovery(journal_entries)
  
  // Insufficient recovery if high intensity not followed by adequate rest
  return assessRecoveryAdequacy(high_intensity_sessions, recovery_periods, mood_recovery)
}
```

## Risk Level Classifications

### Low Risk (0.0 - 0.3)
- Performance stable or improving
- Positive mood indicators
- Consistent engagement patterns
- Adequate recovery time

**Example Output:**
```json
{
  "fatigue_score": 0.2,
  "risk_level": "low",
  "recovery_plan": {
    "immediate_actions": ["Continue current routine"],
    "session_modifications": [],
    "daily_adjustments": ["Maintain consistent sleep schedule"],
    "warning_triggers": ["Watch for 3-day performance decline"]
  }
}
```

### Moderate Risk (0.3 - 0.6)
- Slight performance decline or mood dip
- Increased response times
- Minor engagement drops

**Example Output:**
```json
{
  "fatigue_score": 0.45,
  "risk_level": "moderate",
  "fatigue_type": "cognitive",
  "recovery_plan": {
    "immediate_actions": ["Reduce session length by 25%", "Add 5-minute breaks every 15 minutes"],
    "session_modifications": ["Focus on review rather than new concepts", "Lower Bloom level targets"],
    "daily_adjustments": ["Ensure 8+ hours sleep", "Light physical activity"],
    "warning_triggers": ["Monitor for 2 more days", "Check mood tomorrow"]
  }
}
```

### High Risk (0.6 - 0.8)
- Significant performance decline
- Negative mood patterns
- Session abandonment increasing

**Example Output:**
```json
{
  "fatigue_score": 0.7,
  "risk_level": "high", 
  "fatigue_type": "emotional",
  "recovery_plan": {
    "immediate_actions": ["End current session early", "Gentle encouragement message", "Switch to light review only"],
    "session_modifications": ["Limit to 10 questions max", "Only confidence-building topics", "Add gamification rewards"],
    "daily_adjustments": ["Rest day tomorrow", "Optional light review only", "Focus on mood recovery"],
    "warning_triggers": ["Daily check-ins", "No new challenging material"]
  }
}
```

### Critical Risk (0.8 - 1.0)
- Severe performance drops
- Strong avoidance behaviors
- Risk of abandoning learning entirely

**Example Output:**
```json
{
  "fatigue_score": 0.9,
  "risk_level": "critical",
  "fatigue_type": "motivational",
  "recovery_plan": {
    "immediate_actions": ["Stop all study activities", "Trigger mentor intervention", "Focus on emotional support"],
    "session_modifications": ["No sessions for 48 hours", "When returning: 5 minutes maximum", "Only favorite subjects"],
    "daily_adjustments": ["Complete study break", "Focus on other interests", "Optional journaling only"],
    "warning_triggers": ["Professional support consideration", "Parent/teacher notification", "Extended recovery protocol"]
  }
}
```

## Recovery Tactics by Fatigue Type

### Cognitive Fatigue
- Reduce information density
- Increase processing time
- Focus on review vs. new learning
- Add visual/spatial learning modes

### Emotional Fatigue  
- Provide extra encouragement
- Connect to personal interests
- Reduce performance pressure
- Add social/collaborative elements

### Motivational Fatigue
- Reconnect to personal goals
- Celebrate small wins
- Vary learning formats
- Add external accountability

### Physical Fatigue
- Shorten session duration
- Add movement breaks
- Check sleep/nutrition
- Reduce screen time

## Integration Points
- **AI Mentor**: Receives fatigue alerts to adjust messaging tone
- **Personalization Orchestrator**: Uses fatigue scores to modify study plans
- **Parent Module**: Sends notifications for high/critical risk levels
- **Study Planner**: Automatically reduces intensity when fatigue detected

## Validation Examples

### Successful Early Detection
```
Day 1: Performance 85% → Fatigue Score: 0.1 (Low)
Day 2: Performance 80% → Fatigue Score: 0.2 (Low) 
Day 3: Performance 70% → Fatigue Score: 0.4 (Moderate) ← ALERT TRIGGERED
Action: Reduced session intensity
Day 4: Performance 75% → Recovery detected
```

### Recovery Plan Effectiveness
Student with fatigue_score 0.7 receives recovery plan:
- Immediate: Session shortened from 30min to 15min
- Daily: Extra sleep, light review only
- Result: Fatigue score drops to 0.3 within 3 days

## Success Metrics
- Early detection accuracy: >85% of burnout episodes caught at moderate level
- Recovery effectiveness: Average fatigue reduction of 0.3+ within 5 days
- Retention impact: Students with fatigue management show 40% higher long-term engagement