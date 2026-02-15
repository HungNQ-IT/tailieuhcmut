#!/usr/bin/env node

/**
 * Script tạo bài tập mới cho CS Hub
 * Usage: node scripts/add-exercise.js --subject lap-trinh-c --chapter 1 --exercise 5
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim()));
  });
}

function parseArgs() {
  const args = process.argv.slice(2);
  const params = {};
  
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2);
      const value = args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true;
      params[key] = value;
      if (value !== true) i++;
    }
  }
  
  return params;
}

function formatNumber(num) {
  return num.toString().padStart(2, '0');
}

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-');
}

async function main() {
  console.log('🚀 CS Hub - Thêm bài tập mới\n');
  
  const args = parseArgs();
  
  // Lấy thông tin môn học
  let subject = args.subject;
  if (!subject) {
    const subjectsDir = path.join(process.cwd(), 'exercises');
    const subjects = fs.existsSync(subjectsDir) 
      ? fs.readdirSync(subjectsDir).filter(f => fs.statSync(path.join(subjectsDir, f)).isDirectory())
      : [];
    
    console.log('📚 Danh sách môn học:');
    subjects.forEach((s, i) => console.log(`  ${i + 1}. ${s}`));
    
    subject = await ask('\nChọn môn học (nhập tên hoặc số thứ tự): ');
    
    // Nếu nhập số, chuyển thành tên
    const index = parseInt(subject) - 1;
    if (index >= 0 && index < subjects.length) {
      subject = subjects[index];
    }
  }
  
  // Lấy chương
  let chapter = args.chapter;
  if (!chapter) {
    chapter = await ask('📖 Nhập số chương: ');
  }
  chapter = parseInt(chapter);
  
  // Lấy bài tập
  let exercise = args.exercise;
  if (!exercise) {
    // Tự động tìm số bài tập tiếp theo
    const chapterPath = path.join(process.cwd(), 'exercises', subject, `chapter-${formatNumber(chapter)}`);
    let nextExercise = 1;
    
    if (fs.existsSync(chapterPath)) {
      const exercises = fs.readdirSync(chapterPath)
        .filter(f => f.startsWith('bai-tap-'))
        .map(f => parseInt(f.replace('bai-tap-', '')))
        .filter(n => !isNaN(n));
      
      if (exercises.length > 0) {
        nextExercise = Math.max(...exercises) + 1;
      }
    }
    
    exercise = await ask(`📝 Nhập số bài tập (mặc định: ${nextExercise}): `);
    exercise = exercise || nextExercise;
  }
  exercise = parseInt(exercise);
  
  // Lấy tên bài tập
  const title = await ask('✏️  Nhập tên bài tập: ');
  
  // Lấy độ khó
  let difficulty = await ask('📊 Độ khó (easy/medium/hard) [medium]: ');
  difficulty = difficulty || 'medium';
  
  // Lấy tags
  const tagsInput = await ask('🏷️  Tags (cách nhau bằng dấu phẩy): ');
  const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
  
  // Lấy điểm
  let points = await ask('⭐ Số điểm [10]: ');
  points = parseInt(points) || 10;
  
  // Tạo đường dẫn
  const exerciseDir = path.join(
    process.cwd(),
    'exercises',
    subject,
    `chapter-${formatNumber(chapter)}`,
    `bai-tap-${formatNumber(exercise)}`
  );
  
  // Tạo thư mục
  fs.mkdirSync(exerciseDir, { recursive: true });
  
  // Tạo README.md
  const readmeContent = `---
id: "${subject}-ch${formatNumber(chapter)}-bt${formatNumber(exercise)}"
subject: "${subject}"
chapter: ${chapter}
exercise: ${exercise}
title: "${title}"
difficulty: "${difficulty}"
tags: [${tags.map(t => `"${t}"`).join(', ')}]
points: ${points}
time_limit: 30
---

# Bài tập ${exercise}: ${title}

## Đề bài

[Viết mô tả bài tập ở đây]

## Yêu cầu

1. [Yêu cầu 1]
2. [Yêu cầu 2]
3. [Yêu cầu 3]

## Input

[Mô tả input]

## Output

[Mô tả output]

## Ví dụ

\`\`\`
Input: 
[Input mẫu]

Output:
[Output mẫu]
\`\`\`

## Lưu ý

[Các lưu ý đặc biệt]
`;

  fs.writeFileSync(path.join(exerciseDir, 'README.md'), readmeContent);
  
  // Tạo solution.md
  const solutionContent = `# Lợi giải

## Phân tích

[Phân tích bài toán]

## Code mẫu

\`\`\`c
[Code ở đây]
\`\`\`

## Giải thích

[Giải thích chi tiết]

## Độ phức tạp

- **Time**: O(?)
- **Space**: O(?)
`;

  fs.writeFileSync(path.join(exerciseDir, 'solution.md'), solutionContent);
  
  // Tạo hints.md
  const hintsContent = `# Gợi ý

## Gợi ý 1
> [Gợi ý đầu tiên]

## Gợi ý 2
> [Gợi ý thứ hai]

## Gợi ý 3
> [Gợi ý cuối cùng]
`;

  fs.writeFileSync(path.join(exerciseDir, 'hints.md'), hintsContent);
  
  // Tạo assets folder
  fs.mkdirSync(path.join(exerciseDir, 'assets'), { recursive: true });
  
  console.log('\n✅ Đã tạo bài tập thành công!');
  console.log(`📁 Vị trí: ${exerciseDir}`);
  console.log('\n📋 Các file đã tạo:');
  console.log('  - README.md (Đề bài)');
  console.log('  - solution.md (Lợi giải)');
  console.log('  - hints.md (Gợi ý)');
  console.log('  - assets/ (Thư mục hình ảnh)');
  console.log('\n💡 Tiếp theo:');
  console.log('  1. Sửa file README.md để thêm nội dung đề bài');
  console.log('  2. Sửa file solution.md để thêm lợi giải');
  console.log('  3. Chạy: npm run sync:exercises để đẩy lên Supabase');
  
  rl.close();
}

main().catch(err => {
  console.error('❌ Lỗi:', err);
  process.exit(1);
});
