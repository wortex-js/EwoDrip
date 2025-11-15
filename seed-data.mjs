import { drizzle } from "drizzle-orm/mysql2";
import { categories, products } from "./drizzle/schema.js";

const db = drizzle(process.env.DATABASE_URL);

async function seed() {
  console.log("Starting database seed...");

  // Create categories
  console.log("Creating categories...");
  await db.insert(categories).values([
    { name: "Hoodies", slug: "hoodies", description: "Premium streetwear hoodies" },
    { name: "Pants", slug: "pants", description: "Urban style pants and joggers" },
    { name: "Jackets", slug: "jackets", description: "Statement jackets and outerwear" },
    { name: "Complete Outfits", slug: "outfits", description: "Full drip outfits" },
  ]);

  // Get category IDs
  const allCategories = await db.select().from(categories);
  const hoodiesCat = allCategories.find(c => c.slug === "hoodies");
  const pantsCat = allCategories.find(c => c.slug === "pants");
  const jacketsCat = allCategories.find(c => c.slug === "jackets");
  const outfitsCat = allCategories.find(c => c.slug === "outfits");

  // Create products
  console.log("Creating products...");
  await db.insert(products).values([
    {
      name: "Black Gothic Hoodie",
      slug: "black-gothic-hoodie",
      description: "Premium black hoodie with gothic print. Perfect for the streets.",
      price: 8999, // $89.99
      categoryId: hoodiesCat?.id,
      images: JSON.stringify(["/products/hoodie-1.jpg"]),
      stock: 50,
      featured: true,
      active: true,
    },
    {
      name: "Drip Graphic Hoodie",
      slug: "drip-graphic-hoodie",
      description: "Statement hoodie with bold graphics. Stand out from the crowd.",
      price: 9499, // $94.99
      categoryId: hoodiesCat?.id,
      images: JSON.stringify(["/products/hoodie-2.jpg"]),
      stock: 45,
      featured: true,
      active: true,
    },
    {
      name: "Shadow Black Hoodie",
      slug: "shadow-black-hoodie",
      description: "Classic black hoodie with modern fit. Essential streetwear piece.",
      price: 7999, // $79.99
      categoryId: hoodiesCat?.id,
      images: JSON.stringify(["/products/hoodie-3.jpg"]),
      stock: 60,
      featured: true,
      active: true,
    },
    {
      name: "Gothic Cargo Pants",
      slug: "gothic-cargo-pants",
      description: "Premium cargo pants with unique patchwork design. Urban style redefined.",
      price: 11999, // $119.99
      categoryId: pantsCat?.id,
      images: JSON.stringify(["/products/pants-1.jpg"]),
      stock: 40,
      featured: true,
      active: true,
    },
    {
      name: "Monochrome Puffer Jacket",
      slug: "monochrome-puffer-jacket",
      description: "Sleek black and grey puffer jacket. Warmth meets style.",
      price: 15999, // $159.99
      categoryId: jacketsCat?.id,
      images: JSON.stringify(["/products/jacket-1.jpg"]),
      stock: 30,
      featured: true,
      active: true,
    },
    {
      name: "Complete Black Drip Set",
      slug: "complete-black-drip-set",
      description: "Full outfit set - hoodie, pants, and accessories. Maximum drip guaranteed.",
      price: 24999, // $249.99
      categoryId: outfitsCat?.id,
      images: JSON.stringify(["/products/outfit-1.jpg"]),
      stock: 20,
      featured: true,
      active: true,
    },
    {
      name: "Urban Essentials Hoodie",
      slug: "urban-essentials-hoodie",
      description: "Minimalist black hoodie. Clean design, maximum impact.",
      price: 6999, // $69.99
      categoryId: hoodiesCat?.id,
      images: JSON.stringify(["/products/hoodie-1.jpg"]),
      stock: 70,
      featured: false,
      active: true,
    },
    {
      name: "Street Elite Hoodie",
      slug: "street-elite-hoodie",
      description: "Premium quality hoodie for the streets. Comfort and style combined.",
      price: 8499, // $84.99
      categoryId: hoodiesCat?.id,
      images: JSON.stringify(["/products/hoodie-2.jpg"]),
      stock: 55,
      featured: false,
      active: true,
    },
  ]);

  console.log("Seed completed successfully!");
}

seed()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .then(() => {
    process.exit(0);
  });
