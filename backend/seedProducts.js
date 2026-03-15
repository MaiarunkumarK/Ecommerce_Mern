// seedProducts.js

require("dotenv").config();
const mongoose = require("mongoose");

/* -------------------- MongoDB Connection -------------------- */

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error(err));

/* -------------------- Product Schema -------------------- */

const productSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    price: Number,
    stock: Number,
    image: String,
    category: String,
    is_active: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

/* -------------------- Product Data -------------------- */

const categories = [
  "Shoes",
  "Electronics",
  "Clothing",
  "Furniture",
  "Accessories"
];

const images = [
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
  "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519",
  "https://images.unsplash.com/photo-1608231387042-66d1773070a5",
  "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77",
  "https://images.unsplash.com/photo-1517336714731-489689fd1ca8",
  "https://images.unsplash.com/photo-1587202372775-e229f172b9d7",
  "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b",
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85"
];

const names = [
  "Nike Air Max",
  "Adidas Ultraboost",
  "Puma Running Shoes",
  "Reebok Classic",
  "Gaming Mouse",
  "Bluetooth Speaker",
  "Smart Watch",
  "Leather Sofa",
  "Office Chair",
  "Denim Jacket"
];

/* -------------------- Generate 200 Products -------------------- */

const generateProducts = () => {
  const products = [];

  for (let i = 1; i <= 200; i++) {
    products.push({
      name: names[Math.floor(Math.random() * names.length)] + " " + i,
      description: "High quality product with premium build",
      price: Math.floor(Math.random() * 9000) + 1000,
      stock: Math.floor(Math.random() * 150) + 10,
      image: images[Math.floor(Math.random() * images.length)],
      category: categories[Math.floor(Math.random() * categories.length)],
      is_active: true
    });
  }

  return products;
};

/* -------------------- Seed Database -------------------- */

const seedProducts = async () => {
  try {
    await Product.deleteMany();

    const products = generateProducts();

    await Product.insertMany(products);

    console.log("✅ 200 Products Inserted Successfully");

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedProducts();
