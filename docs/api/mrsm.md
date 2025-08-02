# MRSM Academic API Documentation

## Overview
The MRSM Academic API provides access to Malaysian MRSM (Maktab Rendah Sains MARA) academic data for integration with the MARA+ educational platform.

## Base URL
```
http://localhost:3001/api/mrsm
```

## Endpoints

### 1. Health Check
**GET** `/health`

Check API server status and connectivity.

**Response:**
```json
{
  "status": "healthy",
  "service": "MARA+ API Server",
  "timestamp": "2025-08-02T13:12:37.165Z",
  "version": "1.0.0"
}
```

### 2. Get All Academic Data
**GET** `/api/mrsm/academics`

Retrieve comprehensive academic data for all subjects and levels.

**Response:**
```json
{
  "success": true,
  "data": {
    "subjects": [
      {
        "id": "math_f3",
        "subject": "Mathematics",
        "level": "Form 3",
        "chapters": ["Algebra", "Graphs", "Geometry", "Statistics", "Trigonometry"],
        "topics": {
          "Algebra": ["Linear Equations", "Quadratic Equations", "Polynomials"],
          "Graphs": ["Coordinate Geometry", "Function Graphs", "Inequalities"]
        }
      }
    ],
    "metadata": {
      "source": "MRSM Portal Mock API",
      "last_updated": "2025-08-02T13:12:37.165Z",
      "version": "1.0.0",
      "academic_year": "2024/2025"
    }
  },
  "message": "Academic data retrieved successfully (mock)"
}
```

### 3. Get Subject-Specific Data
**GET** `/api/mrsm/academics/:subject`

Retrieve data for a specific subject.

**Parameters:**
- `subject` (string): Subject name (e.g., "mathematics", "science", "english")

**Example:**
```
GET /api/mrsm/academics/mathematics
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "math_f3",
    "subject": "Mathematics",
    "level": "Form 3",
    "chapters": ["Algebra", "Graphs", "Geometry", "Statistics", "Trigonometry"],
    "topics": {
      "Algebra": ["Linear Equations", "Quadratic Equations", "Polynomials"],
      "Graphs": ["Coordinate Geometry", "Function Graphs", "Inequalities"],
      "Geometry": ["Circles", "Triangles", "Polygons"],
      "Statistics": ["Data Collection", "Measures of Central Tendency", "Probability"],
      "Trigonometry": ["Basic Ratios", "Solving Triangles", "Applications"]
    }
  },
  "message": "Mathematics data retrieved successfully"
}
```

### 4. Sync with MRSM Portal
**POST** `/api/mrsm/academics/sync`

Synchronize academic data with the live MRSM portal (placeholder implementation).

**Response:**
```json
{
  "success": true,
  "message": "Sync completed (mock)",
  "data": {
    "subjects_synced": 3,
    "last_sync": "2025-08-02T13:12:37.165Z",
    "status": "mock_implementation"
  }
}
```

## Available Subjects

### Mathematics (Form 3)
- **Chapters**: Algebra, Graphs, Geometry, Statistics, Trigonometry
- **Topics**: 15 topics across all chapters
- **ID**: `math_f3`

### Science (Form 3)
- **Chapters**: Physics, Chemistry, Biology
- **Topics**: Physics (Forces and Motion, Energy, Waves), Chemistry (Atomic Structure, Chemical Bonds, Acids and Bases), Biology (Cell Structure, Reproduction, Ecosystem)
- **ID**: `science_f3`

### English (Form 3)
- **Chapters**: Literature, Language Skills, Writing
- **Topics**: Poetry Analysis, Grammar, Essays, and more
- **ID**: `english_f3`

## Implementation Status

### ✅ Completed Features
- Mock API endpoints with realistic MRSM academic data
- Express.js server with CORS support
- Error handling and validation
- Comprehensive logging
- Health check endpoint

### 🔄 Current Implementation
**Mock Mode**: The API currently returns structured mock data that mirrors the expected MRSM portal structure.

### 🚧 Future Enhancements

#### Option 1: Live MRSM Portal Integration
```javascript
// Planned implementation for live data fetching
async function fetchLiveMRSMData() {
  // 1. Authenticate with MRSM portal
  // 2. Use headless browser or API calls
  // 3. Parse and transform data
  // 4. Cache for performance
}
```

#### Option 2: MRSM API Integration
If MRSM provides an official API:
```javascript
const mrsmAPI = {
  baseURL: 'https://api.mrsm.edu.my',
  endpoints: {
    academics: '/v1/academics',
    subjects: '/v1/subjects/:id'
  }
}
```

## Error Handling

### Common Error Responses

**404 - Subject Not Found:**
```json
{
  "success": false,
  "error": "Subject not found",
  "message": "Subject 'biology' not available"
}
```

**500 - Internal Server Error:**
```json
{
  "success": false,
  "error": "Internal server error",
  "message": "Failed to retrieve academic data"
}
```

## Testing

### Manual Testing
```bash
# Test all endpoints
node test-api.js

# Start server
node api/server.js

# Test individual endpoints
curl http://localhost:3001/health
curl http://localhost:3001/api/mrsm/academics
curl http://localhost:3001/api/mrsm/academics/mathematics
```

### Test Results
- ✅ Health check: Working
- ✅ Academic data retrieval: Working
- ✅ Subject-specific queries: Working
- ✅ Error handling: Working

## Challenges & Solutions

### Challenge 1: MRSM Portal Access
**Issue**: No official API available for MRSM portal data
**Solution**: Implemented comprehensive mock API with realistic data structure

### Challenge 2: Data Structure Consistency
**Issue**: Unknown exact format of MRSM data
**Solution**: Created flexible, extensible data structure based on Malaysian education system

### Challenge 3: Authentication
**Issue**: MRSM portal may require authentication
**Planned Solution**: Implement session management and token-based authentication when live integration is needed

## Integration Notes

### For MARA+ Platform
```javascript
// Example integration in MARA+ frontend
const fetchAcademicData = async (subject) => {
  const response = await fetch(`/api/mrsm/academics/${subject}`);
  const data = await response.json();
  return data.success ? data.data : null;
};
```

### For AI Agents
The API provides structured data that can be easily consumed by AI agents for:
- Curriculum planning
- Content generation
- Student assessment
- Learning pathway optimization

---

*Generated on: ${new Date().toISOString()}*
*MARA+ MRSM API Documentation v1.0*