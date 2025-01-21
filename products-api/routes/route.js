import { Router } from "express";
import * as authController from "../controller/authController.js";
import * as productController from "../controller/productController.js";
import authenticateToken from "../middleware/auth.js";

const router = Router();

// api docs
router.get("/", (req, res) => {
  res.redirect("https://documenter.getpostman.com/view/27798268/2s9YynkPpk");
});

// auth
router.post("/auth/register", authController.registerUser);
router.post("/auth/login", authController.loginUser);

// product
router.post("/product", authenticateToken, productController.createProduct);
router.get("/product", authenticateToken, productController.getProducts);
router.get("/product/:id", authenticateToken, productController.getOneProduct);
router.put("/product/:id", authenticateToken, productController.updateProduct);
router.delete(
  "/product/:id",
  authenticateToken,
  productController.deleteProduct
);

export default router;
