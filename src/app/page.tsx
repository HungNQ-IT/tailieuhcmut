'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { csSubjects, generalSubjects } from '@/constants/subjects';
import * as Icons from 'lucide-react';
import { BookOpen, Users, FileText, ArrowRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function HomePage() {
  const [showSubjects, setShowSubjects] = useState(false);
  const subjectsRef = useRef<HTMLDivElement>(null);

  const scrollToSubjects = () => {
    setShowSubjects(true);
    subjectsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const stats = [
    { icon: BookOpen, label: 'Môn học', value: '17+' },
    { icon: FileText, label: 'Tài liệu', value: '500+' },
    { icon: Users, label: 'Sinh viên', value: '1000+' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 sm:px-6 lg:px-8">
        {/* Background Pattern */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-bl from-blue-100/50 to-transparent rounded-full blur-3xl" />
          <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-cyan-100/50 to-transparent rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm">
            🎓 Dành cho sinh viên HCMUT
          </Badge>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            Tài Liệu{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
              Bách Khoa
            </span>
            <br />
            CS Hub
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Kho tài liệu Computer Science và môn đại cương chất lượng cao,
            được biên soạn dành riêng cho sinh viên Trường Đại học Bách Khoa TP.HCM
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button
              size="lg"
              className="w-full sm:w-auto text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600"
              onClick={scrollToSubjects}
            >
              🚀 Bắt đầu học
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto text-lg px-8 py-6"
              asChild
            >
              <Link href="/subjects">
                Xem tất cả môn học
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="text-center">
                  <div className="flex justify-center mb-2">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* Scroll Indicator */}
      <div className="relative">
        <button
          onClick={scrollToSubjects}
          className="absolute -top-16 left-1/2 -translate-x-1/2 animate-bounce cursor-pointer hover:text-blue-600 transition-colors"
        >
          <ChevronDown className="w-8 h-8 text-gray-400 hover:text-blue-600" />
        </button>
      </div>

      {/* Subjects Section */}
      <section
        ref={subjectsRef}
        className={cn(
          'px-4 sm:px-6 lg:px-8 transition-all duration-500 overflow-hidden',
          showSubjects ? 'opacity-100 py-20 max-h-[5000px]' : 'opacity-0 py-0 max-h-0'
        )}
      >
        <div className="max-w-7xl mx-auto">
          {/* CS Subjects */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1 h-8 bg-blue-600 rounded-full" />
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Computer Science
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {csSubjects.map((subject) => {
                const Icon = (Icons as any)[subject.icon] || Icons.BookOpen;
                return (
                  <Link
                    key={subject.id}
                    href={`/subjects/${subject.slug}`}
                    className="group bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700"
                  >
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
                        subject.color
                      )}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {subject.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {subject.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* General Subjects */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1 h-8 bg-green-600 rounded-full" />
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Môn đại cương
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {generalSubjects.map((subject) => {
                const Icon = (Icons as any)[subject.icon] || Icons.BookOpen;
                return (
                  <Link
                    key={subject.id}
                    href={`/subjects/${subject.slug}`}
                    className="group bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700"
                  >
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
                        subject.color
                      )}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                          {subject.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {subject.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
