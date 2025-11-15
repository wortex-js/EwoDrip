import express from 'express';
import Stripe from 'stripe';
import { getDb } from './db';
import { orders } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

import { ENV } from './_core/env';

let stripe: Stripe | null = null;

if (ENV.stripeSecretKey) {
  stripe = new Stripe(ENV.stripeSecretKey, {
    apiVersion: '2025-10-29.clover',
  });
}

export function registerStripeWebhook(app: express.Application) {
  app.post(
    '/api/stripe/webhook',
    express.raw({ type: 'application/json' }),
    async (req, res) => {
      if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
        console.warn('[Webhook] Stripe not configured, skipping webhook');
        return res.status(400).send('Stripe not configured');
      }
      
      const sig = req.headers['stripe-signature'];

      if (!sig) {
        console.error('[Webhook] Missing stripe-signature header');
        return res.status(400).send('Missing signature');
      }

      let event: Stripe.Event;

      try {
        event = stripe.webhooks.constructEvent(
          req.body,
          sig,
          process.env.STRIPE_WEBHOOK_SECRET!
        );
      } catch (err: any) {
        console.error('[Webhook] Signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }

      if (event.id.startsWith('evt_test_')) {
        console.log('[Webhook] Test event detected, returning verification response');
        return res.json({ verified: true });
      }

      console.log('[Webhook] Received event:', event.type, event.id);

      try {
        switch (event.type) {
          case 'checkout.session.completed': {
            const session = event.data.object as Stripe.Checkout.Session;
            console.log('[Webhook] Checkout completed:', session.id);

            const orderId = session.metadata?.order_id;
            if (!orderId) {
              console.error('[Webhook] No order_id in metadata');
              break;
            }

            const db = await getDb();
            if (!db) {
              console.error('[Webhook] Database not available');
              break;
            }

            const order = await db
              .select()
              .from(orders)
              .where(eq(orders.id, parseInt(orderId)))
              .limit(1);

            if (order.length === 0) {
              console.error('[Webhook] Order not found:', orderId);
              break;
            }

            await db
              .update(orders)
              .set({
                status: 'processing',
                paymentIntentId: session.payment_intent as string,
              })
              .where(eq(orders.id, parseInt(orderId)));

            const { clearCart, getOrderItems, decreaseProductStock } = await import('./db');
            
            const orderItems = await getOrderItems(parseInt(orderId));
            for (const item of orderItems) {
              await decreaseProductStock(item.productId, item.quantity);
            }
            
            await clearCart(order[0].userId);

            console.log('[Webhook] Order updated, stock decreased, and cart cleared:', orderId);
            break;
          }

          case 'payment_intent.succeeded': {
            const paymentIntent = event.data.object as Stripe.PaymentIntent;
            console.log('[Webhook] Payment succeeded:', paymentIntent.id);
            break;
          }

          case 'payment_intent.payment_failed': {
            const paymentIntent = event.data.object as Stripe.PaymentIntent;
            console.log('[Webhook] Payment failed:', paymentIntent.id);
            break;
          }

          default:
            console.log('[Webhook] Unhandled event type:', event.type);
        }

        res.json({ received: true });
      } catch (error) {
        console.error('[Webhook] Error processing event:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
      }
    }
  );
}
