import express from "express";
import { create as createHbs } from "express-handlebars";
import { connectMongoDB } from "./db/conn.js";
import { ProductModel } from "./db/model/product.model.js";
import { CategoryModel } from "./db/model/category.model.js";

// Tao app
const app = express();

// Cau hinh Handlebars
const hbs = createHbs({
  defaultLayout: "main",
  extname: "hbs",
  layoutsDir: "views/layout",
  partialsDir: "views/partials",
  helpers: {
    eq: (left, right) => {
      return left === right;
    },
  },
});

app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");
app.set("views", "views/pages");

// Cau hinh static files
app.use(express.static("public"));

connectMongoDB();

// Route render trang products
app.get("/products", async (req, res) => {
  const products = await ProductModel.find();
  const categories = await CategoryModel.find();

  console.log("Products", products);

  res.render("products", {
    pageCode: "product",
    products: JSON.parse(JSON.stringify(products)),
    categories: JSON.parse(JSON.stringify(categories)),
  });
});

// Run app
app.listen(3000, () => {
  console.log("App is running on port 3000");
});
