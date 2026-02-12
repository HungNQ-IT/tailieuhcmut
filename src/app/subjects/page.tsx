'use client';

import Link from 'next/link';
import { csSubjects, generalSubjects } from '@/constants/subjects';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import * as Icons from 'lucide-react';
import { Search, BookOpen, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export default function SubjectsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'cs' | 'general'>('all');

  const filteredCSSubjects = csSubjects.filter(
    (s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             s.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGeneralSubjects = generalSubjects.filter(
    (s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             s.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Danh sách môn học
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Khám phá tất cả các môn học và tài liệu học tập
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Tìm kiếm môn học..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          {(['all', 'cs', 'general'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                activeFilter === filter
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              )}
            >
              {filter === 'all' && 'Tất cả'}
              {filter === 'cs' && 'Computer Science'}
              {filter === 'general' && 'Đại cương'}
            </button>
          ))}
        </div>
      </div>

      {/* CS Subjects */}
      {(activeFilter === 'all' || activeFilter === 'cs') && filteredCSSubjects.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-blue-600 rounded-full" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Computer Science
            </h2>
            <Badge variant="secondary">{filteredCSSubjects.length} môn</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCSSubjects.map((subject) => {
              const Icon = (Icons as any)[subject.icon] || Icons.BookOpen;
              return (
                <Link key={subject.id} href={`/subjects/${subject.slug}`}>
                  <Card className="group hover:shadow-lg transition-all duration-300 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          'w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0',
                          subject.color
                        )}>
                          <Icon className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {subject.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            {subject.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <BookOpen className="w-4 h-4" />
                              12 chương
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* General Subjects */}
      {(activeFilter === 'all' || activeFilter === 'general') && filteredGeneralSubjects.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-green-600 rounded-full" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Môn đại cương
            </h2>
            <Badge variant="secondary">{filteredGeneralSubjects.length} môn</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGeneralSubjects.map((subject) => {
              const Icon = (Icons as any)[subject.icon] || Icons.BookOpen;
              return (
                <Link key={subject.id} href={`/subjects/${subject.slug}`}>
                  <Card className="group hover:shadow-lg transition-all duration-300 border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          'w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0',
                          subject.color
                        )}>
                          <Icon className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                            {subject.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            {subject.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <BookOpen className="w-4 h-4" />
                              10 chương
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* No Results */}
      {filteredCSSubjects.length === 0 && filteredGeneralSubjects.length === 0 && (
        <div className="text-center py-12">
          <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Không tìm thấy môn học
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Thử tìm kiếm với từ khóa khác
          </p>
        </div>
      )}
    </div>
  );
}
