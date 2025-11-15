import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "./db";
import { storagePut } from "./storage";
import crypto from "crypto";
import { stripeRouter } from "./stripe-router";

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  stripe: stripeRouter,
  
  settings: router({
    get: publicProcedure
      .input(z.object({ key: z.string() }))
      .query(async ({ input }) => {
        return await db.getSetting(input.key);
      }),
    
    getAll: publicProcedure
      .query(async () => {
        return await db.getAllSettings();
      }),
    
    upsert: adminProcedure
      .input(z.object({
        key: z.string(),
        value: z.string(),
      }))
      .mutation(async ({ input }) => {
        await db.upsertSetting(input.key, input.value);
        return { success: true };
      }),
  }),
  
  upload: router({
    image: protectedProcedure
      .input(z.object({
        fileName: z.string(),
        fileData: z.string(),
        contentType: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const buffer = Buffer.from(input.fileData, 'base64');
        const randomSuffix = crypto.randomBytes(8).toString('hex');
        const ext = input.fileName.split('.').pop();
        const fileKey = `products/${ctx.user.id}-${randomSuffix}.${ext}`;
        
        const { url } = await storagePut(fileKey, buffer, input.contentType);
        return { url, key: fileKey };
      }),
  }),

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  categories: router({
    list: publicProcedure.query(async () => {
      return await db.getAllCategories();
    }),
    
    create: adminProcedure
      .input(z.object({
        name: z.string(),
        slug: z.string(),
        description: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.createCategory(input);
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteCategory(input.id);
        return { success: true };
      }),
  }),

  products: router({
    list: publicProcedure.query(async () => {
      return await db.getAllProducts();
    }),
    
    featured: publicProcedure.query(async () => {
      return await db.getFeaturedProducts();
    }),
    
    search: publicProcedure
      .input(z.object({
        query: z.string().optional(),
        categoryId: z.number().optional(),
        minPrice: z.number().optional(),
        maxPrice: z.number().optional(),
        inStock: z.boolean().optional(),
        sortBy: z.enum(['price-asc', 'price-desc', 'name-asc', 'name-desc', 'date-desc']).optional(),
      }))
      .query(async ({ input }) => {
        return await db.searchProducts(input);
      }),
    
    byCategory: publicProcedure
      .input(z.object({ categoryId: z.number() }))
      .query(async ({ input }) => {
        return await db.getProductsByCategory(input.categoryId);
      }),
    
    byId: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getProductById(input.id);
      }),
    
    bySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        return await db.getProductBySlug(input.slug);
      }),
    
    create: adminProcedure
      .input(z.object({
        name: z.string(),
        slug: z.string(),
        description: z.string().optional(),
        price: z.number(),
        categoryId: z.number().optional(),
        images: z.string().optional(),
        stock: z.number().default(0),
        featured: z.boolean().default(false),
      }))
      .mutation(async ({ input }) => {
        return await db.createProduct(input);
      }),
    
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        slug: z.string().optional(),
        description: z.string().optional(),
        price: z.number().optional(),
        categoryId: z.number().optional(),
        images: z.string().optional(),
        stock: z.number().optional(),
        featured: z.boolean().optional(),
        active: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateProduct(id, data);
        return { success: true };
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteProduct(input.id);
        return { success: true };
      }),
  }),

  cart: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getCartItems(ctx.user.id);
    }),
    
    add: protectedProcedure
      .input(z.object({
        productId: z.number(),
        quantity: z.number().default(1),
      }))
      .mutation(async ({ ctx, input }) => {
        const product = await db.getProductById(input.productId);
        if (!product) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Product not found' });
        }
        
        const existingCartItem = await db.getCartItemByUserAndProduct(ctx.user.id, input.productId);
        const currentQuantity = existingCartItem?.quantity || 0;
        const newTotalQuantity = currentQuantity + input.quantity;
        
        if (newTotalQuantity > product.stock) {
          throw new TRPCError({ 
            code: 'BAD_REQUEST', 
            message: `Only ${product.stock} items available in stock` 
          });
        }
        
        return await db.addToCart({
          userId: ctx.user.id,
          productId: input.productId,
          quantity: input.quantity,
        });
      }),
    
    updateQuantity: protectedProcedure
      .input(z.object({
        id: z.number(),
        quantity: z.number(),
      }))
      .mutation(async ({ input }) => {
        const cartItem = await db.getCartItemById(input.id);
        if (!cartItem) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Cart item not found' });
        }
        
        const product = await db.getProductById(cartItem.productId);
        if (!product) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Product not found' });
        }
        
        if (input.quantity > product.stock) {
          throw new TRPCError({ 
            code: 'BAD_REQUEST', 
            message: `Only ${product.stock} items available in stock` 
          });
        }
        
        await db.updateCartItemQuantity(input.id, input.quantity);
        return { success: true };
      }),
    
    remove: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.removeFromCart(input.id);
        return { success: true };
      }),
    
    clear: protectedProcedure.mutation(async ({ ctx }) => {
      await db.clearCart(ctx.user.id);
      return { success: true };
    }),
  }),

  orders: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserOrders(ctx.user.id);
    }),
    
    listAll: adminProcedure.query(async () => {
      return await db.getAllOrders();
    }),
    
    byId: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const order = await db.getOrderById(input.id);
        if (!order) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Order not found' });
        }
        if (order.userId !== ctx.user.id && ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' });
        }
        return order;
      }),
    
    items: protectedProcedure
      .input(z.object({ orderId: z.number() }))
      .query(async ({ ctx, input }) => {
        const order = await db.getOrderById(input.orderId);
        if (!order) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Order not found' });
        }
        if (order.userId !== ctx.user.id && ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' });
        }
        return await db.getOrderItems(input.orderId);
      }),
    
    create: protectedProcedure
      .input(z.object({
        shippingAddress: z.string(),
        shippingCity: z.string(),
        shippingPostalCode: z.string(),
        shippingCountry: z.string(),
        customerName: z.string(),
        customerEmail: z.string().email(),
        customerPhone: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const cartItems = await db.getCartItems(ctx.user.id);
        if (cartItems.length === 0) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cart is empty' });
        }
        
        const totalAmount = cartItems.reduce((sum, item) => {
          return sum + (item.productPrice || 0) * item.quantity;
        }, 0);
        
        const orderResult = await db.createOrder({
          userId: ctx.user.id,
          totalAmount,
          status: 'pending',
          ...input,
        });
        
        const orderId = Number((orderResult as any).insertId);
        
        for (const item of cartItems) {
          await db.createOrderItem({
            orderId,
            productId: item.productId || 0,
            productName: item.productName || '',
            productPrice: item.productPrice || 0,
            quantity: item.quantity,
          });
        }
        
        return { orderId, success: true };
      }),
    
    updateStatus: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
      }))
      .mutation(async ({ input }) => {
        await db.updateOrderStatus(input.id, input.status);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
