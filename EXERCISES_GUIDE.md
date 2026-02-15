# Hướng Dẫn Đẩy Bài Tập Lên Hệ Thống CS Hub

## 📋 Tổng Quan

Hệ thống CS Hub sử dụng **Git-based workflow** để quản lý bài tập. Đây là cách tối ưu nhất để:
- Version control cho bài tập
- Dễ dàng rollback nếu có lỗi
- Hỗ trợ collaborative editing
- Không cần viết code phức tạp

## 🗂️ Cấu Trúc Thư Mục

```
exercises/
├── lap-trinh-c/                    # Tên môn học (slug)
│   ├── chapter-01/                 # Chương 1
│   │   ├── bai-tap-01/            # Bài tập 1
│   │   │   ├── README.md          # Đề bài
│   │   │   ├── solution.md        # Lợi giải (optional)
│   │   │   ├── hints.md           # Gợi ý (optional)
│   │   │   └── assets/            # Hình ảnh, file đính kèm
│   │   ├── bai-tap-02/
│   │   └── ...
│   ├── chapter-02/
│   └── ...
├── ctdl-gt/
└── ...
```

## 🚀 Cách Thêm Bài Tập Mới

### Phương Pháp 1: Sử Dụng Script (Khuyến nghị)

```bash
# Thêm bài tập mới
npm run add:exercise

# Hoặc trực tiếp
node scripts/add-exercise.js --subject lap-trinh-c --chapter 1 --exercise 5
```

### Phương Pháp 2: Thủ Công

#### Bước 1: Tạo thư mục
```bash
cd exercises/lap-trinh-c/chapter-01
mkdir bai-tap-05
cd bai-tap-05
```

#### Bước 2: Tạo file đề bài (README.md)

```markdown
---
id: "lập-trình-c-ch01-bt05"
subject: "Lập trình C"
chapter: 1
exercise: 5
difficulty: "medium"  # easy | medium | hard
tags: ["vòng lặp", "for", "while"]
points: 10
time_limit: 30  # phút
---

# Bài tập 5: Tính giai thừa

## Đề bài

Viết chương trình tính giai thừa của một số nguyên dương n (n ≤ 20).

## Yêu cầu

1. Sử dụng vòng lặp `for` hoặc `while`
2. Kiểm tra đầu vào hợp lệ (n > 0 và n ≤ 20)
3. In kết quả ra màn hình

## Input

- Một số nguyên dương n

## Output

- Giá trị n!

## Ví dụ

```
Input: 5
Output: 120
```

## Lưu ý

- 0! = 1
- Số lớn có thể vượt quá kiểu int, nên dùng `long long`
```

#### Bước 3: Tạo file lợi giải (solution.md) - Tùy chọn

```markdown
# Lợi giải

## Phân tích

Giai thừa n! = 1 × 2 × 3 × ... × n

## Code mẫu

```c
#include <stdio.h>

int main() {
    int n;
    printf("Nhap n: ");
    scanf("%d", &n);
    
    if (n < 0 || n > 20) {
        printf("n khong hop le!");
        return 1;
    }
    
    long long factorial = 1;
    for (int i = 1; i <= n; i++) {
        factorial *= i;
    }
    
    printf("%d! = %lld", n, factorial);
    return 0;
}
```

## Giải thích

1. **Khai báo**: Dùng `long long` để tránh overflow
2. **Vòng lặp**: Nhân dồn từ 1 đến n
3. **Edge case**: Xử lý 0! = 1 và giới hạn n

## Độ phức tạp

- **Time**: O(n)
- **Space**: O(1)
```

#### Bước 4: Tạo file gợi ý (hints.md) - Tùy chọn

```markdown
# Gợi ý

## Gợi ý 1
> Sử dụng vòng lặp `for` với biến chạy từ 1 đến n.

## Gợi ý 2
> Khởi tạo biến kết quả = 1, sau đó nhân dồn trong vòng lặp.

## Gợi ý 3
> Chú ý kiểu dữ liệu - giai thừa tăng rất nhanh!
```

## 🔧 Cấu Hình Supabase

### Bước 1: Tạo bảng trong Supabase

```sql
-- Bảng exercises
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  subject_slug TEXT NOT NULL REFERENCES subjects(slug),
  chapter_number INTEGER NOT NULL,
  exercise_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  content TEXT NOT NULL,
  solution TEXT,
  hints TEXT[],
  tags TEXT[],
  points INTEGER DEFAULT 10,
  time_limit INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  is_published BOOLEAN DEFAULT false
);

-- Index để tìm kiếm nhanh
CREATE INDEX idx_exercises_subject ON exercises(subject_slug);
CREATE INDEX idx_exercises_chapter ON exercises(subject_slug, chapter_number);

-- RLS (Row Level Security)
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

-- Cho phép đọc tất cả bài tập đã publish
CREATE POLICY "Exercises are viewable by everyone" 
  ON exercises FOR SELECT 
  USING (is_published = true);

-- Chỉ admin mới có thể thêm/sửa/xóa
CREATE POLICY "Only admins can modify exercises" 
  ON exercises FOR ALL 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### Bước 2: Cấu hình Storage cho assets

```sql
-- Tạo bucket cho exercise assets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('exercise-assets', 'exercise-assets', true);

-- Policy cho phép đọc public
CREATE POLICY "Exercise assets are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'exercise-assets');

