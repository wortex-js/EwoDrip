const express = require('express');
const router = express.Router();
const Product = require('../models/product');

router.get('/shop', async (req, res) => {
  const products = await Product.find();
  res.render('shop', { products });
});

router.get('/product/:id', async (req, res) => {
  const product = await Product.findById(req.params.id);
  res.render('product', { product });
});

module.exports = router;
