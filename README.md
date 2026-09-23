# Application de Test - Analyse des Méthodes de Mise en Cache Web

## Description
Cette application a été développée pour la section 5 de mon travail de bachelor, intitulée "Mise en pratique". Elle permet de tester les performances des méthodes de mise en cache en utilisant un service worker et Redis.

## Technologies
- Vue.js
- Express
- Axios
- Bootstrap
- Redis
- MySQL

## Installation
Pour faire fonctionner cette application, il est nécessaire de suivre les étapes suivantes :

1. **Installer les dépendances :**
   `npm install`

2. **Configurer le fichier `.env` :**  
   Assurez-vous que les variables d'environnement nécessaires sont définies.

3. **Configurer MySQL et Redis :**  
   Vous devez avoir une base de données MySQL configurée et Redis installé sur votre machine.

4. **Construire l'application :**
   `npm run build`

5. **Démarrer le backend :**
   `npm start`

## Structure des Dossiers
- **backend** : Contient les fichiers pour gérer les routes, les contrôleurs et les modèles. Inclut également le client Redis pour la mise en cache, ainsi que le fichier `index.js`, qui configure Express.
  
- **k6-tests** : Contient le script nécessaire pour effectuer les tests de performance avec k6.

- **mysql** : Comprend les scripts d'insertion de données et les données qui ont été insérées dans la base de données.

- **public** : Contient le service worker.

- **src** : Comprend les assets et les composants de l'application, ainsi que les fichiers principaux comme `App.vue`, `main.js`, et `router.js`.

## Remarque
Cette application nécessite une configuration préalable de la base de données MySQL et de Redis. Il est important de noter que sans ces configurations, l'application ne sera pas fonctionnelle. De plus, pour lancer les tests sur Grafana k6, vous devez vous connecter à votre compte k6.
