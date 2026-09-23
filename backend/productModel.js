import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { createConnection } from "mysql2";
import { config } from "dotenv";

// Obtenir le répertoire courant du module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger les variables d'environnement depuis un chemin spécifique
config({ path: resolve(__dirname, "../.env") });

// Création de la connexion à la base de données
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

const getDbConnection = () => {
  const connection = createConnection(dbConfig);
  return connection;
};

// Fonction pour obtenir les catégories filtrées par genre
export const getCategoriesFromDb = (gender) => {
  const connection = getDbConnection();
  return new Promise((resolve, reject) => {
    const query = `
      SELECT * FROM category 
      WHERE cat_gender = ? OR cat_gender = 'All'
      ORDER BY cat_name ASC
    `;
    connection.query(query, [gender], (error, results) => {
      connection.end();
      if (error) {
        return reject(error);
      }
      resolve(results);
    });
  });
};

// Fonction pour obtenir les marques disponibles pour une catégorie
export const getBrandsFromDb = (gender, categoryId) => {
  const connection = getDbConnection();
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT DISTINCT b.bra_name
      FROM product p
      JOIN brand b ON p.bra_id = b.bra_id
      WHERE p.cat_id = ? AND p.pro_gender = ?
    `;
    connection.query(sql, [categoryId, gender], (error, results) => {
      connection.end();
      if (error) {
        return reject(error);
      }
      resolve(results);
    });
  });
};

// Fonction pour obtenir les couleurs disponibles pour une catégorie
export const getColorsFromDb = (gender, categoryId) => {
  const connection = getDbConnection();
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT DISTINCT c.col_name
      FROM product p
      JOIN color c ON p.col_id = c.col_id
      WHERE p.cat_id = ? AND p.pro_gender = ?
    `;
    connection.query(sql, [categoryId, gender], (error, results) => {
      connection.end();
      if (error) {
        return reject(error);
      }
      resolve(results);
    });
  });
};

