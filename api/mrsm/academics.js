// MRSM Academic API Endpoint
// Provides academic data for MARA+ platform integration

const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Function to load MRSM curriculum data from ingested files
function loadMRSMCurriculumData() {
  const curriculumDir = path.join(__dirname, '../..', 'output', 'mrsm_ingestion');
  const programs = ['premier', 'bitara', 'ulul-albab', 'igcse', 'teknikal'];
  const curriculumData = {};

  programs.forEach(program => {
    try {
      const filePath = path.join(curriculumDir, `${program}_curriculum.json`);
      if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        curriculumData[program] = data;
      }
    } catch (error) {
      console.warn(`⚠️ Could not load ${program} curriculum:`, error.message);
    }
  });

  return curriculumData;
}

// Load real MRSM curriculum data
const mrsmCurriculumData = loadMRSMCurriculumData();

// Transform curriculum data for API response format
function transformCurriculumToSubjects(curriculumData) {
  const subjects = [];
  
  Object.entries(curriculumData).forEach(([programKey, program]) => {
    program.subjects.forEach((subject, index) => {
      subjects.push({
        id: `${programKey}_${subject.toLowerCase().replace(/\s+/g, '_')}_${index}`,
        subject: subject,
        program: program.name,
        program_key: programKey,
        level: program.academic_levels ? program.academic_levels[0] : 'Secondary',
        learning_focus: program.learning_focus,
        curriculum_alignment: program.curriculum_alignment,
        modules: program.modules || [],
        specializations: program.specializations || []
      });
    });
  });

  return subjects;
}

// Real MRSM academic data structure
const realAcademicData = {
  subjects: transformCurriculumToSubjects(mrsmCurriculumData),
  programs: mrsmCurriculumData,
  metadata: {
    source: 'MRSM Official Curriculum Data',
    last_updated: new Date().toISOString(),
    version: '2.0.0',
    academic_year: '2024/2025',
    total_programs: Object.keys(mrsmCurriculumData).length,
    ingestion_date: mrsmCurriculumData.premier?.scraped_at || new Date().toISOString()
  }
};

// GET /api/mrsm/academics - Get all academic data
router.get('/', (req, res) => {
  try {
    console.log('📚 MRSM Academic API called - returning real curriculum data');
    res.json({
      success: true,
      data: realAcademicData,
      message: 'Academic data retrieved successfully (real curriculum data)'
    });
  } catch (error) {
    console.error('❌ Error in MRSM academics API:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to retrieve academic data'
    });
  }
});

// GET /api/mrsm/academics/programs - Get all program data
router.get('/programs', (req, res) => {
  try {
    console.log('📚 MRSM Programs API called');
    res.json({
      success: true,
      data: realAcademicData.programs,
      message: 'Program data retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Error in MRSM programs API:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// GET /api/mrsm/academics/programs/:program - Get specific program data
router.get('/programs/:program', (req, res) => {
  try {
    const { program } = req.params;
    const programData = realAcademicData.programs[program];
    
    if (!programData) {
      return res.status(404).json({
        success: false,
        error: 'Program not found',
        message: `Program '${program}' not available`
      });
    }
    
    res.json({
      success: true,
      data: programData,
      message: `${program} program data retrieved successfully`
    });
  } catch (error) {
    console.error('❌ Error in program-specific API:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// GET /api/mrsm/academics/:subject - Get specific subject data
router.get('/subjects/:subject', (req, res) => {
  try {
    const { subject } = req.params;
    const subjectData = realAcademicData.subjects.filter(
      s => s.subject.toLowerCase().includes(subject.toLowerCase())
    );
    
    if (subjectData.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Subject not found',
        message: `Subject '${subject}' not available`
      });
    }
    
    res.json({
      success: true,
      data: subjectData,
      message: `${subject} data retrieved successfully`
    });
  } catch (error) {
    console.error('❌ Error in subject-specific API:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// POST /api/mrsm/academics/sync - Sync with MRSM curriculum ingestor
router.post('/sync', async (req, res) => {
  try {
    console.log('🔄 MRSM sync requested - running curriculum ingestor');
    
    const MRSMIngestor = require('../../functions/mrsm-curriculum-ingestor-lite');
    const ingestor = new MRSMIngestor();
    
    // Run the ingestion process
    const results = await ingestor.run();
    
    // Reload the curriculum data
    const updatedData = loadMRSMCurriculumData();
    
    res.json({
      success: true,
      message: 'MRSM curriculum sync completed successfully',
      data: {
        programs_synced: Object.keys(results).length,
        programs: Object.keys(updatedData),
        last_sync: new Date().toISOString(),
        status: 'completed',
        qa_summary: {
          total_programs: Object.keys(results).length,
          total_subjects: Object.values(updatedData).reduce((sum, program) => sum + (program.subjects?.length || 0), 0)
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error in MRSM sync:', error);
    res.status(500).json({
      success: false,
      error: 'Sync failed',
      message: error.message
    });
  }
});

module.exports = router;