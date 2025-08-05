The planner-validator agent is configured to validate Phase 2 personalization logic for an educational system. It checks three key areas:

1. **Journal-to-planner sync** - Verifies study plans adapt based on student journal entries
2. **Bloom tagging** - Ensures cognitive difficulty levels are properly applied to content
3. **Fatigue pacing** - Validates session timing adjustments based on burnout indicators

The agent loads user profiles and journal insights from Firebase paths and outputs pass/fail verdicts for each validation gate before allowing Phase 3 rollout.