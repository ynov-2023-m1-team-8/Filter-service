const { PrismaClient } = require('@prisma/client');

const throwError = require('../utils/throwError');


/*exports.getFilteredProducts = async (req, res, next) => {
  try {
    const { min, max } = req.query;
    const products = await app.locals.db.collection('Products').find({
      price: {
        $gte: parseInt(min), // greater than or equal to (>=)
        $lte: parseInt(max), // less than or equal to (<=)
      },
    }).toArray();

    if (!products || products.length === 0) {
      const err = throwError('No products found for the given price range', 404);
      return next(err);
    }

    // Log the filter choice for analytics (anonymously)
    const filterChoice = { min, max };
    console.log('Filter Choice:', filterChoice);

    // Store the filter choice in MongoDB 
    const analyticsCollection = app.locals.db.collection('FilterAnalytics');
    await analyticsCollection.insertOne(filterChoice);

    return res.json({
      success: true,
      data: products,
    });
  } catch (err) {
    return next(err);
  }
};

exports.getFilterMetrics = async (req, res, next) => {
  try {
    // Use MongoDB aggregation to calculate metrics
    const analyticsCollection = app.locals.db.collection('FilterAnalytics');
    const metrics = await analyticsCollection.aggregate([
      // Add your aggregation stages here
      // Example: { $group: { _id: null, avgMin: { $avg: '$min' } } }
    ]).toArray();

    return res.json({
      success: true,
      data: metrics,
    });
  } catch (err) {
    return next(err);
  }
};*/

exports.postFilter = async (req, res, next) => {
  try {
    const { minPrice, maxPrice } = req.body;

    // Enregistrez les choix de filtres dans la collection "FilterAnalytics" de MongoDB
    const filterChoice = { minPrice, maxPrice };
    const analyticsCollection = req.app.locals.db.collection('FilterAnalytics');
    await analyticsCollection.insertOne(filterChoice);

    return res.status(200).json({ success: true, data: filterChoice });
  } catch (error) {
    console.error('Erreur lors de la soumission des filtres :', error);
    return res.status(500).json({ error: 'Une erreur est survenue' });
  }
};


exports.getFilters = async (req, res, next) => {
  try {
    // Récupérez les choix de filtres depuis la collection "FilterAnalytics" de MongoDB
    const analyticsCollection = req.app.locals.db.collection('FilterAnalytics');
    const filters = await analyticsCollection.find({}).toArray();

    return res.status(200).json({
      success: true,
      data: filters,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des filtres :', error);
    return res.status(500).json({ error: 'Une erreur est survenue' });
  }
};



exports.getFilterMetrics = async (req, res, next) => {
  try {
    // Calculer la moyenne des prix minimum et maximum
    const avgPrices = await req.app.locals.db.collection('FilterAnalytics').aggregate([
      {
        $group: {
          _id: null,
          avgMinPrice: { $avg: '$minPrice' },
          avgMaxPrice: { $avg: '$maxPrice' },
        },
      },
    ]).toArray();

    // Stocker les résultats dans la collection "Metrics" de MongoDB 
    const metricsCollection = req.app.locals.db.collection('Metrics');
    await metricsCollection.insertOne({
      type: 'filterMetrics',
      data: avgPrices,
    });

    
    return res.json({
      success: true,
      data: avgPrices,
    });
  } catch (err) {
    return next(err);
  }
};
