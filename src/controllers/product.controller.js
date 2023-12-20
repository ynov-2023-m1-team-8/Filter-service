exports.postFilter = async (req, res) => {
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
