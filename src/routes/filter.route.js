const express = require('express');

const router = express.Router();
const productController = require('../controllers/filter.controller');

router.post('/filter', productController.postFilter);
router.get('/filter-stock', productController.getFilters);
router.get('/filter/metrics', productController.getFilterMetrics);
router.get('/filtered-products', productController.getProductFiltered);

module.exports = router;
