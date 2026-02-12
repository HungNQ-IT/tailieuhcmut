import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@cshub.com',
      password: adminPassword,
      name: 'Admin',
      role: 'admin',
    },
  });
  console.log('Created admin user:', admin.email);

  // Create demo user
  const userPassword = await bcrypt.hash('user123', 10);
  const user = await prisma.user.create({
    data: {
      email: 'user@cshub.com',
      password: userPassword,
      name: 'Nguyen Van A',
      role: 'user',
    },
  });
  console.log('Created demo user:', user.email);

  // Create CS subjects
  const csSubjects = [
    {
      slug: 'lap-trinh-c',
      name: 'Lập trình C / C++',
      category: 'cs' as const,
      description: 'Ngôn ngữ lập trình cơ bản và nâng cao cho sinh viên kỹ thuật',
      icon: 'Code',
      color: 'bg-blue-500',
    },
    {
      slug: 'ctdl-gt',
      name: 'Cấu trúc dữ liệu & Giải thuật',
      category: 'cs' as const,
      description: 'Các cấu trúc dữ liệu và thuật toán cơ bản',
      icon: 'GitBranch',
      color: 'bg-green-500',
    },
    {
      slug: 'he-dieu-hanh',
      name: 'Hệ điều hành',
      category: 'cs' as const,
      description: 'Nguyên lý và thiết kế hệ điều hành',
      icon: 'Monitor',
      color: 'bg-purple-500',
    },
    {
      slug: 'co-so-du-lieu',
      name: 'Cơ sở dữ liệu',
      category: 'cs' as const,
      description: 'Thiết kế và quản trị cơ sở dữ liệu',
      icon: 'Database',
      color: 'bg-orange-500',
    },
  ];

  for (const subject of csSubjects) {
    const created = await prisma.subject.create({
      data: subject,
    });
    console.log('Created subject:', created.name);

    // Create chapters for each subject
    for (let i = 1; i <= 4; i++) {
      await prisma.chapter.create({
        data: {
          title: `Chương ${i}`,
          order: i,
          subjectId: created.id,
        },
      });
    }
  }

  // Create general subjects
  const generalSubjects = [
    {
      slug: 'giai-tich',
      name: 'Giải tích 1 & 2',
      category: 'general' as const,
      description: 'Giải tích đại cương',
      icon: 'FunctionSquare',
      color: 'bg-red-500',
    },
    {
      slug: 'dai-so-tuyen-tinh',
      name: 'Đại số tuyến tính',
      category: 'general' as const,
      description: 'Đại số và không gian vector',
      icon: 'Grid3X3',
      color: 'bg-blue-600',
    },
  ];

  for (const subject of generalSubjects) {
    const created = await prisma.subject.create({
      data: subject,
    });
    console.log('Created subject:', created.name);

    for (let i = 1; i <= 4; i++) {
      await prisma.chapter.create({
        data: {
          title: `Chương ${i}`,
          order: i,
          subjectId: created.id,
        },
      });
    }
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
