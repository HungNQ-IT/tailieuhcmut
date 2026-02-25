'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, RefreshCw, Upload } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

type Difficulty = 'easy' | 'medium' | 'hard';

interface ApiError {
  error?: string;
  details?: string;
  stdout?: string;
}

const initialProblemTemplate = `# Đề bài

Mô tả yêu cầu bài tập.

## Input

[Mô tả input]

## Output

[Mô tả output]

## Ví dụ

\`\`\`
Input:

Output:
\`\`\`
`;

export default function AdminPage() {
  const [subjectInput, setSubjectInput] = useState('');
  const [knownSubjects, setKnownSubjects] = useState<string[]>([]);
  const [chapter, setChapter] = useState(1);
  const [exercise, setExercise] = useState(1);
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [tagsInput, setTagsInput] = useState('');
  const [points, setPoints] = useState(10);
  const [timeLimit, setTimeLimit] = useState(30);
  const [problemContent, setProblemContent] = useState(initialProblemTemplate);
  const [solutionContent, setSolutionContent] = useState('');
  const [hintsContent, setHintsContent] = useState('');
  const [force, setForce] = useState(false);

  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [syncLog, setSyncLog] = useState('');

  const tags = useMemo(() => {
    return tagsInput
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
  }, [tagsInput]);

  const hints = useMemo(() => {
    return hintsContent
      .split('\n')
      .map((hint) => hint.trim())
      .filter(Boolean);
  }, [hintsContent]);

  async function loadSubjects() {
    setLoadingSubjects(true);
    try {
      const res = await fetch('/api/admin/exercises');
      const data = await res.json();
      if (!res.ok) {
        throw new Error((data as ApiError).error || 'Không thể tải danh sách môn học');
      }
      setKnownSubjects(data.subjects ?? []);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Không thể tải danh sách môn học');
    } finally {
      setLoadingSubjects(false);
    }
  }

  useEffect(() => {
    loadSubjects();
  }, []);

  async function onCreateExercise(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const response = await fetch('/api/admin/exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: subjectInput,
          chapter,
          exercise,
          title,
          difficulty,
          tags,
          points,
          timeLimit,
          content: problemContent,
          solution: solutionContent,
          hints,
          force,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error((data as ApiError).error || 'Tạo bài tập thất bại');
      }

      setSuccessMessage(`Đã tạo bài tập thành công tại ${data.path}`);
      setSolutionContent('');
      setHintsContent('');
      setForce(false);
      await loadSubjects();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Tạo bài tập thất bại');
    } finally {
      setSubmitting(false);
    }
  }

  async function onSyncExercises() {
    setSyncing(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const response = await fetch('/api/admin/exercises/sync', {
        method: 'POST',
      });
      const data = await response.json();

      if (!response.ok) {
        const payload = data as ApiError;
        throw new Error(payload.details || payload.error || 'Sync thất bại');
      }

      setSuccessMessage('Đồng bộ lên Supabase thành công');
      setSyncLog([data.stdout, data.stderr].filter(Boolean).join('\n'));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Sync thất bại');
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Web quản trị CS Hub</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Upload bài tập mới, cập nhật nội dung và đồng bộ dữ liệu lên hệ thống.
        </p>
      </div>

      {successMessage ? (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Thành công</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      ) : null}

      {errorMessage ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Lỗi</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      ) : null}

      <Tabs defaultValue="create" className="w-full">
        <TabsList>
          <TabsTrigger value="create">Tạo bài tập</TabsTrigger>
          <TabsTrigger value="sync">Đồng bộ</TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Upload bài tập mới</CardTitle>
              <CardDescription>
                Bài tập sẽ được tạo vào thư mục <code>exercises/&lt;subject&gt;/chapter-xx/bai-tap-xx</code>.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-5" onSubmit={onCreateExercise}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Môn học (slug)</Label>
                    <Input
                      id="subject"
                      value={subjectInput}
                      onChange={(event) => setSubjectInput(event.target.value)}
                      placeholder="lap-trinh-c"
                      required
                    />
                    <div className="flex flex-wrap gap-2">
                      {loadingSubjects ? (
                        <Badge variant="secondary">Đang tải môn học...</Badge>
                      ) : knownSubjects.length === 0 ? (
                        <Badge variant="secondary">Chưa có môn học nào</Badge>
                      ) : (
                        knownSubjects.map((subject) => (
                          <button
                            key={subject}
                            className="text-xs rounded-md border px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800"
                            type="button"
                            onClick={() => setSubjectInput(subject)}
                          >
                            {subject}
                          </button>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Tên bài tập</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      placeholder="Tính tổng 2 số nguyên"
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                  <div className="space-y-2">
                    <Label htmlFor="chapter">Chương</Label>
                    <Input
                      id="chapter"
                      type="number"
                      min={1}
                      value={chapter}
                      onChange={(event) => setChapter(Number(event.target.value))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="exercise">Bài số</Label>
                    <Input
                      id="exercise"
                      type="number"
                      min={1}
                      value={exercise}
                      onChange={(event) => setExercise(Number(event.target.value))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="points">Điểm</Label>
                    <Input
                      id="points"
                      type="number"
                      min={1}
                      value={points}
                      onChange={(event) => setPoints(Number(event.target.value))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timeLimit">Thời gian (phút)</Label>
                    <Input
                      id="timeLimit"
                      type="number"
                      min={1}
                      value={timeLimit}
                      onChange={(event) => setTimeLimit(Number(event.target.value))}
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Độ khó</Label>
                    <select
                      id="difficulty"
                      value={difficulty}
                      onChange={(event) => setDifficulty(event.target.value as Difficulty)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="easy">easy</option>
                      <option value="medium">medium</option>
                      <option value="hard">hard</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags (ngăn cách dấu phẩy)</Label>
                    <Input
                      id="tags"
                      value={tagsInput}
                      onChange={(event) => setTagsInput(event.target.value)}
                      placeholder="vong-lap, mang, con-tro"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="problemContent">Nội dung đề bài (Markdown)</Label>
                  <Textarea
                    id="problemContent"
                    className="min-h-[220px]"
                    value={problemContent}
                    onChange={(event) => setProblemContent(event.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="solutionContent">Lời giải (Markdown, tùy chọn)</Label>
                  <Textarea
                    id="solutionContent"
                    className="min-h-[180px]"
                    value={solutionContent}
                    onChange={(event) => setSolutionContent(event.target.value)}
                    placeholder="# Lời giải..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hintsContent">Gợi ý (mỗi dòng là 1 gợi ý)</Label>
                  <Textarea
                    id="hintsContent"
                    className="min-h-[140px]"
                    value={hintsContent}
                    onChange={(event) => setHintsContent(event.target.value)}
                    placeholder="Đọc kỹ đề bài trước khi code&#10;Tách bài toán thành từng bước"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <Checkbox
                    id="force"
                    checked={force}
                    onCheckedChange={(checked) => setForce(Boolean(checked))}
                  />
                  <Label htmlFor="force">Ghi đè nếu bài tập đã tồn tại</Label>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={submitting}>
                    <Upload className="mr-2 h-4 w-4" />
                    {submitting ? 'Đang tạo...' : 'Tạo bài tập'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sync">
          <Card>
            <CardHeader>
              <CardTitle>Đồng bộ lên Supabase</CardTitle>
              <CardDescription>
                Chạy script <code>scripts/sync-exercises.js</code> để upsert toàn bộ bài tập hiện có.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={onSyncExercises} disabled={syncing}>
                <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Đang đồng bộ...' : 'Sync ngay'}
              </Button>

              <Textarea
                readOnly
                className="min-h-[280px] font-mono text-xs"
                value={syncLog || 'Log đồng bộ sẽ hiển thị ở đây.'}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
