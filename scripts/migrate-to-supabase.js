/**
 * Migration Script: TradeBench JSON to Supabase
 * This script migrates all questions and study guides from JSON files to Supabase database
 * while maintaining all existing functionality and data structure
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'your-supabase-url';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Data file paths
const DATA_DIR = path.join(__dirname, '../data');
const QUESTION_FILES = [
  'questions-year-1.json',
  'questions-year-2.json', 
  'questions-year-3.json',
  'questions-year-4.json',
  'questions-massive-comprehensive.json'
];
const STUDY_GUIDE_FILES = [
  'study-guides-year-1.json',
  'study-guides-year-2.json',
  'study-guides-year-3.json', 
  'study-guides-year-4.json',
  'study-guides-massive-comprehensive.json'
];

// Utility functions
function loadJSONFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error loading ${filePath}:`, error);
    return [];
  }
}

function extractYearFromFileName(fileName) {
  const match = fileName.match(/year-(\d+)/);
  return match ? parseInt(match[1]) : null;
}

function extractYearFromData(data, fileName) {
  // Try to extract year from filename first
  const yearFromFile = extractYearFromFileName(fileName);
  if (yearFromFile) return yearFromFile;
  
  // Try to extract from data structure
  if (data.year) return data.year;
  if (Array.isArray(data) && data.length > 0 && data[0].year) return data[0].year;
  
  return 1; // Default to year 1
}

// Migration functions
async function migrateQuestions() {
  console.log('🚀 Starting questions migration...');
  
  let totalMigrated = 0;
  let errors = [];
  
  for (const fileName of QUESTION_FILES) {
    console.log(`\n📁 Processing ${fileName}...`);
    
    const filePath = path.join(DATA_DIR, fileName);
    const data = loadJSONFile(filePath);
    
    if (!Array.isArray(data) && !data.questions) {
      console.log(`⚠️  No questions found in ${fileName}`);
      continue;
    }
    
    const questions = Array.isArray(data) ? data : data.questions;
    const year = extractYearFromData(data, fileName);
    
    console.log(`📊 Found ${questions.length} questions for year ${year}`);
    
    // Process questions in batches of 50
    const batchSize = 50;
    for (let i = 0; i < questions.length; i += batchSize) {
      const batch = questions.slice(i, i + batchSize);
      
      try {
        const { data: insertedData, error } = await supabase
          .from('questions')
          .insert(
            batch.map(q => ({
              year: year,
              section: q.section || null,
              difficulty: q.difficulty || 'medium',
              question_text: q.question_text || q.question || q.text || '',
              options: q.options || q.choices || [],
              correct_answer: q.correct_answer || q.answer || '',
              explanation: q.explanation || q.explanation_text || null
            }))
          );
        
        if (error) {
          console.error(`❌ Error inserting batch ${i/batchSize + 1}:`, error);
          errors.push({ file: fileName, batch: i/batchSize + 1, error: error.message });
        } else {
          totalMigrated += batch.length;
          console.log(`✅ Batch ${i/batchSize + 1} migrated successfully`);
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`❌ Unexpected error in batch ${i/batchSize + 1}:`, error);
        errors.push({ file: fileName, batch: i/batchSize + 1, error: error.message });
      }
    }
  }
  
  console.log(`\n🎉 Questions migration complete!`);
  console.log(`📈 Total questions migrated: ${totalMigrated}`);
  console.log(`❌ Errors encountered: ${errors.length}`);
  
  if (errors.length > 0) {
    console.log('\n📋 Error details:');
    errors.forEach(err => console.log(`  - ${err.file} batch ${err.batch}: ${err.error}`));
  }
  
  return { totalMigrated, errors };
}

async function migrateStudyGuides() {
  console.log('\n🚀 Starting study guides migration...');
  
  let totalMigrated = 0;
  let errors = [];
  
  for (const fileName of STUDY_GUIDE_FILES) {
    console.log(`\n📁 Processing ${fileName}...`);
    
    const filePath = path.join(DATA_DIR, fileName);
    const data = loadJSONFile(filePath);
    
    if (!Array.isArray(data) && !data.study_guides) {
      console.log(`⚠️  No study guides found in ${fileName}`);
      continue;
    }
    
    const guides = Array.isArray(data) ? data : (data.study_guides || data);
    const year = extractYearFromData(data, fileName);
    
    console.log(`📊 Found ${guides.length} study guides for year ${year}`);
    
    // Process guides in batches of 20
    const batchSize = 20;
    for (let i = 0; i < guides.length; i += batchSize) {
      const batch = guides.slice(i, i + batchSize);
      
      try {
        const { data: insertedData, error } = await supabase
          .from('study_guides')
          .insert(
            batch.map(guide => ({
              year: year,
              section: guide.section || null,
              title: guide.title || guide.name || `Study Guide ${i + 1}`,
              content: guide.content || guide.text || guide.description || ''
            }))
          );
        
        if (error) {
          console.error(`❌ Error inserting batch ${i/batchSize + 1}:`, error);
          errors.push({ file: fileName, batch: i/batchSize + 1, error: error.message });
        } else {
          totalMigrated += batch.length;
          console.log(`✅ Batch ${i/batchSize + 1} migrated successfully`);
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`❌ Unexpected error in batch ${i/batchSize + 1}:`, error);
        errors.push({ file: fileName, batch: i/batchSize + 1, error: error.message });
      }
    }
  }
  
  console.log(`\n🎉 Study guides migration complete!`);
  console.log(`📈 Total study guides migrated: ${totalMigrated}`);
  console.log(`❌ Errors encountered: ${errors.length}`);
  
  if (errors.length > 0) {
    console.log('\n📋 Error details:');
    errors.forEach(err => console.log(`  - ${err.file} batch ${err.batch}: ${err.error}`));
  }
  
  return { totalMigrated, errors };
}

async function verifyMigration() {
  console.log('\n🔍 Verifying migration...');
  
  try {
    // Count questions by year
    const { data: questionCounts, error: qError } = await supabase
      .from('questions')
      .select('year', { count: 'exact' })
      .then(({ data, error }) => {
        if (error) throw error;
        
        // Count by year
        const counts = {};
        data.forEach(q => {
          counts[q.year] = (counts[q.year] || 0) + 1;
        });
        return { data: counts, error: null };
      });
    
    // Count study guides by year
    const { data: guideCounts, error: gError } = await supabase
      .from('study_guides')
      .select('year', { count: 'exact' })
      .then(({ data, error }) => {
        if (error) throw error;
        
        // Count by year
        const counts = {};
        data.forEach(g => {
          counts[g.year] = (counts[g.year] || 0) + 1;
        });
        return { data: counts, error: null };
      });
    
    if (qError || gError) {
      console.error('❌ Verification error:', qError || gError);
      return false;
    }
    
    console.log('\n📊 Migration Summary:');
    console.log('Questions by year:');
    Object.entries(questionCounts).forEach(([year, count]) => {
      console.log(`  Year ${year}: ${count} questions`);
    });
    
    console.log('\nStudy guides by year:');
    Object.entries(guideCounts).forEach(([year, count]) => {
      console.log(`  Year ${year}: ${count} guides`);
    });
    
    const totalQuestions = Object.values(questionCounts).reduce((a, b) => a + b, 0);
    const totalGuides = Object.values(guideCounts).reduce((a, b) => a + b, 0);
    
    console.log(`\n📈 Total: ${totalQuestions} questions, ${totalGuides} study guides`);
    console.log('✅ Migration verification complete!');
    
    return true;
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
    return false;
  }
}

// Main migration function
async function runMigration() {
  console.log('🚀 Starting TradeBench to Supabase Migration');
  console.log('=====================================');
  
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables');
    process.exit(1);
  }
  
  try {
    // Test connection
    console.log('\n🔌 Testing Supabase connection...');
    const { data, error } = await supabase.from('questions').select('count');
    if (error) {
      console.error('❌ Connection test failed:', error);
      process.exit(1);
    }
    console.log('✅ Connection successful');
    
    // Run migrations
    const questionResults = await migrateQuestions();
    const guideResults = await migrateStudyGuides();
    
    // Verify migration
    const verificationSuccess = await verifyMigration();
    
    console.log('\n🎉 Migration Complete!');
    console.log('==================');
    console.log(`Questions: ${questionResults.totalMigrated} migrated, ${questionResults.errors.length} errors`);
    console.log(`Study Guides: ${guideResults.totalMigrated} migrated, ${guideResults.errors.length} errors`);
    console.log(`Verification: ${verificationSuccess ? '✅ Passed' : '❌ Failed'}`);
    
    if (questionResults.errors.length > 0 || guideResults.errors.length > 0) {
      console.log('\n⚠️  Migration completed with errors. Check the logs above for details.');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  runMigration();
}

module.exports = {
  migrateQuestions,
  migrateStudyGuides,
  verifyMigration,
  runMigration
};
