import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import productRoutes from "./productRoutes.js"; 

const app = express();
const PORT = process.env.PORT; 

// Obtenir le répertoire courant
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware pour parser le JSON des requêtes
app.use(express.json());

// Activer CORS pour toutes les routes
app.use(cors());

// Utilisation des routes pour gérer les produits
app.use("/tb", productRoutes);

// Servir les fichiers statiques du répertoire `dist` sans cache
app.use(express.static(path.join(__dirname, "..", "dist"), {
  etag: false, 
  lastModified: false, 
  setHeaders: (res) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  }
}));

// Middleware pour servir le front-end pour toutes les autres routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "dist", "index.html"));
});

// Middleware pour gérer les erreurs 404
app.use((req, res, next) => {
  res.status(404).json({ error: "Route non trouvée" });
});

// Middleware pour gérer les erreurs internes du serveur
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Erreur interne du serveur" });
});

// Désactivation explicite des ETags
app.set('etag', false);

// Suppression des en-têtes ETag et Last-Modified, et gestion du cache
app.use((req, res, next) => {
  res.removeHeader('ETag'); 
  res.removeHeader('Last-Modified'); 
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0'); 
  next();
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
