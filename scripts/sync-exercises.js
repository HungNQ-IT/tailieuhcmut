#!/usr/bin/env node

/**
 * Script đồng bộ bài tập từ local lên Supabase
 * Usage: node scripts/sync-exercises.js
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// Check if running in Node environment
const isNode = typeof process !== 'undefined' && process.versions && process.versions.node;

let supabase;
if (isNode) {
  const { createClient } = require('@supabase/supabase-js');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Thiếu biến môi trường:');
    console.error('  - NEXT_PUBLIC_SUPABASE_URL');
    console.error('  - SUPABASE_SERVICE_ROLE_KEY');
    console.error('\n💡 Tạo file .env.local với nội dung:');
    console.error('NEXT_PUBLIC_SUPABASE_URL=your_url');
    console.error('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
    process.exit(1);
  }
  
  supabase = createClient(supabaseUrl, supabaseServiceKey);
}

async function syncExercises() {
  console.log('🔄 Đang đồng bộ bài tập...\n');
  
  const exercisesDir = path.join(process.cwd(), 'exercises');
  
  if (!fs.existsSync(exercisesDir)) {
    console.error('❌ Không tìm thấy thư mục exercises/');
    return;
  }
  
  let syncedCount = 0;
  let errorCount = 0;
  
  // Duyệt qua tất cả môn học
  const subjects = fs.readdirSync(exercisesDir);
  
  for (const subject of subjects) {
    const subjectPath = path.join(exercisesDir, subject);
    if (!fs.statSync(subjectPath).isDirectory()) continue;
    
    console.log(`📚 Môn học: ${subject}`);
    
    // Duyệt qua các chương
    const chapters = fs.readdirSync(subjectPath);
    
    for (const chapter of chapters) {
      const chapterPath = path.join(subjectPath, chapter);
      if (!fs.statSync(chapterPath).isDirectory()) continue;
      
      const chapterMatch = chapter.match(/chapter-(\d+)/);
      if (!chapterMatch) continue;
      
      const chapterNum = parseInt(chapterMatch[1]);
      
      // Duyệt qua các bài tập
      const exercises = fs.readdirSync(chapterPath);
      
      for (const exercise of exercises) {
        const exercisePath = path.join(chapterPath, exercise);
        if (!fs.statSync(exercisePath).isDirectory()) continue;
        
        const exerciseMatch = exercise.match(/bai-tap-(\d+)/);
        if (!exerciseMatch) continue;
        
        const exerciseNum = parseInt(exerciseMatch[1]);
        const readmePath = path.join(exercisePath, 'README.md');
        
        if (!fs.existsSync(readmePath)) {
          console.log(`  ⚠️  Bỏ qua ${chapter}/${exercise} - không có README.md`);
          continue;
        }
        
        try {
          // Parse markdown
          const content = fs.readFileSync(readmePath, 'utf8');
          const { data, content: body } = matter(content);
          
          // Đọc solution nếu có
          const solutionPath = path.join(exercisePath, 'solution.md');
          let solution = null;
          if (fs.existsSync(solutionPath)) {
            solution = fs.readFileSync(solutionPath, 'utf8');
          }
          
          // Đọc hints nếu có
          const hintsPath = path.join(exercisePath, 'hints.md');
          let hints = [];
          if (fs.existsSync(hintsPath)) {
            const hintsContent = fs.readFileSync(hintsPath, 'utf8');
            // Parse gợi ý từ markdown
            hints = hintsContent
              .split('\n')
              .filter(line => line.startsWith('>'))
              .map(line => line.replace(/^>\s*/, '').trim());
          }
          
          // Chuẩn bị dữ liệu
          const exerciseData = {
            slug: data.id || `${subject}-ch${String(chapterNum).padStart(2, '0')}-bt${String(exerciseNum).padStart(2, '0')}`,
            subject_slug: subject,
            chapter_number: chapterNum,
            exercise_number: exerciseNum,
            title: data.title || body.split('\n')[0]?.replace('# ', '') || `Bài tập ${exerciseNum}`,
            difficulty: data.difficulty || 'medium',
            content: body,
            solution: solution,
            hints: hints.length > 0 ? hints : null,
            tags: data.tags || [],
            points: data.points || 10,
            time_limit: data.time_limit || 30,
            is_published: true,
            updated_at: new Date().toISOString()
          };
          
          if (isNode && supabase) {
            // Upsert vào Supabase
            const { error } = await supabase
              .from('exercises')
              .upsert(exerciseData, {
                onConflict: 'slug'
              });
            
            if (error) {
              console.log(`  ❌ Lỗi ${chapter}/${exercise}: ${error.message}`);
              errorCount++;
            } else {
              console.log(`  ✅ Đã sync: ${chapter}/${exercise} - ${exerciseData.title}`);
              syncedCount++;
            }
          } else {
            // Chỉ log nếu không có supabase (dry run)
            console.log(`  📝 [DRY RUN] ${chapter}/${exercise} - ${exerciseData.title}`);
            syncedCount++;
          }
        } catch (err) {
          console.log(`  ❌ Lỗi parse ${chapter}/${exercise}: ${err.message}`);
          errorCount++;
        }
      }
    }
    
    console.log('');
  }
  
  console.log('📊 Kết quả:');
  console.log(`  ✅ Đã đồng bộ: ${syncedCount} bài tập`);
  console.log(`  ❌ Lỗi: ${errorCount} bài tập`);
  
  if (errorCount === 0) {
    console.log('\n🎉 Hoàn thành!');
  } else {
    console.log('\n⚠️  Có lỗi xảy ra, vui lòng kiểm tra lại.');
    process.exit(1);
  }
}

// Export cho sử dụng như module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { syncExercises };
}

// Chạy nếu được gọi trực tiếp
if (require.main === module) {
  syncExercises().catch(err => {
    console.error('❌ Lỗi:', err);
    process.exit(1);
  });
}
