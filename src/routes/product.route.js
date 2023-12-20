const express = require('express');

const router = express.Router();
// eslint-disable-next-line import/no-unresolved
const productController = require('../controllers/product.controller');

router.post('/filter', productController.postFilter);
router.get('/filter-stock', productController.getFilters);
router.get('/filter/metrics', productController.getFilterMetrics);

module.exports = router;
