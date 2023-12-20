const express = require('express');
const productRoute = require('./filter.route');

const router = express.Router();

router.use('/products', productRoute);

module.exports = router;
