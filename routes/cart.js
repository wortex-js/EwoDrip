const express = require('express');
const router = express.Router();

router.get('/cart', (req,res)=>{
  const cart = req.session.cart || [];
  res.render('cart', { cart });
});

router.post('/cart/add', (req,res)=>{
  const { id, name, price } = req.body;
  if(!req.session.cart) req.session.cart = [];
  req.session.cart.push({ id, name, price });
  res.redirect('/cart');
});

router.post('/cart/remove', (req,res)=>{
  const index = req.body.index;
  if(req.session.cart) req.session.cart.splice(index,1);
  res.redirect('/cart');
});

module.exports = router;
