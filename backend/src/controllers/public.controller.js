import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getWasteCategories = async (req, res) => {
  try {
    const categories = await prisma.wasteCategory.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        imageUrl: true,
        priceEstMin: true,
        priceEstMax: true,
        description: true,
        sortingTips: true
      },
      orderBy: { sortOrder: 'asc' }
    });

    res.json({ success: true, categories });
  } catch (error) {
    console.error('getWasteCategories error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getWasteCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const category = await prisma.wasteCategory.findUnique({
      where: { slug }
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ success: true, category });
  } catch (error) {
    console.error('getWasteCategoryBySlug error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
