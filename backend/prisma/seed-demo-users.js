import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 12);
  
  const users = [
    {
      email: 'rumahtangga@etrashhub.com',
      name: 'Demo Rumah Tangga',
      role: 'RUMAH_TANGGA',
      password: passwordHash,
      verificationStatus: 'ACTIVE',
      phone: '08111111111',
      houseRole: 'KEPALA_KELUARGA',
      address: 'Jl. Demo Rumah Tangga',
      postalCode: '11111',
      points: 1000
    },
    {
      email: 'driver@etrashhub.com',
      name: 'Demo Driver',
      role: 'DRIVER',
      password: passwordHash,
      verificationStatus: 'ACTIVE',
      phone: '08222222222',
      driverType: 'FREELANCE',
      domicile: 'Jakarta',
      points: 200
    },
    {
      email: 'tps3r@etrashhub.com',
      name: 'Demo Admin TPS3R',
      role: 'ADMIN_TPS3R',
      password: passwordHash,
      verificationStatus: 'ACTIVE', // Force active for testing
      phone: '08333333333',
      tpsName: 'TPS3R Demo Mawar',
      tpsAddress: 'Jl. Demo TPS3R',
      points: 5000
    },
    {
      email: 'customer@etrashhub.com',
      name: 'Demo Customer',
      role: 'CUSTOMER',
      password: passwordHash,
      verificationStatus: 'ACTIVE',
      phone: '08444444444',
      industryType: 'INDUSTRI',
      companyAddress: 'Jl. Demo Pabrik',
      companyPostalCode: '44444',
      points: 0
    },
    {
      email: 'pemda@etrashhub.com',
      name: 'Demo Pemda',
      role: 'PEMDA',
      password: passwordHash,
      verificationStatus: 'ACTIVE', // Force active
      phone: '08555555555',
      region: 'Kota Demo',
      officeAddress: 'Jl. Demo Balai Kota',
      points: 0
    },
    {
      email: 'superadmin@etrashhub.com',
      name: 'Demo Super Admin',
      role: 'SUPER_ADMIN',
      password: passwordHash,
      verificationStatus: 'ACTIVE',
      phone: '08666666666',
      points: 0
    },
    {
      email: 'admin.driver@etrashhub.com',
      name: 'Admin Driver',
      role: 'ADMIN_DRIVER',
      password: passwordHash,
      verificationStatus: 'ACTIVE',
      phone: '08777777777',
      points: 0
    },
    {
      email: 'admin.pemda@etrashhub.com',
      name: 'Admin Pemda',
      role: 'ADMIN_PEMDA',
      password: passwordHash,
      verificationStatus: 'ACTIVE',
      phone: '08888888888',
      points: 0
    }
  ];

  console.log('Seeding demo users...');
  
  for (const user of users) {
    const existing = await prisma.user.findUnique({ where: { email: user.email } });
    if (!existing) {
      await prisma.user.create({ data: user });
      console.log(`Created user: ${user.email} (Role: ${user.role})`);
    } else {
      console.log(`User already exists: ${user.email}`);
    }
  }

  console.log('\nSeeding completed! Password for all accounts is: password123');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
