import prisma from "../client/index.js";

async function seedCategories() {
  try {
    const categories = [
      { name: 'Electronics' },
      { name: 'Clothing' },
      { name: 'Books' },
    ];

    for (const category of categories) {
      const existingCategory = await prisma.category.findFirst({
        where: { name: category.name },
      });

      if (!existingCategory) {
        await prisma.category.create({
          data: {
            name: category.name,
          },
        });

        console.log(`Category "${category.name}" created.`);
      } else {
        console.log(`Category "${category.name}" already exists.`);
      }
    }
  } catch (error) {
    console.error('Error seeding categories:', error);
  }
}

seedCategories();
