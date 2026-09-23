import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs'; // Pour lire le fichier JSON
import { createConnection } from 'mysql2';
import axios from 'axios'; // Pour télécharger l'image et la convertir en binaire
import { config } from 'dotenv';

// Obtenir le répertoire courant du module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger les variables d'environnement depuis un chemin spécifique
config({ path: resolve(__dirname, '../.env') });

// Connexion à MySQL
const db = createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Fonction pour vérifier ou insérer la taille
const checkOrInsertSize = async (sizeName) => {
    return new Promise((resolve, reject) => {
        db.query('SELECT siz_id FROM size WHERE siz_name = ?', [sizeName], (err, results) => {
            if (err) return reject(err);
            if (results.length > 0) {
                resolve(results[0].siz_id);
            } else {
                db.query('INSERT INTO size (siz_name) VALUES (?)', [sizeName], (err, result) => {
                    if (err) return reject(err);
                    resolve(result.insertId);
                });
            }
        });
    });
};

// Fonction pour vérifier ou insérer la taille du produit dans la table d'association
const insertProductSize = async (proId, sizId) => {
    return new Promise((resolve, reject) => {
        db.query('INSERT IGNORE INTO product_size (pro_id, siz_id) VALUES (?, ?)', [proId, sizId], (err) => {
            if (err) return reject(err);
            resolve();
        });
    });
};
// Fonction pour vérifier si la marque existe déjà, sinon l'ajouter
const checkOrInsertBrand = async (brandName) => {
  return new Promise((resolve, reject) => {
    db.query('SELECT bra_id FROM brand WHERE bra_name = ?', [brandName], (err, results) => {
      if (err) return reject(err);

      if (results.length > 0) {
        resolve(results[0].bra_id); // Si la marque existe déjà
      } else {
        // Sinon, insérer la nouvelle marque
        db.query('INSERT INTO brand (bra_name) VALUES (?)', [brandName], (err, result) => {
          if (err) return reject(err);
          resolve(result.insertId); // Retourner le nouvel ID
        });
      }
    });
  });
};

// Fonction pour vérifier si la couleur existe déjà, sinon l'ajouter
const checkOrInsertColor = async (colorName) => {
  return new Promise((resolve, reject) => {
    db.query('SELECT col_id FROM color WHERE col_name = ?', [colorName], (err, results) => {
      if (err) return reject(err);

      if (results.length > 0) {
        resolve(results[0].col_id); // Si la couleur existe déjà
      } else {
        // Sinon, insérer la nouvelle couleur
        db.query('INSERT INTO color (col_name) VALUES (?)', [colorName], (err, result) => {
          if (err) return reject(err);
          resolve(result.insertId); // Retourner le nouvel ID
        });
      }
    });
  });
};

// Fonction pour vérifier ou insérer la catégorie
const checkOrInsertCategory = async (categoryName) => {
    return new Promise((resolve, reject) => {
        db.query('SELECT cat_id FROM category WHERE cat_name = ?', [categoryName], (err, results) => {
            if (err) return reject(err);
            if (results.length > 0) {
                resolve(results[0].cat_id);
            } else {
                db.query('INSERT INTO category (cat_name) VALUES (?)', [categoryName], (err, result) => {
                    if (err) return reject(err);
                    resolve(result.insertId);
                });
            }
        });
    });
};

// Fonction pour télécharger l'image et la convertir en BLOB
const downloadImageAsBlob = async (imageUrl) => {
  const response = await axios.get(`https://${imageUrl}`, { responseType: 'arraybuffer' });
  return response.data; // Image en données binaires
};

// Fonction pour obtenir les détails du produit depuis l'API ASOS
const getProductDetails = async (productId) => {
    try {
      const response = await axios.get(`https://asos10.p.rapidapi.com/api/v1/getProductDetails`, {
        params: {
          productId: productId,
          currency: 'USD',
          store: 'US',
          language: 'en-US',
          sizeSchema: 'US'
        },
        headers: {
          'X-Rapidapi-Key': 'process.env.RAPIDAPI_KEY', 
          'X-Rapidapi-Host': 'process.env.RAPIDAPI_HOST' 
        }
      });
      return response.data.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des détails du produit ${productId}:`, error);
      return null;
    }
  };

  // Fonction pour nettoyer la description HTML en supprimant les balises <a href>
    const cleanDescription = (html) => {
        return html.replace(/<a[^>]*>(.*?)<\/a>/gi, '$1');
  };
  

  const checkIfProductExists = async (productId) => {
    return new Promise((resolve, reject) => {
      db.query('SELECT COUNT(*) AS count FROM product WHERE pro_id = ?', [productId], (err, results) => {
        if (err) return reject(err);
        resolve(results[0].count > 0);
      });
    });
  };

// Fonction principale pour insérer les produits
const insertProducts = async () => {
  // Récupérer les listes de produits pour 'women' et 'men'
  const rawDataMen = fs.readFileSync('productWinter.json'); 
  const productsMen = JSON.parse(rawDataMen).data.products;
  const rawDataWomen = fs.readFileSync('productClothes.json'); 
  const productsWomen = JSON.parse(rawDataWomen).data.products;

  // Combiner les deux listes
  const allProducts = [...(productsWomen || []), ...(productsMen || [])];
  //const product = allProducts[0];

  for (const product of allProducts) {
    try {
        const productExists = await checkIfProductExists(product.id);

        if (productExists) {
            throw new Error(`Produit ${product.id} existe déjà, passage au produit suivant.`);
        }

      // Obtenir les détails supplémentaires du produit
      const details = await getProductDetails(product.id);

      if (!details) {
        throw new Error(`Aucun détail trouvé pour le produit ${product.id}`);
      }

      // Nettoyer la description HTML
      const cleanedDescription = cleanDescription(details.description);

      // Vérifier ou insérer la marque, la couleur et la catégorie
      const brandId = await checkOrInsertBrand(product.brandName);
      const colorId = await checkOrInsertColor(product.colour);
      const categoryId = await checkOrInsertCategory(details.productType.name);

      // Télécharger et convertir l'image en BLOB
      const imageBlob = await downloadImageAsBlob(product.imageUrl);

      // Insérer le produit dans la base de données
      const sql = `INSERT INTO product 
      (pro_id, pro_name, pro_price, pro_currency, pro_description, pro_gender, pro_image, bra_id, col_id, cat_id) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      await new Promise((resolve, reject) => {
        db.query(sql, [
          product.id, 
          product.name, 
          product.price.current.value, 
          product.price.currency, 
          cleanedDescription, 
          details.gender, 
          imageBlob, 
          brandId, 
          colorId,
          categoryId
        ], (err, result) => {
          if (err) return reject(err);
          console.log(`Produit ${product.name} inséré avec succès !`);
          resolve(result);
        });
      });

        // Insérer les tailles dans la table d'association
        for (const variant of details.variants) {
            try {
                const sizeId = await checkOrInsertSize(variant.brandSize); 
                await insertProductSize(product.id, sizeId); 
            } catch (error) {
                console.error(`Erreur lors de l'insertion de la taille pour le produit ${product.name}:`, error);
            }
        }
    } catch (err) {
      console.error(`Erreur lors de l'insertion du produit ${product.name}:`, err);
    } 
  } 
    db.end(); // Fermer la connexion à la base de données
};

// Exécuter l'insertion des produits
insertProducts();
