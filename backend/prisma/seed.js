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
      domicile: 'Jakarta Selatan',
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
      domicile: 'Jakarta Timur',
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

  // 5. Create Mitra Industri
  const mitraIndustri = await prisma.user.upsert({
    where: { email: 'mitra@industri.com' },
    update: {},
    create: {
      email: 'mitra@industri.com',
      password: passwordHash,
      name: 'PT Daur Ulang Jaya',
      role: 'MITRA_B2B',
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
    { name: 'Botol Plastik', slug: 'botol-plastik', imageUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=400', priceEstMin: 1500, priceEstMax: 2500, description: 'Botol air mineral bersih', sortingTips: 'Kosongkan sisa air, remukkan botol' },
    { name: 'Gelas Plastik', slug: 'gelas-plastik', imageUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=400', priceEstMin: 1000, priceEstMax: 2000, description: 'Gelas plastik minuman bersih', sortingTips: 'Buang sisa minuman, bersihkan' },
    { name: 'Kertas/Kardus', slug: 'kertas-kardus', imageUrl: 'https://images.unsplash.com/photo-1581574919402-5b09d95b6d7a?w=400', priceEstMin: 1200, priceEstMax: 1800, description: 'Kertas bekas, kardus utuh/potongan', sortingTips: 'Lipat kardus, pastikan kertas tidak basah' },
    { name: 'Logam/Kaleng', slug: 'logam-kaleng', imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', priceEstMin: 3000, priceEstMax: 5000, description: 'Kaleng minuman, potongan logam', sortingTips: 'Kosongkan sisa cairan, remukkan kaleng' },
    { name: 'Tutup Botol', slug: 'tutup-botol', imageUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=400', priceEstMin: 500, priceEstMax: 1000, description: 'Tutup botol plastik berbagai warna', sortingTips: 'Pisahkan dari botolnya, kumpulkan dalam wadah' },
    { name: 'Kain/Tekstil', slug: 'kain-tekstil', imageUrl: 'https://images.unsplash.com/photo-1581574919402-5b09d95b6d7a?w=400', priceEstMin: 200, priceEstMax: 500, description: 'Pakaian bekas layak pakai atau perca', sortingTips: 'Cuci bersih, lipat rapi' },
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
  const inventoryItems = [
    { tps3rId: adminTPS1.id, wasteCategoryId: createdCategories['botol-plastik'].id, commodity: 'Botol PET Bersih', stockKg: 150.5, pricePerKg: 3000, isPublic: true },
    { tps3rId: adminTPS1.id, wasteCategoryId: createdCategories['kertas-kardus'].id, commodity: 'Kardus Bekas', stockKg: 200, pricePerKg: 2000, isPublic: true },
    { tps3rId: adminTPS1.id, wasteCategoryId: createdCategories['logam-kaleng'].id, commodity: 'Kaleng Alumunium', stockKg: 50, pricePerKg: 6000, isPublic: true },
    { tps3rId: adminTPS1.id, wasteCategoryId: createdCategories['gelas-plastik'].id, commodity: 'Gelas PP Bersih', stockKg: 75.2, pricePerKg: 2500, isPublic: false },
    { tps3rId: adminTPS1.id, wasteCategoryId: createdCategories['tutup-botol'].id, commodity: 'Tutup Botol HDPE', stockKg: 20.5, pricePerKg: 1500, isPublic: false },
  ];

  const createdInventory = [];
  for (const inv of inventoryItems) {
    const item = await prisma.inventory.create({ data: inv });
    createdInventory.push(item);
  }

  // 10. PickupRequests
  const pickup1 = await prisma.pickupRequest.create({
    data: {
      userId: userRT1.id,
      driverId: driverFreelance.id,
      status: 'COMPLETED',
      address: 'Jl. Melati No. 5',
      estimatedWeight: 'Sedang',
      actualWeight: 5.5,
      points: 150,
      items: {
        create: [
          { wasteCategoryId: createdCategories['botol-plastik'].id, estimatedQty: '1 kresek' },
        ]
      }
    }
  });

  const pickup2 = await prisma.pickupRequest.create({
    data: {
      userId: userRT2.id,
      driverId: driverMitra.id,
      status: 'ON_THE_WAY',
      address: 'Jl. Merdeka No. 12',
      estimatedWeight: 'Ringan',
      items: {
        create: [
          { wasteCategoryId: createdCategories['kertas-kardus'].id, estimatedQty: 'Tumpukan kecil' },
        ]
      }
    }
  });

  const pickup3 = await prisma.pickupRequest.create({
    data: {
      userId: userRT1.id,
      status: 'PENDING',
      address: 'Jl. Melati No. 5',
      estimatedWeight: 'Berat',
      items: {
        create: [
          { wasteCategoryId: createdCategories['logam-kaleng'].id, estimatedQty: '1 karung' },
        ]
      }
    }
  });

  // 11. Expeditions
  const exp1 = await prisma.expedition.create({
    data: {
      driverId: driverMitra.id,
      type: 'TPS3R_TO_TPS3R',
      status: 'ON_THE_WAY',
      originId: adminTPS1.id,
      destinationId: adminTPS2.id,
      originName: 'TPS3R Mawar',
      destinationName: 'TPS3R Melati',
      originAddress: 'Jl. Mawar No. 10',
      destinationAddress: 'Jl. Melati No. 20',
      items: {
        create: [
          { inventoryId: createdInventory[0].id, weightKg: 50 },
        ]
      }
    }
  });

  const exp2 = await prisma.expedition.create({
    data: {
      driverId: driverMitra.id,
      type: 'TPS3R_TO_MITRA',
      status: 'CONFIRMED',
      originId: adminTPS1.id,
      destinationId: mitraIndustri.id,
      originName: 'TPS3R Mawar',
      destinationName: 'PT Daur Ulang Jaya',
      originAddress: 'Jl. Mawar No. 10',
      destinationAddress: 'Kawasan Industri Pulogadung',
      items: {
        create: [
          { inventoryId: createdInventory[1].id, weightKg: 100 },
        ]
      }
    }
  });

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
