'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUIStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import {
  BookOpen,
  MessageSquare,
  User,
  Home,
  Bookmark,
  Clock,
  Download,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const menuItems = [
  { icon: Home, label: 'Trang chủ', href: '/' },
  { icon: BookOpen, label: 'Môn học', href: '/subjects' },
  { icon: Bookmark, label: 'Đã lưu', href: '/saved' },
  { icon: Clock, label: 'Xem gần đây', href: '/recent' },
  { icon: Download, label: 'Tải xuống', href: '/downloads' },
  { icon: MessageSquare, label: 'Tin nhắn', href: '/messages' },
  { icon: User, label: 'Tài khoản', href: '/profile' },
];

export default function Sidebar() {
  const [isHovered, setIsHovered] = useState(false);
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  const isExpanded = isHovered || sidebarOpen;

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-50 transition-all duration-300 ease-out',
          'lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          isExpanded ? 'w-64' : 'w-16'
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-gray-200 dark:border-gray-800">
          <Link href="/" className="flex items-center gap-3 px-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <span
              className={cn(
                'font-bold text-lg text-gray-900 dark:text-white whitespace-nowrap overflow-hidden transition-all duration-300',
                isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0 lg:opacity-0 lg:w-0'
              )}
            >
              CS Hub
            </span>
          </Link>
        </div>

        {/* Toggle Button (Desktop) */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={cn(
            'absolute -right-3 top-20 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-blue-700 transition-colors hidden lg:flex',
            isExpanded && 'rotate-180'
          )}
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Navigation */}
        <nav className="p-2 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group relative',
                  isActive
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                )}
              >
                <Icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-blue-600')} />
                <span
                  className={cn(
                    'whitespace-nowrap overflow-hidden transition-all duration-300',
                    isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0 lg:opacity-0 lg:w-0'
                  )}
                >
                  {item.label}
                </span>

                {/* Tooltip for collapsed state */}
                {!isExpanded && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-800">
          <div
            className={cn(
              'flex items-center gap-3 transition-all duration-300',
              isExpanded ? 'opacity-100' : 'opacity-0 lg:opacity-0'
            )}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex-shrink-0" />
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">Nguyen Van A</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Sinh viên</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
