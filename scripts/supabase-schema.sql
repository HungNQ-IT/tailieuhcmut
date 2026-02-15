-- ============================================================================
-- SCHEMA CHO HỆ THỐNG BÀI TẬP CS HUB
-- ============================================================================
-- Chạy script này trong Supabase SQL Editor

-- ============================================================================
-- 1. BẢNG EXERCISES
-- ============================================================================

-- Tạo enum cho độ khó
CREATE TYPE exercise_difficulty AS ENUM ('easy', 'medium', 'hard');

-- Tạo bảng exercises
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  subject_slug TEXT NOT NULL,
  chapter_number INTEGER NOT NULL,
  exercise_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  difficulty exercise_difficulty DEFAULT 'medium',
  content TEXT NOT NULL,
  solution TEXT,
  hints TEXT[],
  tags TEXT[],
  points INTEGER DEFAULT 10,
  time_limit INTEGER, -- phút
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  is_published BOOLEAN DEFAULT false,
  
  -- Ràng buộc unique cho subject + chapter + exercise
  UNIQUE(subject_slug, chapter_number, exercise_number)
);

-- Index để tìm kiếm nhanh
CREATE INDEX idx_exercises_subject ON exercises(subject_slug);
CREATE INDEX idx_exercises_chapter ON exercises(subject_slug, chapter_number);
CREATE INDEX idx_exercises_difficulty ON exercises(difficulty);
CREATE INDEX idx_exercises_tags ON exercises USING GIN(tags);
CREATE INDEX idx_exercises_published ON exercises(is_published) WHERE is_published = true;

-- Full text search index
ALTER TABLE exercises ADD COLUMN search_vector tsvector 
  GENERATED ALWAYS AS (
    to_tsvector('vietnamese', coalesce(title, '') || ' ' || coalesce(content, ''))
  ) STORED;
CREATE INDEX idx_exercises_search ON exercises USING GIN(search_vector);

-- ============================================================================
-- 2. BẢNG USER PROGRESS (Tiến độ làm bài của user)
-- ============================================================================

CREATE TABLE user_exercise_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'abandoned')),
  attempts INTEGER DEFAULT 0,
  score INTEGER,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  time_spent INTEGER, -- phút
  last_answer TEXT,
  is_correct BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, exercise_id)
);

CREATE INDEX idx_user_progress_user ON user_exercise_progress(user_id);
CREATE INDEX idx_user_progress_exercise ON user_exercise_progress(exercise_id);
CREATE INDEX idx_user_progress_status ON user_exercise_progress(status);

-- ============================================================================
-- 3. BẢNG SUBMISSIONS (Bài nộp của user)
-- ============================================================================

CREATE TABLE exercise_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  content TEXT NOT NULL, -- Code hoặc câu trả lởi
  language TEXT, -- Ngôn ngữ lập trình (nếu là code)
  is_correct BOOLEAN,
  score INTEGER,
  feedback TEXT,
  execution_time INTEGER, -- ms
  memory_used INTEGER, -- KB
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Metadata cho coding exercise
  test_cases_passed INTEGER,
  test_cases_total INTEGER
);

CREATE INDEX idx_submissions_user ON exercise_submissions(user_id);
CREATE INDEX idx_submissions_exercise ON exercise_submissions(exercise_id);
CREATE INDEX idx_submissions_created ON exercise_submissions(created_at DESC);

-- ============================================================================
-- 4. BẢNG CHAPTERS (Thông tin chương)
-- ============================================================================

CREATE TABLE chapters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_slug TEXT NOT NULL,
  chapter_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  estimated_time INTEGER, -- phút
  order_index INTEGER,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(subject_slug, chapter_number)
);

CREATE INDEX idx_chapters_subject ON chapters(subject_slug);

-- ============================================================================
-- 5. BẢNG TEST CASES (Cho bài tập lập trình)
-- ============================================================================

CREATE TABLE exercise_test_cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  input TEXT NOT NULL,
  expected_output TEXT NOT NULL,
  is_hidden BOOLEAN DEFAULT false,
  weight INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_test_cases_exercise ON exercise_test_cases(exercise_id);

-- ============================================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS cho tất cả bảng
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_exercise_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_test_cases ENABLE ROW LEVEL SECURITY;

-- Policies cho exercises
CREATE POLICY "Exercises are viewable by everyone" 
  ON exercises FOR SELECT 
  USING (is_published = true);

CREATE POLICY "Only admins can insert exercises" 
  ON exercises FOR INSERT 
  TO authenticated 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Only admins can update exercises" 
  ON exercises FOR UPDATE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Only admins can delete exercises" 
  ON exercises FOR DELETE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policies cho user progress (chỉ user xem được progress của mình)
CREATE POLICY "Users can view own progress" 
  ON user_exercise_progress FOR SELECT 
  TO authenticated 
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own progress" 
  ON user_exercise_progress FOR INSERT 
  TO authenticated 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own progress" 
  ON user_exercise_progress FOR UPDATE 
  TO authenticated 
  USING (user_id = auth.uid());

-- Policies cho submissions
CREATE POLICY "Users can view own submissions" 
  ON exercise_submissions FOR SELECT 
  TO authenticated 
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own submissions" 
  ON exercise_submissions FOR INSERT 
  TO authenticated 
  WITH CHECK (user_id = auth.uid());

-- Admins xem tất cả
CREATE POLICY "Admins can view all submissions" 
  ON exercise_submissions FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policies cho chapters
CREATE POLICY "Chapters are viewable by everyone" 
  ON chapters FOR SELECT 
  USING (is_published = true);

CREATE POLICY "Only admins can modify chapters" 
  ON chapters FOR ALL 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policies cho test cases
CREATE POLICY "Test cases are viewable by everyone" 
  ON exercise_test_cases FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM exercises 
      WHERE id = exercise_id AND is_published = true
    )
  );

CREATE POLICY "Only admins can modify test cases" 
  ON exercise_test_cases FOR ALL 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- 7. FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function tự động cập nhật updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers cho updated_at
CREATE TRIGGER update_exercises_updated_at 
  BEFORE UPDATE ON exercises 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chapters_updated_at 
  BEFORE UPDATE ON chapters 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at 
  BEFORE UPDATE ON user_exercise_progress 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Function tự động tạo profile khi user đăng ký
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$ language 'plpgsql' security definer;

-- Trigger tạo profile tự động
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 8. STORAGE BUCKET CHO ASSETS
-- ============================================================================

-- Tạo bucket cho exercise assets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('exercise-assets', 'exercise-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Policy cho storage
CREATE POLICY "Exercise assets are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'exercise-assets');

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

CREATE POLICY "Only admins can delete exercise assets"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'exercise-assets' AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- 9. SAMPLE DATA (Tùy chọn - xóa nếu không cần)
-- ============================================================================

-- Thêm một số chương mẫu
INSERT INTO chapters (subject_slug, chapter_number, title, description, is_published)
VALUES
  ('lap-trinh-c', 1, 'Giới thiệu C/C++', 'Cài đặt, cú pháp cơ bản', true),
  ('lap-trinh-c', 2, 'Biến và kiểu dữ liệu', 'Khai báo, phạm vi, ép kiểu', true),
  ('lap-trinh-c', 3, 'Cấu trúc điều khiển', 'If/else, switch, vòng lặp', true),
  ('ctdl-gt', 1, 'Độ phức tạp thuật toán', 'Big O, phân tích', true)
ON CONFLICT (subject_slug, chapter_number) DO NOTHING;

-- ============================================================================
-- HOÀN THÀNH!
-- ============================================================================
