import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Hash the admin password
  const adminPassword = await bcrypt.hash('Washim123', 10);

  // Create or update the admin user
  await prisma.user.upsert({
    where: { email: 'admin@example.com' }, // Use a unique email for the admin
    update: {},
    create: {
      name: 'Washim',
      email: 'admin@example.com',
      password: adminPassword,
    },
  });

  console.log('Admin user seeded successfully');
}

main()
  .catch((e) => {
    console.error('Error seeding admin user:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });