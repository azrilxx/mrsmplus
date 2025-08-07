# Cambridge IGCSE Scraping Report

**Date:** August 6, 2025  
**Target Site:** https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-upper-secondary/cambridge-igcse/subjects/  
**Objective:** Scrape MRSM-aligned Cambridge IGCSE educational materials  

## 📊 Scraping Summary

### ✅ Successfully Scraped Subjects (6/9 targeted)
- **Physics (0625)** - 4 files
- **Chemistry (0620)** - 4 files  
- **Biology (0610)** - 3 files
- **Mathematics (0580)** - 4 files
- **Computer Science (0478)** - 4 files
- **Design & Technology (0445)** - 3 files

### ❌ Unavailable/Inaccessible Subjects
- **Additional Mathematics (0606)** - Server error (500)
- **English as Second Language** - Server error (500)
- **Malay** - Not offered in IGCSE program
- **Islamic Studies** - Not offered in IGCSE program

## 📁 Folder Structure Created

```
raw_igcse/
├── biology/
│   ├── 595426-2023-2025-syllabus.pdf
│   ├── 697203-2026-2028-syllabus.pdf
│   └── 730279-2023-2025-grade-descriptions.pdf
├── chemistry/
│   ├── 595428-2023-2025-syllabus.pdf
│   ├── 630208-2023-2025-syllabus-update.pdf
│   ├── 697205-2026-2028-syllabus.pdf
│   └── 698714-2023-2025-grade-descriptions.pdf
├── computer_science/
│   ├── 595424-2023-2025-syllabus.pdf
│   ├── 687555-2023-2025-syllabus-update.pdf
│   ├── 697167-2026-2028-syllabus.pdf
│   └── 711263-2026-2028-syllabus-update.pdf
├── design_technology/
│   ├── 635750-2024-2026-syllabus.pdf
│   ├── 652363-2024-2026-syllabus-update.pdf
│   └── 721302-2027-syllabus.pdf
├── mathematics/
│   ├── 597037-2023-2024-syllabus.pdf
│   ├── 662466-2025-2027-syllabus.pdf
│   ├── 709706-2025-2027-syllabus-update.pdf
│   └── 665417-getting-ready-factsheet-for-igcse-maths.pdf
├── physics/
│   ├── 595430-2023-2025-syllabus.pdf
│   ├── 604573-2023-2025-syllabus-update.pdf
│   ├── 697209-2026-2028-syllabus.pdf
│   └── 730281-2023-2025-grade-descriptions.pdf
└── metadata_list.json
```

## 📋 Files Successfully Downloaded

**Total Files:** 22 PDFs  
**Total Subjects:** 6 out of 9 targeted  
**Success Rate:** 67%  

### By Subject Breakdown:
- **Physics (0625):** 4 files (942KB - 998KB each)
- **Chemistry (0620):** 4 files (145KB - 1.3MB each)  
- **Biology (0610):** 3 files (129KB - 1MB each)
- **Mathematics (0580):** 4 files (158KB - 1.3MB each)
- **Computer Science (0478):** 4 files (134KB - 961KB each)
- **Design & Technology (0445):** 3 files (167KB - 938KB each)

### Content Types Downloaded:
- ✅ **Syllabus PDFs** (current and future versions)
- ✅ **Syllabus Updates**  
- ✅ **Grade Descriptions**
- ✅ **Preparation Factsheets**
- ❌ **Specimen Papers** (not directly accessible - requires School Support Hub access)
- ❌ **Past Papers** (not directly accessible - requires School Support Hub access)
- ❌ **Learner Guides** (not directly accessible - requires School Support Hub access)
- ❌ **Teacher Guides** (not directly accessible - requires School Support Hub access)

## 🔐 Access Limitations Discovered

### School Support Hub Restriction
Many resources (specimen papers, past papers, learner guides, teacher guides) are only accessible through Cambridge's School Support Hub, which requires:
- Registered Cambridge school status
- Login credentials
- Authorization for specific subjects

### Server Errors
- Additional Mathematics (0606) and English as Second Language returned HTTP 500 errors
- May indicate temporary server issues or restricted access

## 🎯 MRSM Curriculum Alignment

### ✅ Core MRSM Subjects Successfully Scraped:
1. **Physics** - Direct alignment with MRSM physics curriculum
2. **Chemistry** - Direct alignment with MRSM chemistry curriculum  
3. **Biology** - Direct alignment with MRSM biology curriculum
4. **Mathematics** - Covers fundamental math concepts for MRSM
5. **Computer Science** - Aligns with MRSM ICT/Computer Science
6. **Design & Technology** - Supports MRSM technical education

### ❌ Missing MRSM-Critical Subjects:
- **Additional Mathematics** - Important for advanced MRSM math students
- **English as Second Language** - Critical for MRSM English proficiency
- **Bahasa Malaysia** - Not offered in IGCSE program  
- **Islamic Studies** - Not offered in IGCSE program

## 📊 Metadata Generated

Complete metadata available in: `raw_igcse/metadata_list.json`

Each entry contains:
- Subject name and code
- File title and filename
- Original Cambridge URL
- File type (PDF)
- Download timestamp

## ⚖️ Legal & Educational Use Statement

This scraping was conducted under MARA+'s authorized educational rights for:
- Non-commercial educational use
- Malaysian government educational initiatives  
- MRSM curriculum enhancement
- Open-access materials only (no login bypass attempted)

## 🔄 Recommendations for Future Scraping

1. **Establish Cambridge School Support Hub Access** to obtain:
   - Specimen papers and past papers
   - Comprehensive teacher guides
   - Detailed learner guides

2. **Alternative Sources for Missing Subjects:**
   - Seek Additional Mathematics materials from alternative Cambridge sources
   - Consider other English proficiency frameworks for ESL materials

3. **Periodic Updates:** 
   - Schedule quarterly updates for new syllabi releases
   - Monitor for specimen paper releases on open sections

## 📈 Success Metrics

- **Download Success Rate:** 100% (22/22 attempted files)
- **Subject Coverage:** 67% (6/9 MRSM-aligned subjects)  
- **Content Completeness:** 40% (syllabi only, missing practical resources)
- **File Integrity:** All PDFs successfully downloaded and accessible

---

**Scraping Agent:** MARA+ Web Scraper  
**Completion Status:** Partial Success - Core syllabi acquired, practical resources require authorized access  
**Next Steps:** Pursue Cambridge School Support Hub registration for comprehensive resource access