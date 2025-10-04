const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function createCheckoutSession(cartItems){
  const line_items = cartItems.map(item => ({
    price_data: {
      currency: 'usd',
      product_data: { name: item.name },
      unit_amount: item.price * 100
    },
    quantity: 1
  }));
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items,
    mode: 'payment',
    success_url: 'http://localhost:3000/shop',
    cancel_url: 'http://localhost:3000/cart'
  });
  return session;
}

module.exports = { createCheckoutSession };

