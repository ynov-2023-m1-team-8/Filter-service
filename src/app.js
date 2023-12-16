const express = require('express');
require('dotenv').config();
const cors = require('cors');
const errorHandler = require('./middlewares/errorsHandling');
const config = require('./config');
const routes = require('./routes');
const { MongoClient } = require('mongodb');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

const mongoURI = process.env.MONGODB_URI;

// Connect to MongoDB
MongoClient.connect(process.env.MONGODB_URI)
  .then((client) => {
    const db = client.db('mystorereplica');

    
    app.locals.db = db;
    console.log('Connected to MongoDB');

    // Function to replicate a single product 
    const replicateProducts = async (productId) => {
      try {
        // Read data for a unique product from SQLite
        const sqliteData = await prisma.product.findUnique({
          where: { id: productId },
        });

        // Check if the product already exists in MongoDB
        const mongoCollection = db.collection('Products');
        const existingProduct = await mongoCollection.findOne({
          id: productId,
        });

        if (!existingProduct) {
          // If the product doesn't exist, insert it into the newDB(mongodb)
          await mongoCollection.insertOne(sqliteData);
          console.log(`Product ${productId} replicated successfully`);
        } else {
          console.log(`Product ${productId} already exists in MongoDB`);
        }
      } catch (error) {
        console.error(`Error replicating product ${productId}:`, error);
      }
    };

    //  Data synchro start after successful connection
    setInterval(async () => {
      try {
        // Read  products IDs from SQLite
        const productIds = await prisma.product.findMany({
          select: { id: true },
        });

        // Replicate the  products to MongoDB (if not synchronized)
        for (const { id } of productIds) {
          await replicateProducts(id);
        }
      } catch (error) {
        console.error('Error synchronizing data:', error);
      }
    }, 60000);

    // cors
    app.use(
      cors({
        origin: config.frontend_url,
      })
    );

    // access to public folder
    app.use(express.static(__dirname + '/public'));

    // initial route
    app.get('/', (req, res) => {
      res.send({ message: 'Welcome to app-store-api application.' });
    });

    // api routes prefix
    app.use('/api', routes);

    // error handling
    app.use(errorHandler);

    // run server
    app.listen(config.port, () => {
      console.log('Server launched');
    });
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });

module.exports = app;
