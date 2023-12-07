require('dotenv').config(); // Charge les variables d'environnement depuis le fichier .env

const express = require('express');
const cors = require('cors');
const errorHandler = require('./middlewares/errorsHandling');
const config = require('./config');
const routes = require('./routes');
const { MongoClient } = require('mongodb'); // Import du client MongoDB

const app = express();

// Récupère la chaîne de connexion MongoDB depuis les variables d'environnement
const mongoURI = process.env.MONGODB_URI;


// Connexion à la base de données MongoDB
MongoClient.connect(mongoURI)
  .then((client) => {
    const db = client.db(); // Utilisation de la base de données par défaut

    // Injecter la connexion MongoDB dans l'application
    app.locals.db = db;
    console.error('connecting Bien Vu');

    // Reste du code pour la configuration de votre serveur Express
    // ...
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
    // Gérer les erreurs de connexion ici
  });

module.exports = app;
