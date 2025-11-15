import { drizzle } from "drizzle-orm/mysql2";
import { settings } from "./drizzle/schema.ts";

const db = drizzle(process.env.DATABASE_URL);

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripePublishableKey = process.env.STRIPE_PUBLISHABLE_KEY;

await db.insert(settings).values({
  key: "stripe_secret_key",
  value: stripeSecretKey,
}).onDuplicateKeyUpdate({ set: { value: stripeSecretKey } });

await db.insert(settings).values({
  key: "stripe_publishable_key",
  value: stripePublishableKey,
}).onDuplicateKeyUpdate({ set: { value: stripePublishableKey } });

console.log("✅ Stripe keys inserted into database!");
process.exit(0);
