const { PrismaClient } = require('@prisma/client');

const throwError = require('../utils/throwError');

const prisma = new PrismaClient();

exports.getProducts = async (req, res, next) => {
  try {
    console.log(req.params, 'minminn');
    const products = await prisma.product.findMany({
      where: { active: true },
      take: req.query.take ? Number(req.query.take) : 8,
    });
    if (!products) {
      const err = throwError('No products found', 404);
      return next(err);
    }
    return res.send(
      {
        success: true,
        data: products,
      },
    );
  } catch (err) {
    return next(err);
  }
};
exports.getProductFiltered = async (req, res, next) => {
  try {
    console.log(req.query)
    const { min, max } = req.query;
    console.log(min, 'minminn');
    if (!min && !max) {
      const err = throwError('No product id provided', 404);
      return next(err);
    }
    const product = await prisma.product.findMany({
      where: {
        price: {
          gte: min, // greater than or equal to (>=)
          lte: max, // less than or equal to (<=)
        },
      },
    });
    if (!product) {
      const err = throwError('Product not found', 404);
      return next(err);
    }
    return res.json(
      {
        data: product,
        sucess: true,
      },
    );
  } catch (err) {
    return next(err);
  }
};

exports.getProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      const err = throwError('No product id provided', 404);
      next(err);
    }
    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
    });
    if (!product) {
      const err = throwError('Product not found', 404);
      return next(err);
    }
    return res.json(
      {
        data: product,
        sucess: true,
      },
    );
  } catch (err) {
    return next(err);
  }
};
