import Stripe from 'stripe';

const key = process.env.STRIPE_SECRET_KEY;

if (!key) {
  console.error('❌ STRIPE_SECRET_KEY environment variable is not set!');
  process.exit(1);
}

console.log('Testing Stripe with key:', key.substring(0, 20) + '...');

try {
  const stripe = new Stripe(key, {
    apiVersion: '2025-10-29.clover',
  });
  console.log('✅ Stripe initialized successfully!');
  
  // Try to create a test session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: { name: 'Test Product' },
        unit_amount: 1000,
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: 'http://localhost:3000/success',
    cancel_url: 'http://localhost:3000/cancel',
  });
  
  console.log('✅ Checkout session created!');
  console.log('Session URL:', session.url);
} catch (error) {
  console.error('❌ Error:', error.message);
}
