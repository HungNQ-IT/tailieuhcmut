import { promises as fs } from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

type Difficulty = 'easy' | 'medium' | 'hard';

interface CreateExerciseRequest {
  subject: string;
  chapter: number;
  exercise: number;
  title: string;
  difficulty?: Difficulty;
  tags?: string[];
  points?: number;
  timeLimit?: number;
  content: string;
  solution?: string;
  hints?: string[];
  force?: boolean;
}

function formatNumber(num: number): string {
  return String(num).padStart(2, '0');
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function normalizeSubject(input: string): string {
  const slug = slugify(input);
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
    throw new Error('Tên môn học không hợp lệ');
  }
  return slug;
}

function parseNumber(value: unknown, fieldName: string): number {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) {
    throw new Error(`${fieldName} phải là số dương`);
  }
  return Math.floor(num);
}

function buildReadme(params: {
  id: string;
  subject: string;
  chapter: number;
  exercise: number;
  title: string;
  difficulty: Difficulty;
  tags: string[];
  points: number;
  timeLimit: number;
  content: string;
}): string {
  const {
    id,
    subject,
    chapter,
    exercise,
    title,
    difficulty,
    tags,
    points,
    timeLimit,
    content,
  } = params;

  const safeContent = content.trim() || `# Bài tập ${exercise}: ${title}\n\n## Đề bài\n\n[Viết mô tả bài tập ở đây]`;

  return `---
id: "${id}"
subject: "${subject}"
chapter: ${chapter}
exercise: ${exercise}
title: "${title.replace(/"/g, '\\"')}"
difficulty: "${difficulty}"
tags: [${tags.map((tag) => `"${tag.replace(/"/g, '\\"')}"`).join(', ')}]
points: ${points}
time_limit: ${timeLimit}
---

${safeContent}
`;
}

function buildSolution(content?: string): string {
  if (content && content.trim()) {
    return content.trimEnd() + '\n';
  }

  return `# Lời giải

## Phân tích

[Phân tích bài toán]

## Code mẫu

\`\`\`c
[Code ở đây]
\`\`\`

## Độ phức tạp

- Time: O(?)
- Space: O(?)
`;
}

function buildHints(hints?: string[]): string {
  const sanitized = (hints ?? []).map((h) => h.trim()).filter(Boolean);
  if (sanitized.length === 0) {
    return `# Gợi ý

## Gợi ý 1
> [Gợi ý đầu tiên]
`;
  }

  return `# Gợi ý

${sanitized.map((hint, index) => `## Gợi ý ${index + 1}\n> ${hint}`).join('\n\n')}
`;
}

export async function GET() {
  try {
    const exercisesDir = path.join(process.cwd(), 'exercises');
    await fs.mkdir(exercisesDir, { recursive: true });

    const entries = await fs.readdir(exercisesDir, { withFileTypes: true });
    const subjects = entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort((a, b) => a.localeCompare(b));

    return NextResponse.json({ subjects });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Không thể đọc danh sách môn học' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<CreateExerciseRequest>;

    if (!body.subject || !body.title || !body.content) {
      return NextResponse.json(
        { error: 'Thiếu trường bắt buộc: subject, title, content' },
        { status: 400 }
      );
    }

    const subject = normalizeSubject(body.subject);
    const chapter = parseNumber(body.chapter, 'chapter');
    const exercise = parseNumber(body.exercise, 'exercise');
    const difficulty: Difficulty =
      body.difficulty === 'easy' || body.difficulty === 'hard' ? body.difficulty : 'medium';
    const tags = (body.tags ?? []).map((tag) => slugify(tag)).filter(Boolean);
    const points = parseNumber(body.points ?? 10, 'points');
    const timeLimit = parseNumber(body.timeLimit ?? 30, 'timeLimit');
    const force = Boolean(body.force);

    const chapterDir = `chapter-${formatNumber(chapter)}`;
    const exerciseDir = `bai-tap-${formatNumber(exercise)}`;
    const fullDir = path.join(process.cwd(), 'exercises', subject, chapterDir, exerciseDir);

    try {
      await fs.access(fullDir);
      if (!force) {
        return NextResponse.json(
          {
            error: 'Bài tập đã tồn tại. Bật ghi đè để thay thế.',
            exists: true,
            path: fullDir,
          },
          { status: 409 }
        );
      }
    } catch {
      // not exists
    }

    await fs.mkdir(fullDir, { recursive: true });
    await fs.mkdir(path.join(fullDir, 'assets'), { recursive: true });

    const id = `${subject}-ch${formatNumber(chapter)}-bt${formatNumber(exercise)}`;
    const readme = buildReadme({
      id,
      subject,
      chapter,
      exercise,
      title: body.title.trim(),
      difficulty,
      tags,
      points,
      timeLimit,
      content: body.content,
    });

    await Promise.all([
      fs.writeFile(path.join(fullDir, 'README.md'), readme, 'utf8'),
      fs.writeFile(path.join(fullDir, 'solution.md'), buildSolution(body.solution), 'utf8'),
      fs.writeFile(path.join(fullDir, 'hints.md'), buildHints(body.hints), 'utf8'),
    ]);

    return NextResponse.json({
      ok: true,
      subject,
      chapter,
      exercise,
      id,
      path: fullDir,
      files: ['README.md', 'solution.md', 'hints.md', 'assets/'],
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Không thể tạo bài tập' },
      { status: 500 }
    );
  }
}
