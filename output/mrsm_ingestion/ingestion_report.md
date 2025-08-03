# MRSM Curriculum Ingestion Report
Generated: 2025-08-02T23:41:24.430Z

## Summary
- Total Programs: 5
- Successful Ingestions: 0
- Failed Ingestions: 5
- QA Passed: 5
- QA Failed: 0

## Program Details

### Premier Program (premier)
**Status:** ✅ PASSED
**Subjects:** 14
**Modules:** 6
**Learning Focus:** Comprehensive academic foundation with emphasis on excellence
**Curriculum Alignment:** Malaysian National Curriculum (KSSM)
**Specializations:** Science Stream, Arts Stream
**Syllabus PDF:** [Link](https://www.mara.gov.my/documents/premier-curriculum.pdf)
**Top Subjects:**
- Mathematics
- Additional Mathematics
- Physics
- Chemistry
- Biology

### Bitara Program (bitara)
**Status:** ✅ PASSED
**Subjects:** 14
**Modules:** 8
**Learning Focus:** High IQ, talent-based learning with accelerated curriculum
**Curriculum Alignment:** Accelerated National Curriculum with enrichment components
**Specializations:** STEM Excellence, Humanities Excellence, Creative Arts
**Syllabus PDF:** [Link](https://www.mara.gov.my/documents/bitara-curriculum.pdf)
**Top Subjects:**
- Advanced Mathematics
- Higher Physics
- Advanced Chemistry
- Molecular Biology
- English Literature

### Ulul Albab Program (ulul-albab)
**Status:** ✅ PASSED
**Subjects:** 14
**Modules:** 8
**Learning Focus:** Tahfiz-integrated STEM education with Islamic values
**Curriculum Alignment:** Islamic-integrated National Curriculum with Tahfiz specialization
**Specializations:** Tahfiz & Science, Islamic Studies & Technology, Da'wah & Communication
**Syllabus PDF:** [Link](https://www.mara.gov.my/documents/ulul-albab-curriculum.pdf)
**Top Subjects:**
- Quran & Tajweed
- Tahfiz Al-Quran
- Islamic Studies
- Arabic Language
- Hadith Studies

### IGCSE Program (igcse)
**Status:** ✅ PASSED
**Subjects:** 14
**Modules:** 8
**Learning Focus:** Cambridge IGCSE curriculum with STEM integration and international standards
**Curriculum Alignment:** Cambridge International IGCSE Curriculum
**Specializations:** Pure Sciences, Applied Sciences, Business & Economics, Humanities
**Syllabus PDF:** [Link](https://www.mara.gov.my/documents/igcse-curriculum.pdf)
**Top Subjects:**
- IGCSE Mathematics
- IGCSE Additional Mathematics
- IGCSE Physics
- IGCSE Chemistry
- IGCSE Biology

### Teknikal Program (teknikal)
**Status:** ✅ PASSED
**Subjects:** 14
**Modules:** 8
**Learning Focus:** Engineering-oriented education with hands-on technical skills development
**Curriculum Alignment:** Technical Education Curriculum aligned with industry standards
**Specializations:** Mechanical Engineering, Electrical Engineering, Civil Engineering, Computer Engineering, Chemical Engineering
**Syllabus PDF:** [Link](https://www.mara.gov.my/documents/teknikal-curriculum.pdf)
**Top Subjects:**
- Engineering Mathematics
- Technical Drawing & CAD
- Electronics & Electrical Systems
- Mechanical Systems
- Computer Programming

## Firestore Structure

The curriculum data is uploaded to Firestore using this structure:
```
/curriculum/mrsm/{program_type}/curriculum
```

Each program document contains:
- Program metadata (name, description, focus)
- Complete subject list
- Learning modules
- Curriculum alignment information
- Assessment methods
- Career pathways
- Graduation requirements
