import {
  getCategoriesFromDb,
  getProductsByCategoryFromDb,
  getProductDetailsFromDb,
  getFilteredProductsFromDb,
  getBrandsFromDb,
  getColorsFromDb,
  getSizesFromDb,
} from "./productModel.js";
import redisClient from "./redisClient.js";

const isCacheEnabled = process.env.CACHE_REDIS === "true";

// Contrôleur pour obtenir les catégories
export const getCategories = async (req, res) => {
  const { gender } = req.params;
  const cacheKey = `categories:${gender}`;

  try {
    if (isCacheEnabled) {
      // Vérifier le cache
      const cachedCategories = await redisClient.get(cacheKey);
      if (cachedCategories) {
        console.log("Cache hit");
        return res.json(JSON.parse(cachedCategories));
      }
    }

    // Si pas en cache ou cache désactivé, obtenir les données depuis la base de données
    const categories = await getCategoriesFromDb(gender);
    // Mettre en cache les données
    await redisClient.set(cacheKey, JSON.stringify(categories), { EX: 3600 });

    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Contrôleur pour obtenir les marques disponibles par catégorie
export const getBrands = async (req, res) => {
  const { gender, categoryid } = req.params;
  const cacheKey = `brands:${gender}:${categoryid}`;

  try {
    if (isCacheEnabled) {
      // Vérifier le cache
      const cachedBrands = await redisClient.get(cacheKey);
      if (cachedBrands) {
        console.log("Cache hit");
        return res.json(JSON.parse(cachedBrands));
      }
    }

    // Si pas en cache ou cache désactivé, obtenir les données depuis la base de données
    const brands = await getBrandsFromDb(gender, categoryid);
    // Mettre en cache les données
    await redisClient.set(cacheKey, JSON.stringify(brands), { EX: 3600 });

    res.json(brands);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Contrôleur pour obtenir les couleurs disponibles par catégorie
export const getColors = async (req, res) => {
  const { gender, categoryid } = req.params;
  const cacheKey = `colors:${gender}:${categoryid}`;

  try {
    if (isCacheEnabled) {
      // Vérifier le cache
      const cachedColors = await redisClient.get(cacheKey);
      if (cachedColors) {
        console.log("Cache hit");
        return res.json(JSON.parse(cachedColors));
      }
    }

    // Si pas en cache ou cache désactivé, obtenir les données depuis la base de données
    const colors = await getColorsFromDb(gender, categoryid);
    // Mettre en cache les données
    await redisClient.set(cacheKey, JSON.stringify(colors), { EX: 3600 });

    res.json(colors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Contrôleur pour obtenir les tailles disponibles par catégorie
export const getSizes = async (req, res) => {
  const { gender, categoryid } = req.params;
  const cacheKey = `sizes:${gender}:${categoryid}`;

  try {
    if (isCacheEnabled) {
      // Vérifier le cache
      const cachedSizes = await redisClient.get(cacheKey);
      if (cachedSizes) {
        console.log("Cache hit");
        return res.json(JSON.parse(cachedSizes));
      }
    }

    // Si pas en cache ou cache désactivé, obtenir les données depuis la base de données
    const sizes = await getSizesFromDb(gender, categoryid);
    // Mettre en cache les données
    await redisClient.set(cacheKey, JSON.stringify(sizes), { EX: 3600 });

    res.json(sizes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Fonction pour trier les tableaux et les convertir en chaîne
const serializeArray = (arr) =>
  Array.isArray(arr) ? arr.sort().join(",") : "all";

export const getProducts = async (req, res) => {
  const { gender, categoryid } = req.params;
  const {
    size,
    color,
    brand,
    sort = "asc",
    offset = 0,
    limit = 16,
  } = req.query;

  // Sérialiser les tableaux pour la clé de cache
  const sizeKey = serializeArray(size);
  const colorKey = serializeArray(color);
  const brandKey = serializeArray(brand);

  // Générer la clé de cache
  const cacheKey = `products:${gender}:${categoryid}:${sizeKey}:${colorKey}:${brandKey}:${sort}:${limit}:${offset}`;
  try {
    if (isCacheEnabled) {
      // Vérifier le cache
      const cachedProducts = await redisClient.get(cacheKey);
      if (cachedProducts) {
        console.log("Cache hit");
        return res.json(JSON.parse(cachedProducts));
      }
    }

    let products;
    if (size || color || brand) {
      // Appel de la fonction pour les produits filtrés
      products = await getFilteredProductsFromDb(
        gender,
        categoryid,
        size,
        color,
        brand,
        sort,
        limit,
        offset
      );
    } else {
      // Appel de la fonction pour les produits par catégorie
      console.log("From DB");
      products = await getProductsByCategoryFromDb(
        gender,
        categoryid,
        sort,
        limit,
        offset
      );
    }

    // Mettre en cache les données
    await redisClient.set(cacheKey, JSON.stringify(products), { EX: 3600 });

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Contrôleur pour obtenir les détails d'un produit
export const getProductDetails = async (req, res) => {
  const { gender, categoryid, productid } = req.params;
  const cacheKey = `productDetails:${gender}:${categoryid}:${productid}`;

  try {
    if (isCacheEnabled) {
      // Vérifier le cache
      const cachedProduct = await redisClient.get(cacheKey);
      if (cachedProduct) {
        console.log("Cache hit");
        return res.json(JSON.parse(cachedProduct));
      }
    }

    // Si pas en cache ou cache désactivé, obtenir les données depuis la base de données
    const product = await getProductDetailsFromDb(
      gender,
      categoryid,
      productid
    );
    // Mettre en cache les données
    await redisClient.set(cacheKey, JSON.stringify(product), { EX: 3600 });

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
