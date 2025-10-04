const express = require('express');
const router = express.Router();
const { createCheckoutSession } = require('../utils/stripe');

router.post('/checkout', async (req,res)=>{
  const cart = req.session.cart || [];
  if(cart.length===0) return res.redirect('/cart');
  const session = await createCheckoutSession(cart);
  res.json({ id: session.id });
});

module.exports = router;