// Fonction pour obtenir les tailles disponibles pour une catégorie
export const getSizesFromDb = (gender, categoryId) => {
  const connection = getDbConnection();
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT DISTINCT s.siz_name
      FROM product p
      JOIN product_size ps ON p.pro_id = ps.pro_id
      JOIN size s ON ps.siz_id = s.siz_id
      WHERE p.cat_id = ? AND p.pro_gender = ?
    `;
    connection.query(sql, [categoryId, gender], (error, results) => {
      connection.end();
      if (error) {
        return reject(error);
      }
      resolve(results);
    });
  });
};

export const getProductsByCategoryFromDb = (
  gender,
  categoryId,
  sort = "asc",
  limit = 16,
  offset = 0
) => {
  const connection = getDbConnection();
  return new Promise((resolve, reject) => {
    // Requête pour obtenir les produits avec pagination
    const sql = `
      SELECT p.*, b.bra_name, c.col_name, cat.cat_name 
      FROM product p
      JOIN brand b ON p.bra_id = b.bra_id
      JOIN color c ON p.col_id = c.col_id
      JOIN category cat ON p.cat_id = cat.cat_id
      WHERE cat.cat_id = ? AND p.pro_gender = ?
      ORDER BY p.pro_price ${sort}
      LIMIT ? OFFSET ?
    `;

    const productQuery = new Promise((resolveProducts, rejectProducts) => {
      connection.query(
        sql,
        [categoryId, gender, parseInt(limit, 10), parseInt(offset, 10)],
        (error, results) => {
          if (error) {
            return rejectProducts(error);
          }
          resolveProducts(results);
        }
      );
    });

    // Requête pour obtenir le total des produits sans pagination
    const countSql = `
      SELECT COUNT(p.pro_id) as total 
      FROM product p
      WHERE p.pro_gender = ? AND p.cat_id = ?
    `;

    const countQuery = new Promise((resolveCount, rejectCount) => {
      connection.query(countSql, [gender, categoryId], (error, results) => {
        if (error) {
          return rejectCount(error);
        }
        resolveCount(results[0].total);
      });
    });

    // Exécuter les deux requêtes en parallèle
    Promise.all([productQuery, countQuery])
      .then(([products, total]) => {
        connection.end();
        resolve({ products, total });
      })
      .catch((error) => {
        connection.end();
        reject(error);
      });
  });
};

export const getFilteredProductsFromDb = (
  gender,
  categoryId,
  sizes = [],
  colors = [],
  brands = [],
  sort = "asc",
  limit = 16,
  offset = 0
) => {
  const connection = getDbConnection();
  return new Promise((resolve, reject) => {
    // Requête pour obtenir les produits filtrés avec pagination
    let sql = `
      SELECT DISTINCT p.*, b.bra_name, c.col_name, cat.cat_name 
      FROM product p
      JOIN brand b ON p.bra_id = b.bra_id
      JOIN color c ON p.col_id = c.col_id
      JOIN category cat ON p.cat_id = cat.cat_id
      JOIN product_size ps ON p.pro_id = ps.pro_id
      JOIN size s ON ps.siz_id = s.siz_id
      WHERE cat.cat_id = ? AND p.pro_gender = ?
    `;

    const params = [categoryId, gender];

    if (sizes.length > 0) {
      sql += " AND s.siz_name IN (?)";
      params.push(sizes);
    }

    if (colors.length > 0) {
      sql += " AND c.col_name IN (?)";
      params.push(colors);
    }

    if (brands.length > 0) {
      sql += " AND b.bra_name IN (?)";
      params.push(brands);
    }

    sql += `
      ORDER BY p.pro_price ${sort}
      LIMIT ? OFFSET ?
    `;

    const productQuery = new Promise((resolveProducts, rejectProducts) => {
      connection.query(
        sql,
        [...params, parseInt(limit, 10), parseInt(offset, 10)],
        (error, results) => {
          if (error) {
            return rejectProducts(error);
          }
          resolveProducts(results);
        }
      );
    });

    // Requête pour obtenir le total des produits sans pagination
    let countSql = `
      SELECT COUNT(DISTINCT p.pro_id) as total 
      FROM product p
      JOIN brand b ON p.bra_id = b.bra_id
      JOIN color c ON p.col_id = c.col_id
      JOIN category cat ON p.cat_id = cat.cat_id
      JOIN product_size ps ON p.pro_id = ps.pro_id
      JOIN size s ON ps.siz_id = s.siz_id
      WHERE cat.cat_id = ? AND p.pro_gender = ?
    `;

    if (sizes.length > 0) {
      countSql += " AND s.siz_name IN (?)";
    }

    if (colors.length > 0) {
      countSql += " AND c.col_name IN (?)";
    }

    if (brands.length > 0) {
      countSql += " AND b.bra_name IN (?)";
    }

    const countQuery = new Promise((resolveCount, rejectCount) => {
      connection.query(countSql, params, (error, results) => {
        if (error) {
          return rejectCount(error);
        }
        resolveCount(results[0].total);
      });
    });

    // Exécuter les deux requêtes en parallèle
    Promise.all([productQuery, countQuery])
      .then(([products, total]) => {
        connection.end();
        resolve({ products, total });
      })
      .catch((error) => {
        connection.end();
        reject(error);
      });
  });
};

// Fonction pour obtenir les détails d'un produit spécifique
export const getProductDetailsFromDb = (gender, categoryId, productId) => {
  const connection = getDbConnection();
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT p.*, b.bra_name, c.col_name, cat.cat_name, 
             GROUP_CONCAT(s.siz_name) AS sizes
      FROM product p
      JOIN brand b ON p.bra_id = b.bra_id
      JOIN color c ON p.col_id = c.col_id
      JOIN category cat ON p.cat_id = cat.cat_id
      LEFT JOIN product_size ps ON p.pro_id = ps.pro_id
      LEFT JOIN size s ON ps.siz_id = s.siz_id
      WHERE p.pro_id = ? AND p.pro_gender = ? AND cat.cat_id = ?
      GROUP BY p.pro_id
    `;

    connection.query(sql, [productId, gender, categoryId], (error, results) => {
      connection.end();
      if (error) {
        return reject(error);
      }

      if (results.length === 0) {
        return resolve([]); // Aucun produit trouvé
      }

      // Résultat est directement prêt avec les tailles sous forme de chaîne séparée par des virgules
      const productDetails = results[0];
      // Convertir la chaîne de tailles en tableau
      productDetails.sizes = productDetails.sizes
        ? productDetails.sizes.split(",")
        : [];
      resolve(productDetails);
    });
  });
};
