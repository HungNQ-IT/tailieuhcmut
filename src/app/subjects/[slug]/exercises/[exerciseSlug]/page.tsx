'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { allSubjects } from '@/constants/subjects';
import { useExerciseStore } from '@/lib/store/exercise-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { 
  ChevronLeft,
  Clock, 
  Star, 
  BookOpen,
  Lightbulb,
  Code,
  Send,
  CheckCircle,
  AlertCircle,
  RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Markdown from 'react-markdown';

const difficultyConfig: Record<string, { color: string; label: string }> = {
  easy: { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', label: 'Dễ' },
  medium: { color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', label: 'Trung bình' },
  hard: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', label: 'Khó' },
};

export default function ExerciseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const exerciseSlug = params.exerciseSlug as string;
  const subject = allSubjects.find((s) => s.slug === slug);
  
  const { 
    currentExercise, 
    userProgress,
    isLoading, 
    error,
    fetchExerciseBySlug,
    fetchUserProgress,
    submitExercise,
    setCurrentExercise
  } = useExerciseStore();
  
  const [answer, setAnswer] = useState('');
  const [showSolution, setShowSolution] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (exerciseSlug) {
      fetchExerciseBySlug(exerciseSlug);
      fetchUserProgress();
    }
    
    return () => {
      setCurrentExercise(null);
    };
  }, [exerciseSlug, fetchExerciseBySlug, fetchUserProgress, setCurrentExercise]);

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

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-12">Đang tải bài tập...</div>
      </div>
    );
  }

  if (!currentExercise) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Không tìm thấy bài tập
          </h1>
          <Button onClick={() => router.push(`/subjects/${slug}/exercises`)} className="mt-4">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  const progress = userProgress.get(currentExercise.id);
  const isCompleted = progress?.status === 'completed';

  const handleSubmit = async () => {
    if (!answer.trim()) return;
    
    setSubmitting(true);
    try {
      await submitExercise(currentExercise.id, answer);
      setShowSolution(true);
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
        <Link href="/" className="hover:text-blue-600">Trang chủ</Link>
        <ChevronLeft className="w-4 h-4 rotate-180" />
        <Link href="/subjects" className="hover:text-blue-600">Môn học</Link>
        <ChevronLeft className="w-4 h-4 rotate-180" />
        <Link href={`/subjects/${slug}`} className="hover:text-blue-600">{subject.name}</Link>
        <ChevronLeft className="w-4 h-4 rotate-180" />
        <Link href={`/subjects/${slug}/exercises`} className="hover:text-blue-600">Bài tập</Link>
        <ChevronLeft className="w-4 h-4 rotate-180" />
        <span className="text-gray-900 dark:text-white">{currentExercise.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Exercise Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge 
                      className={cn(difficultyConfig[currentExercise.difficulty].color)}
                    >
                      {difficultyConfig[currentExercise.difficulty].label}
                    </Badge>
                    {isCompleted && (
                      <Badge className="bg-green-100 text-green-700">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Đã hoàn thành
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-2xl">
                    Bài tập {currentExercise.exerciseNumber}: {currentExercise.title}
                  </CardTitle>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    {currentExercise.points} điểm
                  </span>
                  {currentExercise.timeLimit && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {currentExercise.timeLimit} phút
                    </span>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert max-w-none">
                <Markdown>{currentExercise.content}</Markdown>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {currentExercise.tags.map((tag: string) => (
                  <Badge key={tag} variant="outline">{tag}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Answer Section */}
          {!isCompleted && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Nộp bài làm</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Nhập câu trả lởi hoặc code của bạn ở đây..."
                  className="min-h-[200px] font-mono"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                />
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setAnswer('')}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Xóa
                  </Button>
                  <Button 
                    onClick={handleSubmit} 
                    disabled={!answer.trim() || submitting}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {submitting ? 'Đang nộp...' : 'Nộp bài'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Solution Section */}
          {(isCompleted || showSolution) && currentExercise.solution && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Lợi giải
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose dark:prose-invert max-w-none">
                  <Markdown>{currentExercise.solution}</Markdown>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Progress Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tiến độ</CardTitle>
            </CardHeader>
            <CardContent>
              {progress ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Trạng thái</span>
                    <Badge variant={isCompleted ? 'default' : 'secondary'}>
                      {isCompleted ? 'Hoàn thành' : 'Đang làm'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Số lần thử</span>
                    <span>{progress.attempts}</span>
                  </div>
                  {progress.score && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Điểm</span>
                      <span className="font-semibold text-green-600">{progress.score}/{currentExercise.points}</span>
                    </div>
                  )}
                  {progress.timeSpent && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Thờ gian</span>
                      <span>{progress.timeSpent} phút</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-4">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                  Chưa bắt đầu làm bài
                </div>
              )}
            </CardContent>
          </Card>

          {/* Hints Card */}
          {currentExercise.hints.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  Gợi ý
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!showHints ? (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setShowHints(true)}
                  >
                    Hiển thị gợi ý
                  </Button>
                ) : (
                  <div className="space-y-3">
                    {currentExercise.hints.map((hint: string, index: number) => (
                      <div key={index} className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                          <span className="font-semibold">Gợi ý {index + 1}:</span> {hint}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <Card>
            <CardContent className="p-4">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => router.push(`/subjects/${slug}/exercises`)}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Xem danh sách bài tập
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
