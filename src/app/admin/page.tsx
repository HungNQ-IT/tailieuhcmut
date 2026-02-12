'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore } from '@/lib/store';
// import { redirect } from 'next/navigation';
import {
  Users,
  BookOpen,
  FileText,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  MoreVertical,
  Plus,
} from 'lucide-react';

// Mock stats data
const stats = [
  {
    title: 'Tổng ngườ dùng',
    value: '1,234',
    change: '+12%',
    trend: 'up',
    icon: Users,
    color: 'bg-blue-500',
  },
  {
    title: 'Môn học',
    value: '17',
    change: '+2',
    trend: 'up',
    icon: BookOpen,
    color: 'bg-green-500',
  },
  {
    title: 'Tài liệu',
    value: '456',
    change: '+28',
    trend: 'up',
    icon: FileText,
    color: 'bg-purple-500',
  },
  {
    title: 'Tin nhắn',
    value: '89',
    change: '-5%',
    trend: 'down',
    icon: MessageSquare,
    color: 'bg-orange-500',
  },
];

// Mock recent users
const recentUsers = [
  { id: 1, name: 'Nguyễn Văn A', email: 'nguyenvana@example.com', role: 'user', joined: '2 giờ trước' },
  { id: 2, name: 'Trần Thị B', email: 'tranthib@example.com', role: 'user', joined: '5 giờ trước' },
  { id: 3, name: 'Lê Văn C', email: 'levanc@example.com', role: 'admin', joined: '1 ngày trước' },
  { id: 4, name: 'Phạm Thị D', email: 'phamthid@example.com', role: 'user', joined: '2 ngày trước' },
];

// Mock recent documents
const recentDocuments = [
  { id: 1, title: 'Slide Giải tích 1 - Chương 1', subject: 'Giải tích', size: '2.5 MB', uploaded: '1 giờ trước' },
  { id: 2, title: 'Bài tập CTDL - Tuần 3', subject: 'Cấu trúc dữ liệu', size: '1.2 MB', uploaded: '3 giờ trước' },
  { id: 3, title: 'Đề thi Hệ điều hành 2023', subject: 'Hệ điều hành', size: '500 KB', uploaded: '5 giờ trước' },
];

// Mock support tickets
const supportTickets = [
  { id: 1, title: 'Không tải được tài liệu', user: 'Nguyễn Văn A', status: 'open', created: '30 phút trước' },
  { id: 2, title: 'Yêu cầu thêm môn học', user: 'Trần Thị B', status: 'pending', created: '2 giờ trước' },
  { id: 3, title: 'Báo lỗi đăng nhập', user: 'Lê Văn C', status: 'resolved', created: '1 ngày trước' },
];

export default function AdminPage() {
  const { user } = useAuthStore();

  // In a real app, this would check for admin role
  // if (!user || user.role !== 'admin') {
  //   redirect('/');
  // }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Trang quản trị
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Quản lý hệ thống tài liệu và ngườ dùng
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;
          
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <TrendIcon
                        className={`w-4 h-4 ${
                          stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
                        }`}
                      />
                      <span
                        className={`text-sm ${
                          stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
                        }`}
                      >
                        {stat.change}
                      </span>
                      <span className="text-sm text-gray-500"> so với tháng trước</span>
                    </div>
                  </div>
                  
                  <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Management Tabs */}
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="users">Ngườ dùng</TabsTrigger>
          <TabsTrigger value="documents">Tài liệu</TabsTrigger>
          <TabsTrigger value="support">Hỗ trợ</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Danh sách ngườ dùng</CardTitle>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Thêm ngườ dùng
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Tên</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Email</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Vai trò</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Ngày tham gia</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentUsers.map((user) => (
                      <tr key={user.id} className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-3 px-4">{user.name}</td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{user.email}</td>
                        <td className="py-3 px-4">
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                            {user.role === 'admin' ? 'Admin' : 'User'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{user.joined}</td>
                        <td className="py-3 px-4 text-right">
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Tài liệu gần đây</CardTitle>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Upload tài liệu
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Tên tài liệu</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Môn học</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Kích thước</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Thờ gian</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentDocuments.map((doc) => (
                      <tr key={doc.id} className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-3 px-4">{doc.title}</td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{doc.subject}</td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{doc.size}</td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{doc.uploaded}</td>
                        <td className="py-3 px-4 text-right">
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="support">
          <Card>
            <CardHeader>
              <CardTitle>Yêu cầu hỗ trợ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Vấn đề</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Ngườ gửi</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Trạng thái</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Thờ gian</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {supportTickets.map((ticket) => (
                      <tr key={ticket.id} className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-3 px-4">{ticket.title}</td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{ticket.user}</td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              ticket.status === 'open'
                                ? 'default'
                                : ticket.status === 'pending'
                                ? 'secondary'
                                : 'outline'
                            }
                          >
                            {ticket.status === 'open' && 'Mở'}
                            {ticket.status === 'pending' && 'Đang xử lý'}
                            {ticket.status === 'resolved' && 'Đã giải quyết'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{ticket.created}</td>
                        <td className="py-3 px-4 text-right">
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
