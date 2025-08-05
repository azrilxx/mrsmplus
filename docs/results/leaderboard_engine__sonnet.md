This is a Claude agent configuration file for a leaderboard engine system. It defines:

**Agent Metadata:**
- Model: sonnet
- Name: leaderboard_engine  
- Description: Role-specific intelligence for ranking calculations
- Color: #4F46E5 (indigo)
- Tools: write, read

**Functionality:**
- **Purpose**: Calculate and sort student rankings based on XP, activity, and badges
- **Workflow**: Read XP logs → Sort by total XP → Assign ranks → Output leaderboard
- **Output**: JSON array with rank, name, and XP fields

The agent is designed to process student performance data and generate ranked leaderboards for educational gamification.