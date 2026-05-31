import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);
  const superAdminPasswordHash = await bcrypt.hash('superadmin123', 10);

  // 1. Create Super Admin
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@etrashhub.id' },
    update: {},
    create: {
      email: 'superadmin@etrashhub.id',
      password: superAdminPasswordHash,
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
      verificationStatus: 'ACTIVE',
    },
  });

  // 2. Create Users RT
  const userRT1 = await prisma.user.upsert({
    where: { email: 'sari@email.com' },
    update: {},
    create: {
      email: 'sari@email.com',
      password: passwordHash,
      name: 'Sari (RT)',
      role: 'RUMAH_TANGGA',
      verificationStatus: 'ACTIVE',
      houseRole: 'PASANGAN',
      address: 'Jl. Melati No. 5',
      points: 1500,
    },
  });

  const userRT2 = await prisma.user.upsert({
    where: { email: 'budi.rt@email.com' },
    update: {},
    create: {
      email: 'budi.rt@email.com',
      password: passwordHash,
      name: 'Budi (RT)',
      role: 'RUMAH_TANGGA',
      verificationStatus: 'ACTIVE',
      houseRole: 'KEPALA_KELUARGA',
      address: 'Jl. Merdeka No. 12',
    },
  });

  // 3. Create Drivers
  const driverFreelance = await prisma.user.upsert({
    where: { email: 'driver.freelance@email.com' },
    update: {},
    create: {
      email: 'driver.freelance@email.com',
      password: passwordHash,
      name: 'Agus (Freelance)',
      role: 'DRIVER',
      verificationStatus: 'ACTIVE',
      driverType: 'FREELANCE',
      domicile: 'Balikpapan Selatan',
      vehicleType: 'Motor Roda Tiga',
      vehiclePlate: 'KT 5678 CD',
    },
  });

  const driverMitra = await prisma.user.upsert({
    where: { email: 'driver.mitra@email.com' },
    update: {},
    create: {
      email: 'driver.mitra@email.com',
      password: passwordHash,
      name: 'Joko (Mitra)',
      role: 'DRIVER',
      verificationStatus: 'ACTIVE',
      driverType: 'MITRA_TPS3R',
      domicile: 'Balikpapan Barat',
      vehicleType: 'Pickup Bak L300',
      vehiclePlate: 'KT 1234 AB',
    },
  });

  // Keep old driver for backward compat
  await prisma.user.upsert({
    where: { email: 'budi.driver@email.com' },
    update: { verificationStatus: 'ACTIVE', driverType: 'FREELANCE' },
    create: {
      email: 'budi.driver@email.com',
      password: passwordHash,
      name: 'Budi (Driver)',
      role: 'DRIVER',
      verificationStatus: 'ACTIVE',
      driverType: 'FREELANCE',
      domicile: 'Jakarta',
    },
  });

  // 4. Create Admin TPS3R
  const adminTPS1 = await prisma.user.upsert({
    where: { email: 'admin.tps3r@email.com' },
    update: {},
    create: {
      email: 'admin.tps3r@email.com',
      password: passwordHash,
      name: 'Admin TPS3R Mawar',
      role: 'ADMIN_TPS3R',
      verificationStatus: 'ACTIVE',
      tpsName: 'TPS3R Mawar',
      tpsAddress: 'Jl. Mawar No. 10',
    },
  });

  const adminTPS2 = await prisma.user.upsert({
    where: { email: 'admin.tps3r2@email.com' },
    update: {},
    create: {
      email: 'admin.tps3r2@email.com',
      password: passwordHash,
      name: 'Admin TPS3R Melati',
      role: 'ADMIN_TPS3R',
      verificationStatus: 'ACTIVE',
      tpsName: 'TPS3R Melati',
      tpsAddress: 'Jl. Melati No. 20',
    },
  });

  const adminTPSPending = await prisma.user.upsert({
    where: { email: 'pending.tps3r@email.com' },
    update: {},
    create: {
      email: 'pending.tps3r@email.com',
      password: passwordHash,
      name: 'Admin TPS3R Baru',
      role: 'ADMIN_TPS3R',
      verificationStatus: 'PENDING',
      tpsName: 'TPS3R Harapan',
      tpsAddress: 'Jl. Harapan No. 1',
    },
  });

  // 5. Create Customer Industri
  const customerIndustri = await prisma.user.upsert({
    where: { email: 'customer@industri.com' },
    update: {},
    create: {
      email: 'customer@industri.com',
      password: passwordHash,
      name: 'PT Daur Ulang Jaya',
      role: 'CUSTOMER',
      verificationStatus: 'ACTIVE',
      industryType: 'INDUSTRI',
      companyAddress: 'Kawasan Industri Pulogadung',
    },
  });

  // 6. Create Pemda
  const pemdaActive = await prisma.user.upsert({
    where: { email: 'dinas@surabaya.go.id' },
    update: {},
    create: {
      email: 'dinas@surabaya.go.id',
      password: passwordHash,
      name: 'Dinas Lingkungan Hidup Surabaya',
      role: 'PEMDA',
      verificationStatus: 'ACTIVE',
      region: 'Kota Surabaya',
      officeAddress: 'Jl. Pemuda No. 1',
    },
  });

  const pemdaPending = await prisma.user.upsert({
    where: { email: 'pending.pemda@email.com' },
    update: {},
    create: {
      email: 'pending.pemda@email.com',
      password: passwordHash,
      name: 'Dinas Lingkungan Kab. X',
      role: 'PEMDA',
      verificationStatus: 'PENDING',
      region: 'Kabupaten X',
      officeAddress: 'Kompleks Pemda X',
    },
  });

  // 7. Verification Queue
  await prisma.verificationQueue.upsert({
    where: { userId: adminTPSPending.id },
    update: {},
    create: {
      userId: adminTPSPending.id,
      role: 'ADMIN_TPS3R',
      status: 'PENDING',
    },
  });

  await prisma.verificationQueue.upsert({
    where: { userId: pemdaPending.id },
    update: {},
    create: {
      userId: pemdaPending.id,
      role: 'PEMDA',
      status: 'PENDING',
    },
  });

  // 8. Waste Categories
  const categories = [
    { name: 'Botol Plastik', slug: 'botol-plastik', imageUrl: '/images/waste/botol-plastik.webp', priceEstMin: 1500, priceEstMax: 2500, description: 'Botol air mineral bersih', sortingTips: 'Kosongkan sisa air, remukkan botol' },
    { name: 'Gelas Plastik', slug: 'gelas-plastik', imageUrl: '/images/waste/gelas-plastik.webp', priceEstMin: 1000, priceEstMax: 2000, description: 'Gelas plastik minuman bersih', sortingTips: 'Buang sisa minuman, bersihkan' },
    { name: 'Kertas/Kardus', slug: 'kertas-kardus', imageUrl: '/images/waste/kertas-kardus.webp', priceEstMin: 1200, priceEstMax: 1800, description: 'Kertas bekas, kardus utuh/potongan', sortingTips: 'Lipat kardus, pastikan kertas tidak basah' },
    { name: 'Logam/Kaleng', slug: 'logam-kaleng', imageUrl: '/images/waste/logam-kaleng.webp', priceEstMin: 3000, priceEstMax: 5000, description: 'Kaleng minuman, potongan logam', sortingTips: 'Kosongkan sisa cairan, remukkan kaleng' },
    { name: 'Tutup Botol', slug: 'tutup-botol', imageUrl: '/images/waste/tutup-botol.webp', priceEstMin: 500, priceEstMax: 1000, description: 'Tutup botol plastik berbagai warna', sortingTips: 'Pisahkan dari botolnya, kumpulkan dalam wadah' },
    { name: 'Kain/Tekstil', slug: 'kain-tekstil', imageUrl: '/images/waste/kain-tekstil.webp', priceEstMin: 200, priceEstMax: 500, description: 'Pakaian bekas layak pakai atau perca', sortingTips: 'Cuci bersih, lipat rapi' },
  ];

  const createdCategories = {};
  for (const cat of categories) {
    createdCategories[cat.slug] = await prisma.wasteCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  // 9. Inventory items at TPS3R pertama
  // Check if inventory already exists to avoid duplicates
  const existingInv = await prisma.inventory.findFirst({ where: { tps3rId: adminTPS1.id } });
  if (!existingInv) {
    const inventoryItems = [
      { tps3rId: adminTPS1.id, wasteCategoryId: createdCategories['botol-plastik'].id, commodity: 'Botol PET Bersih', stockKg: 150.5, pricePerKg: 3000, isPublic: true },
      { tps3rId: adminTPS1.id, wasteCategoryId: createdCategories['kertas-kardus'].id, commodity: 'Kardus Bekas', stockKg: 200, pricePerKg: 2000, isPublic: true },
      { tps3rId: adminTPS1.id, wasteCategoryId: createdCategories['logam-kaleng'].id, commodity: 'Kaleng Alumunium', stockKg: 50, pricePerKg: 6000, isPublic: true },
      { tps3rId: adminTPS1.id, wasteCategoryId: createdCategories['gelas-plastik'].id, commodity: 'Gelas PP Bersih', stockKg: 75.2, pricePerKg: 2500, isPublic: false },
      { tps3rId: adminTPS1.id, wasteCategoryId: createdCategories['tutup-botol'].id, commodity: 'Tutup Botol HDPE', stockKg: 20.5, pricePerKg: 1500, isPublic: false },
    ];

    for (const inv of inventoryItems) {
      await prisma.inventory.create({ data: inv });
    }
  }

  console.log('Seed data successfully created!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
