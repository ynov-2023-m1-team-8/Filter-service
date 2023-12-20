require('@prisma/client');

exports.postFilter = async (req, res) => {
  try {
    const { minPrice, maxPrice } = req.body;
    // console.log('price', minPrice, maxPrice);
    // Enregistrez les choix de filtres dans la collection "FilterAnalytics" de MongoDB
    const filterChoice = { minPrice, maxPrice };
    const analyticsCollection = req.app.locals.db.collection('FilterAnalytics');
    await analyticsCollection.insertOne({ minPrice, maxPrice });

    return res.status(200).json({ success: true, data: filterChoice });
  } catch (error) {
    console.error('Erreur lors de la soumission des filtres :', error);
    return res.status(500).json({ error: 'Une erreur est survenue' });
  }
};

exports.getFilters = async (req, res) => {
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

exports.getProductFiltered = async (req, res) => {
  const { min, max } = req.query;

  // Convertir les chaînes en nombres
  const minValue = parseFloat(min);
  const maxValue = parseFloat(max);
  const collection = req.app.locals.db.collection('Products');

  // Assurez-vous que collection est correctement défini
  if (collection) {
    try {
      const products = await collection.find({
        price: {
          $gte: minValue,
          $lte: maxValue,
        },
      }).toArray();

      // Faites quelque chose avec les produits trouvés
      console.log('Produits trouvés :', products);

      return res.json({
        data: products,
        success: true,
      });
    } catch (error) {
      // Gérez les erreurs de manière appropriée
      console.error(error);
      return res.status(500).json({
        error: 'Une erreur est survenue lors de la récupération des produits filtrés.',
        success: false,
      });
    }
  } else {
    console.error("La collection n'est pas correctement définie.");
    return res.status(500).json({
      error: 'La collection de produits n\'est pas correctement définie.',
      success: false,
    });
  }
};