-- Policy cho phép admin upload
CREATE POLICY "Only admins can upload exercise assets"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'exercise-assets' AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

## 📤 Cách Deploy

### Phương pháp: Git Push

1. **Commit bài tập mới**:
```bash
git add exercises/lap-trinh-c/chapter-01/bai-tap-05/
git commit -m "Add: Bài tập tính giai thừa - Chương 1"
git push origin main
```

2. **Build sẽ tự động**:
   - Vercel/GitHub Actions sẽ parse các file markdown
   - Sync vào Supabase
   - Build static site

### Script tự động sync

```javascript
// scripts/sync-exercises.js
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function syncExercises() {
  const exercisesDir = path.join(process.cwd(), 'exercises');
  
  // Duyệt qua tất cả môn học
  const subjects = fs.readdirSync(exercisesDir);
  
  for (const subject of subjects) {
    const subjectPath = path.join(exercisesDir, subject);
    if (!fs.statSync(subjectPath).isDirectory()) continue;
    
    // Duyệt qua các chương
    const chapters = fs.readdirSync(subjectPath);
    
    for (const chapter of chapters) {
      const chapterPath = path.join(subjectPath, chapter);
      if (!fs.statSync(chapterPath).isDirectory()) continue;
      
      // Duyệt qua các bài tập
      const exercises = fs.readdirSync(chapterPath);
      
      for (const exercise of exercises) {
        const exercisePath = path.join(chapterPath, exercise);
        const readmePath = path.join(exercisePath, 'README.md');
        
        if (!fs.existsSync(readmePath)) continue;
        
        // Parse markdown
        const content = fs.readFileSync(readmePath, 'utf8');
        const { data, content: body } = matter(content);
        
        // Upsert vào Supabase
        await supabase.from('exercises').upsert({
          slug: data.id,
          subject_slug: subject,
          chapter_number: data.chapter,
          exercise_number: data.exercise,
          title: data.title || body.split('\n')[0].replace('# ', ''),
          difficulty: data.difficulty,
          content: body,
          tags: data.tags,
          points: data.points,
          time_limit: data.time_limit,
          is_published: true
        }, {
          onConflict: 'slug'
        });
      }
    }
  }
  
  console.log('✅ Sync completed!');
}

syncExercises().catch(console.error);
```

## 💡 Best Practices

### 1. Đặt tên file chuẩn
- Slug môn học: `lap-trinh-c`, `ctdl-gt` (không dấu, không khoảng trắng)
- Chương: `chapter-01`, `chapter-02` (luôn 2 chữ số)
- Bài tập: `bai-tap-01`, `bai-tap-02` (luôn 2 chữ số)

### 2. Viết đề bài rõ ràng
- Có input/output mẫu cụ thể
- Giải thích constraints (giới hạn)
- Cung cấp test cases (nếu có)

### 3. Phân loại độ khó
- **easy**: 5-10 phút, kiến thức cơ bản
- **medium**: 15-30 phút, cần tư duy
- **hard**: 30+ phút, thuật toán phức tạp

### 4. Sử dụng tags hiệu quả
```yaml
tags: ["mảng", "vòng lặp", "đệ quy", "struct", "con trỏ"]
```

## 🎨 Template cho các loại bài tập

### Bài tập lập trình
Xem ví dụ trên (tính giai thừa)

### Bài tập trắc nghiệm

```markdown
---
type: "multiple_choice"
options:
  - A: "Đáp án A"
  - B: "Đáp án B"
  - C: "Đáp án C"
  - D: "Đáp án D"
correct: "B"
---

# Câu hỏi trắc nghiệm

Kết quả của đoạn code sau là gì?

```c
int x = 5;
printf("%d", ++x + x++);
```
```

### Bài tập điền khuyết

```markdown
---
type: "fill_blank"
blanks:
  - position: 1
    answer: "int"
  - position: 2
    answer: "return"
---

# Điền vào chỗ trống

Hoàn thiện hàm tính tổng:

```c
___ sum(int a, int b) {
    ___ a + b;
}
```
```

## 🔍 Troubleshooting

### Lỗi: Không sync được lên Supabase

**Kiểm tra**:
1. Supabase URL và API key đúng chưa?
2. Bảng `exercises` đã tạo chưa?
3. RLS policies đã cấu hình đúng chưa?

### Lỗi: File không hiển thị trên website

**Kiểm tra**:
1. `is_published = true`?
2. Subject slug có khớp với constants không?
3. Frontmatter có đúng format YAML?

### Lỗi: Assets không load được

**Kiểm tra**:
1. File đã upload lên storage chưa?
2. Public URL đúng chưa?
3. CORS đã cấu hình cho bucket?

## 📚 Tài nguyên tham khảo

- [Supabase Docs](https://supabase.com/docs)
- [Gray-matter](https://github.com/jonschlinkert/gray-matter) - Parse frontmatter
- [YAML Syntax](https://docs.ansible.com/ansible/latest/reference_appendices/YAMLSyntax.html)

## 🤝 Đóng góp

1. Fork repository
2. Thêm bài tập vào đúng thư mục
3. Tạo Pull Request với mô tả rõ ràng
4. Admin review và merge

---

**Lưu ý**: Hệ thống này được thiết kế để đơn giản và không cần viết nhiều code. Chỉ cần viết Markdown và push lên Git là xong!
