import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Hash the admin password
  const adminPassword = await bcrypt.hash('Washim123', 10);

  // Create or update the admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Washim',
      email: 'admin@example.com',
      password: adminPassword,
    },
  });

  // Seed reviews with mediaUrls (images and videos)
  await prisma.review.createMany({
    data: [
      {
        entity: 'Awesome Mobile',
        rating: 5,
        review: 'This is a great mobile phone with premium features.',
        imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        mediaUrls: [
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9',
          'https://www.w3schools.com/html/mov_bbb.mp4'
        ],
        title: 'Awesome Mobile With Premium Quality',
        content: 'Awesome Mobile With Premium Quality',
        tags: ['electronics', 'mobile'],
        authorId: admin.id,
        createdAt: new Date(),
      },
      {
        entity: 'Kasol Trek',
        rating: 4,
        review: 'Must go for trek in Kasol! Amazing experience.',
        imageUrl: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca',
        mediaUrls: [
          'https://images.unsplash.com/photo-1465101046530-73398c7f28ca',
          'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4'
        ],
        title: 'Must Go For Trek',
        content: 'Must Go For Trek',
        tags: ['travel', 'trekking'],
        authorId: admin.id,
        createdAt: new Date(),
      },
      {
        entity: 'Kasol Trip',
        rating: 5,
        review: 'Awesome trip to Kasol, highly recommended!',
        imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
        mediaUrls: [
          'https://images.unsplash.com/photo-1506744038136-46273834b3fb'
        ],
        title: 'Awesome Trip to Kasol',
        content: 'Awesome Trip to Kasol',
        tags: ['travel', 'nature'],
        authorId: admin.id,
        createdAt: new Date(),
      }
    ]
  });
}

main()
  .catch((e) => {
    console.error('Error seeding admin user:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });