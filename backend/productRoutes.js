import express from "express";
import {
  getCategories,
  getProducts,
  getProductDetails,
  getBrands,
  getColors,
  getSizes,
} from "./productController.js";

const router = express.Router();

// Route pour les catégories
router.get("/:gender/categories", getCategories);

// Route pour les produits par catégorie ou pour les produits filtrés
router.get("/:gender/categories/:categoryid/products", getProducts);

// Route pour les marques des produits par catégorie
router.get("/:gender/categories/:categoryid/brands", getBrands);

// Route pour les couleurs des produits par catégorie
router.get("/:gender/categories/:categoryid/colors", getColors);

// Route pour les tailles des produits par catégorie
router.get("/:gender/categories/:categoryid/sizes", getSizes);

// Route pour les détails d'un produit spécifique
router.get(
  "/:gender/categories/:categoryid/products/:productid",
  getProductDetails
);

export default router;
