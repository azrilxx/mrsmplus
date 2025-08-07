// generate_dedupe_hash_index.js
// Tool to pre-index deduplication hashes from known JSON datasets

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// List of known datasets to deduplicate against
const SOURCE_FILES = [
  './public/content/seeded/mrsm_questions_2025-07-29T14-30-00-655Z.json',
  './public/content/seeded/mrsm_questions_2025-07-29T14-30-23-451Z.json',
  './public/content/seeded/extracted_questions.json',
  './public/content/ingested/biology_clean.json',
  './public/content/ingested/math_clean.json'
];

const OUTPUT_FILE = './dedupe_hash_index.json';

function generateHash(q, a) {
  return crypto.createHash('md5').update(q + a).digest('hex').substring(0, 16);
}

const hashSet = new Set();

for (const filePath of SOURCE_FILES) {
  if (!fs.existsSync(filePath)) {
    console.warn(`File not found: ${filePath}`);
    continue;
  }

  const raw = fs.readFileSync(filePath, 'utf-8');
  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    console.error(`Failed to parse ${filePath}:`, e.message);
    continue;
  }

  for (const item of data) {
    if (!item.question || !item.answer) continue;
    const hash = generateHash(item.question, item.answer);
    hashSet.add(hash);
  }

  console.log(`✅ Processed ${filePath} - ${data.length} items`);
}

fs.writeFileSync(OUTPUT_FILE, JSON.stringify([...hashSet], null, 2));
console.log(`\n🔒 Dedupe hash index saved to ${OUTPUT_FILE}`);
console.log(`🧮 Total unique hashes: ${hashSet.size}`);
