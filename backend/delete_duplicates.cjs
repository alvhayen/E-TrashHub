const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const inventory = await prisma.inventory.findMany();
  const seen = new Set();
  const idsToDelete = [];

  for (const item of inventory) {
    const key = `${item.tps3rId}-${item.commodity}`;
    if (seen.has(key)) {
      idsToDelete.push(item.id);
    } else {
      seen.add(key);
    }
  }

  if (idsToDelete.length > 0) {
    const result = await prisma.inventory.deleteMany({
      where: {
        id: { in: idsToDelete }
      }
    });
    console.log(`Deleted ${result.count} duplicate items.`);
  } else {
    console.log('No duplicates found.');
  }
}

main().finally(() => prisma.$disconnect());
