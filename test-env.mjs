import { ENV } from './server/_core/env.ts';

console.log('=== Environment Variables Check ===');
console.log('STRIPE_SECRET_KEY exists:', !!process.env.STRIPE_SECRET_KEY);
console.log('STRIPE_SECRET_KEY length:', process.env.STRIPE_SECRET_KEY?.length || 0);
console.log('ENV.stripeSecretKey exists:', !!ENV.stripeSecretKey);
console.log('ENV.stripeSecretKey length:', ENV.stripeSecretKey?.length || 0);
console.log('ENV.stripeSecretKey value:', ENV.stripeSecretKey ? ENV.stripeSecretKey.substring(0, 20) + '...' : 'EMPTY');
