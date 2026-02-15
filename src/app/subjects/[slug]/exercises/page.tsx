'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { allSubjects } from '@/constants/subjects';
import { useExerciseStore } from '@/lib/store/exercise-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  BookOpen, 
  Clock, 
  Star, 
  Trophy, 
  ChevronRight,
  Play,
  CheckCircle,
  Circle,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const difficultyConfig: Record<string, { color: string; label: string }> = {
  easy: { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', label: 'Dễ' },
  medium: { color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', label: 'Trung bình' },
  hard: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', label: 'Khó' },
};

const statusConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  not_started: { icon: Circle, color: 'text-gray-400', label: 'Chưa làm' },
  in_progress: { icon: AlertCircle, color: 'text-yellow-500', label: 'Đang làm' },
  completed: { icon: CheckCircle, color: 'text-green-500', label: 'Đã hoàn thành' },
};

export default function SubjectExercisesPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const subject = allSubjects.find((s) => s.slug === slug);
  
  const { 
    exercises, 
    chapters, 
    userProgress, 
    isLoading, 
    fetchExercises, 
    fetchChapters,
    fetchUserProgress 
  } = useExerciseStore();
  
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);

  useEffect(() => {
    if (slug) {
      fetchChapters(slug);
      fetchExercises(slug);
      fetchUserProgress();
    }
  }, [slug, fetchChapters, fetchExercises, fetchUserProgress]);

  if (!subject) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Không tìm thấy môn học
          </h1>
        </div>
      </div>
    );
  }

  const filteredExercises = selectedChapter
    ? exercises.filter((e: { chapterNumber: number }) => e.chapterNumber === selectedChapter)
    : exercises;

  const groupedExercises = filteredExercises.reduce((acc: Record<number, any[]>, exercise: { chapterNumber: number }) => {
    const chapter = exercise.chapterNumber;
    if (!acc[chapter]) acc[chapter] = [];
    acc[chapter].push(exercise);
    return acc;
  }, {} as Record<number, any[]>);

  const getExerciseStatus = (exerciseId: string) => {
    return userProgress.get(exerciseId)?.status || 'not_started';
  };

  const getChapterProgress = (chapterNum: number) => {
    const chapterExercises = exercises.filter((e: { chapterNumber: number }) => e.chapterNumber === chapterNum);
    const completedCount = chapterExercises.filter((e: { id: string }) => 
      getExerciseStatus(e.id) === 'completed'
    ).length;
    return {
      completed: completedCount,
      total: chapterExercises.length,
      percentage: chapterExercises.length > 0 
        ? Math.round((completedCount / chapterExercises.length) * 100) 
        : 0
    };
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
        <Link href="/" className="hover:text-blue-600">Trang chủ</Link>
        <ChevronRight className="w-4 h-4" />
        <Link href="/subjects" className="hover:text-blue-600">Môn học</Link>
        <ChevronRight className="w-4 h-4" />
        <Link href={`/subjects/${slug}`} className="hover:text-blue-600">{subject.name}</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 dark:text-white">Bài tập</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className={cn(
            'w-16 h-16 rounded-2xl flex items-center justify-center',
            subject.color
          )}>
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Bài tập {subject.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {exercises.length} bài tập • {chapters.length} chương
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Chapter List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Danh sách chương</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-400px)]">
                <div className="p-4 space-y-2">
                  <button
                    onClick={() => setSelectedChapter(null)}
                    className={cn(
                      'w-full text-left p-3 rounded-lg transition-colors',
                      selectedChapter === null
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Tất cả bài tập</span>
                      <Badge variant="secondary">{exercises.length}</Badge>
                    </div>
                  </button>

                  {chapters.map((chapter: { id: string; chapterNumber: number; title: string }) => {
                    const progress = getChapterProgress(chapter.chapterNumber);
                    return (
                      <button
                        key={chapter.id}
                        onClick={() => setSelectedChapter(chapter.chapterNumber)}
                        className={cn(
                          'w-full text-left p-3 rounded-lg transition-colors',
                          selectedChapter === chapter.chapterNumber
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                        )}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">
                            Chương {chapter.chapterNumber}
                          </span>
                          <span className="text-xs text-gray-500">
                            {progress.completed}/{progress.total}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 truncate">
                          {chapter.title}
                        </p>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                          <div
                            className="bg-blue-600 h-1.5 rounded-full transition-all"
                            style={{ width: `${progress.percentage}%` }}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="text-center py-12">Đang tải bài tập...</div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedExercises).map((entry) => {
                const [chapterNum, chapterExercises] = entry as [string, any[]];
                const chapter = chapters.find((c: { chapterNumber: number }) => c.chapterNumber === parseInt(chapterNum));
                return (
                  <div key={chapterNum}>
                    <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                      Chương {chapterNum}: {chapter?.title || `Chương ${chapterNum}`}
                    </h2>
                    
                    <div className="grid gap-4">
                      {chapterExercises.map((exercise: { id: string; slug: string; exerciseNumber: number; title: string; difficulty: string; points: number; timeLimit?: number; tags: string[] }) => {
                        const status = getExerciseStatus(exercise.id);
                        const StatusIcon = statusConfig[status].icon;
                        
                        return (
                          <Card 
                            key={exercise.id} 
                            className="hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => router.push(`/subjects/${slug}/exercises/${exercise.slug}`)}
                          >
                            <CardContent className="p-6">
                              <div className="flex items-start gap-4">
                                <div className="flex-shrink-0">
                                  <StatusIcon className={cn('w-6 h-6', statusConfig[status].color)} />
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between mb-2">
                                    <div>
                                      <h3 className="font-semibold text-gray-900 dark:text-white">
                                        Bài tập {exercise.exerciseNumber}: {exercise.title}
                                      </h3>
                                      <div className="flex items-center gap-2 mt-1">
                                        <Badge 
                                          variant="secondary" 
                                          className={cn('text-xs', difficultyConfig[exercise.difficulty].color)}
                                        >
                                          {difficultyConfig[exercise.difficulty].label}
                                        </Badge>
                                        <span className="text-xs text-gray-500 flex items-center gap-1">
                                          <Star className="w-3 h-3" />
                                          {exercise.points} điểm
                                        </span>
                                        {exercise.timeLimit && (
                                          <span className="text-xs text-gray-500 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {exercise.timeLimit} phút
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    <Button size="sm" variant="ghost">
                                      <Play className="w-4 h-4" />
                                    </Button>
                                  </div>

                                  <div className="flex flex-wrap gap-1">
                                    {exercise.tags.map((tag) => (
                                      <Badge key={tag} variant="outline" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {exercises.length === 0 && (
                <div className="text-center py-12">
                  <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Chưa có bài tập
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Bài tập cho môn học này sẽ sớm được cập nhật.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
