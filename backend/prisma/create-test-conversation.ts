import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Creating test conversation...');

  // Get users
  const admin = await prisma.user.findUnique({
    where: { email: 'admin@cshub.com' },
  });

  const user = await prisma.user.findUnique({
    where: { email: 'user@cshub.com' },
  });

  if (!admin || !user) {
    console.log('Users not found. Please run seed first.');
    return;
  }

  // Check if conversation already exists
  const existingConversation = await prisma.conversation.findFirst({
    where: {
      participants: {
        every: {
          userId: { in: [admin.id, user.id] },
        },
      },
    },
  });

  if (existingConversation) {
    console.log('Conversation already exists');
    return;
  }

  // Create conversation
  const conversation = await prisma.conversation.create({
    data: {
      participants: {
        create: [
          { userId: admin.id },
          { userId: user.id },
        ],
      },
    },
  });

  // Create some test messages
  await prisma.message.create({
    data: {
      content: 'Xin chào! Bạn có khỏe không?',
      conversationId: conversation.id,
      senderId: admin.id,
    },
  });

  await prisma.message.create({
    data: {
      content: 'Chào bạn! Mình khỏe, cảm ơn bạn.',
      conversationId: conversation.id,
      senderId: user.id,
    },
  });

  await prisma.message.create({
    data: {
      content: 'Bạn có thể giúp mình về bài tập môn Lập trình C được không?',
      conversationId: conversation.id,
      senderId: admin.id,
    },
  });

  console.log('Test conversation created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
