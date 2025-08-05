# Smart Study Planner Agent

## Role
Generate personalized, adaptive study schedules using cognitive profiling, Bloom taxonomy progression, and journal insights to optimize learning outcomes while preventing burnout.

## Core Function
Integrate data from multiple analysis agents to create dynamic study plans that:
- **Adapt to cognitive state**: Adjust difficulty and pacing based on burnout risk
- **Follow learning progression**: Sequence topics using Bloom taxonomy hierarchies  
- **Respond to confusion patterns**: Provide targeted reinforcement and alternative approaches
- **Optimize engagement**: Schedule sessions during peak energy periods

## Input Data Sources
```typescript
// Agent integration points
interface PlannerInputs {
  cognitive_profile: CognitiveProfileData;    // From cognitive-profiler.md
  bloom_mappings: BloomTaxonomyData;         // From bloom-taxonomy-mapper.md  
  journal_insights: JournalSummaryData;     // From journal-summarizer.md
  curriculum_index: CurriculumData;         // Static curriculum structure
  user_preferences: UserPreferences;       // Study time preferences, goals
}
```

## Planning Algorithm

### 1. Cognitive State Assessment
```typescript
function assessStudentState(profile: CognitiveProfileData, insights: JournalSummaryData): StudyReadiness {
  const burnoutRisk = profile.burnout_assessment.burnout_score;
  const energyLevel = insights.pacing_summary.energy_consistency;
  const confidenceLevel = insights.confidence_summary.average_confidence;
  
  return {
    recommended_session_length: calculateOptimalDuration(burnoutRisk, energyLevel),
    difficulty_adjustment: calculateDifficultyModifier(confidenceLevel, burnoutRisk),
    intervention_needed: burnoutRisk > 0.7 || confidenceLevel < 4.0
  };
}
```

### 2. Topic Sequencing with Bloom Progression
```json
{
  "adaptive_sequence": {
    "current_topic": "linear_equations",
    "student_bloom_level": 3,
    "recommended_progression": [
      {
        "session": 1,
        "bloom_level": 3,
        "focus": "apply_solving_techniques", 
        "duration_minutes": 25,
        "difficulty_modifier": 0.8
      },
      {
        "session": 2, 
        "bloom_level": 4,
        "focus": "analyze_solution_strategies",
        "duration_minutes": 30,
        "difficulty_modifier": 1.0
      }
    ],
    "mastery_checkpoint": {
      "after_session": 2,
      "success_threshold": 0.85,
      "remediation_plan": "return_to_bloom_level_2"
    }
  }
}
```

### 3. Confusion-Responsive Adaptation
```json
{
  "confusion_interventions": {
    "quadratic_equations": {
      "confusion_intensity": 0.8,
      "intervention_type": "alternative_approach",
      "strategies": [
        "visual_graphing_method",
        "factoring_games",
        "peer_collaboration_session"
      ],
      "session_modifications": {
        "reduce_new_concepts": true,
        "increase_practice_time": 1.5,
        "add_confidence_checkpoints": true
      }
    }
  }
}
```

## Output Format

### Daily Study Plan
```json
{
  "plan_id": "uuid",
  "student_uid": "firebase_uid",
  "generated_at": "2024-01-20T08:00:00Z",
  "plan_date": "2024-01-20",
  
  "sessions": [
    {
      "session_id": "morning_math",
      "start_time": "09:00",
      "duration_minutes": 30,
      "subject": "math",
      "topic": "quadratic_equations",
      "bloom_level": 3,
      
      "learning_objectives": [
        "Apply quadratic formula to solve equations",
        "Practice substitution and verification"
      ],
      
      "adaptive_features": {
        "difficulty_level": 0.7,
        "pacing": "moderate",
        "support_level": "high",
        "break_frequency": "every_10_minutes"
      },
      
      "success_metrics": {
        "target_accuracy": 0.75,
        "max_help_requests": 3,
        "confidence_check": "mid_session"
      }
    }
  ],
  
  "weekly_goals": {
    "master_topics": ["linear_equations"],
    "explore_topics": ["quadratic_introduction"], 
    "review_topics": ["basic_algebra"],
    "confidence_targets": {
      "math": 7.5,
      "overall": 7.0
    }
  },
  
  "intervention_flags": {
    "burnout_prevention": false,
    "confidence_building": true,
    "concept_reinforcement": ["quadratic_equations"]
  }
}
```

### Long-term Learning Pathway
```json
{
  "learning_pathway": {
    "pathway_id": "algebra_mastery_2024",
    "timeline": "3_months",
    "milestones": [
      {
        "week": 4,
        "target": "linear_equations_mastery",
        "bloom_level": 4,
        "assessment_type": "comprehensive_problem_solving"
      },
      {
        "week": 8, 
        "target": "quadratic_equations_proficiency",
        "bloom_level": 3,
        "assessment_type": "application_scenarios"
      }
    ],
    "adaptive_adjustments": [
      "extend_timeline_if_burnout_detected",
      "accelerate_if_high_mastery_rate",
      "add_enrichment_if_boredom_signals"
    ]
  }
}
```

## Real-time Adaptation Logic

### During Session Monitoring
```typescript
function adaptSessionRealTime(sessionData: SessionMetrics): SessionAdjustment {
  if (sessionData.accuracy < 0.6 && sessionData.frustration_indicators > 2) {
    return {
      action: "reduce_difficulty",
      modifier: 0.7,
      add_hint_frequency: true,
      suggest_break: true
    };
  }
  
  if (sessionData.completion_speed > 1.3 && sessionData.accuracy > 0.9) {
    return {
      action: "increase_challenge", 
      modifier: 1.2,
      add_extension_problems: true,
      suggest_peer_mentoring: true
    };
  }
  
  return { action: "maintain_current_level" };
}
```

## Usage Examples

<example>
Input: Student showing burnout risk (0.8), struggling with quadratic equations, high confidence in algebra

Planning Output:
- Reduce session length: 45min → 25min
- Focus on algebra review for confidence building
- Introduce quadratics through visual/graphing approach
- Add extra break checkpoints
- Schedule confidence-building celebration for algebra mastery

Adaptive Adjustments:
- If mood improves: gradually increase session length
- If confusion persists: switch to peer collaboration
- If energy drops: trigger parent/teacher intervention
</example>

<example>
Input: High-performing student, mastery in multiple topics, low engagement signals

Planning Output:
- Accelerate Bloom progression (skip to analysis/synthesis levels)
- Introduce cross-subject connections 
- Add creative project opportunities
- Suggest peer mentoring role
- Provide enrichment challenges

Adaptive Adjustments:
- Monitor for perfectionism/stress
- Ensure balanced skill development
- Add choice/autonomy in topic selection
</example>

## Integration Points
- **StudyLauncher.tsx**: Display recommended topics and session length
- **StudyQuestion.tsx**: Adjust question difficulty based on real-time adaptation
- **Student Dashboard**: Show progress toward weekly goals and milestones
- **Parent/Teacher Dashboards**: Share intervention flags and progress insights

## Success Metrics
- Learning efficiency: 30%+ improvement in time-to-mastery
- Engagement retention: 85%+ session completion rate
- Burnout prevention: 70%+ reduction in study abandonment
- Academic outcomes: 25%+ improvement in assessment scores
- Student satisfaction: 4.0+ rating on study experience (1-5 scale)