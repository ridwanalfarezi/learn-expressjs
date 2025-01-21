import prisma from "../prisma/client/index.js";

// Create product
const createProduct = async (req, res) => {
  try {
    const { name, description, categoryId } = req.body;
    const userId = req.user.id;

    const product = await prisma.product.create({
      data: {
        name,
        description,
        categoryId,
        userId,
      },
    });

    res.status(201).json({ product, message: "Product created successfully" });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get products
const getProducts = async (req, res) => {
  try {
    const { category, search } = req.query;

    const products = await prisma.product.findMany({
      where: {
        category: { name: { contains: category || "" } },
        name: { contains: search || "" },
      },
      include: {
        category: true,
      },
    });

    res.json({ products });
  } catch (error) {
    console.log("Error", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get One product
const getOneProduct = async (req, res) => {
  const { id } = req.params;

  const product = await prisma.product.findUnique({
    where: { id: parseInt(id) },
  });
  res.json({ product });
};

// Update product
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        ...req.body,
        userId,
      },
    });

    res.json({ product: updatedProduct, message: "Product updated successfully" });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  const { id } = req.params;

  await prisma.product.delete({
    where: { id: parseInt(id) },
  });

  res.json({ message: "Product deleted successfully" });
};

export {
  createProduct,
  getProducts,
  getOneProduct,
  updateProduct,
  deleteProduct,
};
