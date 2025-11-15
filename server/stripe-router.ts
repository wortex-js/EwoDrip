import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import Stripe from "stripe";
import { TRPCError } from "@trpc/server";
import { getSetting } from "./db";

async function getStripe(): Promise<Stripe | null> {
  try {
    const setting = await getSetting('stripe_secret_key');
    
    if (!setting || !setting.value) {
      console.error('[Stripe] stripe_secret_key not found in database settings');
      return null;
    }
    
    return new Stripe(setting.value, {
      apiVersion: '2025-10-29.clover',
    });
  } catch (error) {
    console.error('[Stripe] Initialization failed:', error);
    return null;
  }
}

export const stripeRouter = router({
  createCheckoutSession: protectedProcedure
    .input(z.object({
      orderId: z.number(),
      totalAmount: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      const stripe = await getStripe();
      if (!stripe) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'Stripe is not configured. Please add STRIPE_SECRET_KEY to environment variables.',
        });
      }
      
      const origin = ctx.req.headers.origin || 'http://localhost:3000';

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Order #' + input.orderId,
                description: 'EwoDrip Order',
              },
              unit_amount: input.totalAmount,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${origin}/orders?payment=success`,
        cancel_url: `${origin}/checkout?payment=cancelled`,
        customer_email: ctx.user.email || undefined,
        client_reference_id: ctx.user.id.toString(),
        metadata: {
          order_id: input.orderId.toString(),
          user_id: ctx.user.id.toString(),
          customer_email: ctx.user.email || '',
          customer_name: ctx.user.name || '',
        },
        allow_promotion_codes: true,
      });

      return { url: session.url };
    }),
});
