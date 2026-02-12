'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/lib/store';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  User,
  Mail,
  Calendar,
  BookOpen,
  Download,
  Bookmark,
  Edit3,
  Camera,
} from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuthStore();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Profile Header */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white text-2xl">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                variant="secondary"
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full"
              >
                <Camera className="w-4 h-4" />
              </Button>
            </div>

            <div className="text-center md:text-left flex-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {user?.name || 'Nguyen Van A'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-3">{user?.email || 'user@example.com'}</p>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <Badge variant="secondary">{user?.role === 'admin' ? 'Admin' : 'Sinh viên'}</Badge>
                <Badge variant="outline">HCMUT</Badge>
              </div>
            </div>

            <Button className="md:self-start">
              <Edit3 className="w-4 h-4 mr-2" />
              Chỉnh sửa hồ sơ
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">12</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Môn học đã xem</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <Download className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">45</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tài liệu đã tải</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
              <Bookmark className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">8</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Đã lưu</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="info">
        <TabsList className="mb-6">
          <TabsTrigger value="info">Thông tin cá nhân</TabsTrigger>
          <TabsTrigger value="activity">Hoạt động</TabsTrigger>
          <TabsTrigger value="settings">Cài đặt</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin chi tiết</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Họ và tên</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="fullName"
                      defaultValue={user?.name || 'Nguyen Van A'}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      defaultValue={user?.email || 'user@example.com'}
                      className="pl-10"
                      disabled
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="studentId">Mã sinh viên</Label>
                  <Input id="studentId" placeholder="Nhập mã sinh viên" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="major">Ngành học</Label>
                  <Input id="major" placeholder="Nhập ngành học" />
                </div>
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button>Lưu thay đổi</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Lịch sử hoạt động</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { action: 'Đã tải tài liệu', target: 'Slide Giải tích 1', time: '2 giờ trước' },
                  { action: 'Đã xem môn học', target: 'Lập trình C', time: '5 giờ trước' },
                  { action: 'Đã lưu tài liệu', target: 'Bài tập CTDL', time: '1 ngày trước' },
                  { action: 'Đã đăng nhập', target: '', time: '2 ngày trước' },
                ].map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0"
                  >
                    <div>
                      <p className="font-medium">
                        {activity.action}
                        {activity.target && (
                          <span className="text-gray-600 dark:text-gray-400">: {activity.target}</span>
                        )}
                      </p>
                    </div>
                    <span className="text-sm text-gray-500">{activity.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Cài đặt tài khoản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                <Input id="currentPassword" type="password" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Mật khẩu mới</Label>
                <Input id="newPassword" type="password" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                <Input id="confirmPassword" type="password" />
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button>Đổi mật khẩu</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
