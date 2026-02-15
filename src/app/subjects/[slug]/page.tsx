'use client';

import { useParams } from 'next/navigation';
import { allSubjects } from '@/constants/subjects';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import * as Icons from 'lucide-react';
import {
  BookOpen,
  FileText,
  Download,
  Video,
  Code,
  ChevronRight,
  Clock,
  Users,
  Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

// Mock chapters data
const mockChapters = [
  { id: 1, title: 'Chương 1: Giới thiệu', duration: '45 phút', documents: 3 },
  { id: 2, title: 'Chương 2: Kiến thức cơ bản', duration: '2 giờ', documents: 5 },
  { id: 3, title: 'Chương 3: Ứng dụng thực tế', duration: '1.5 giờ', documents: 4 },
  { id: 4, title: 'Chương 4: Bài tập và thực hành', duration: '3 giờ', documents: 8 },
];

// Mock documents data
const mockDocuments = [
  { id: 1, title: 'Slide bài giảng tổng hợp', type: 'pdf', size: '2.5 MB', downloads: 234 },
  { id: 2, title: 'Bài tập và đáp án', type: 'pdf', size: '1.2 MB', downloads: 189 },
  { id: 3, title: 'Source code mẫu', type: 'code', size: '500 KB', downloads: 156 },
  { id: 4, title: 'Video giảng dạy', type: 'video', size: '150 MB', downloads: 423 },
];

export default function SubjectDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const subject = allSubjects.find((s) => s.slug === slug);

  if (!subject) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Không tìm thấy môn học
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Môn học bạn tìm kiếm không tồn tại.
          </p>
        </div>
      </div>
    );
  }

  const Icon = (Icons as any)[subject.icon] || Icons.BookOpen;

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-500" />;
      case 'video':
        return <Video className="w-5 h-5 text-purple-500" />;
      case 'code':
        return <Code className="w-5 h-5 text-blue-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
        <Link href="/" className="hover:text-blue-600">Trang chủ</Link>
        <ChevronRight className="w-4 h-4" />
        <Link href="/subjects" className="hover:text-blue-600">Môn học</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 dark:text-white">{subject.name}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start gap-6">
          <div className={cn(
            'w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0',
            subject.color
          )}>
            <Icon className="w-10 h-10 text-white" />
          </div>
          
          <div className="flex-1">
            <Badge className="mb-2">
              {subject.category === 'cs' ? 'Computer Science' : 'Môn đại cương'}
            </Badge>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {subject.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {subject.description}
            </p>
            
            <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                {mockChapters.length} chương
              </span>
              <span className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                {mockDocuments.length} tài liệu
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                1.2k sinh viên
              </span>
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500" />
                4.8/5
              </span>
            </div>
          </div>
        </div>
      </div>

      <Separator className="my-8" />

      {/* Content Tabs */}
      <Tabs defaultValue="chapters" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="chapters">Danh sách chương</TabsTrigger>
          <TabsTrigger value="documents">Tài liệu</TabsTrigger>
          <TabsTrigger value="exercises">Bài tập</TabsTrigger>
          <TabsTrigger value="info">Thông tin môn học</TabsTrigger>
        </TabsList>

        <TabsContent value="chapters" className="space-y-4">
          {mockChapters.map((chapter, index) => (
            <Card key={chapter.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                        {chapter.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {chapter.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          {chapter.documents} tài liệu
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button variant="outline" size="sm">
                    Xem chi tiết
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <div className="grid gap-4">
            {mockDocuments.map((doc) => (
              <Card key={doc.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        {getFileIcon(doc.type)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {doc.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <span className="uppercase">{doc.type}</span>
                          <span>{doc.size}</span>
                          <span className="flex items-center gap-1">
                            <Download className="w-4 h-4" />
                            {doc.downloads}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Button size="sm">
                      <Download className="w-4 h-4 mr-1" />
                      Tải xuống
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin môn học</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Mô tả</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  {subject.description}
                </p>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-2">Mục tiêu môn học</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                  <li>Nắm vững kiến thức cơ bản và nâng cao</li>
                  <li>Áp dụng vào thực tế các bài toán kỹ thuật</li>
                  <li>Chuẩn bị cho các môn học chuyên ngành</li>
                  <li>Phát triển tư duy giải quyết vấn đề</li>
                </ul>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-2">Tài liệu tham khảo</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                  <li>Slide bài giảng của giảng viên</li>
                  <li>Sách giáo trình chính thức</li>
                  <li>Bài tập và đáp án chi tiết</li>
                  <li>Đề thi các năm trước</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exercises">
          <Card>
            <CardHeader>
              <CardTitle>Bài tập</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                Luyện tập với các bài tập từ cơ bản đến nâng cao.
              </p>
              <Button onClick={() => window.location.href = `/subjects/${slug}/exercises`}>
                <BookOpen className="w-4 h-4 mr-2" />
                Xem tất cả bài tập
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
