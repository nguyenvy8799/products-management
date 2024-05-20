import express from "express";
import { create as createHbs } from "express-handlebars";
import multer from "multer";
import { connectMongoDB } from "./db/conn.js";
import { ProductModel } from "./db/model/product.model.js";
import { CategoryModel } from "./db/model/category.model.js";
import mongoose from "mongoose";

const multerUploader = multer({
  // dest: "public/assets/img",
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "public/assets/img");
    },
    filename: function (req, file, cb) {
      
      const originalName = file.originalname;
      const [name, ext] = originalName.split(".");
      const filename = `${name}-${Date.now()}.${ext}`;

      cb(null, filename);
    },
  }),
});

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
// Cau hinh parse Req body
app.use(express.urlencoded());

connectMongoDB();

// Route render trang products
app.get("/products", async (req, res) => {
  const products = await ProductModel.find().lean();
  const categories = await CategoryModel.find().lean();

  res.render("products", {
    pageCode: "product",
    products,
    categories,
  });
});

// Route render trang Tao danh muc
app.get("/products/create-category", (req, res) => {
  res.render("create-category", {
    pageCode: "product",
  });
});

app.post("/products/create-category", async (req, res) => {
  const data = req.body;
  console.log("Data: ", data);

  // Cach 1: Tao Category document & dung method Document.save()
  // const category = new CategoryModel({
  //   name: data.name,
  //   desc: data.desc,
  // });
  // await category.save();

  // Cach 2: Dung method CategoryModel.create()
  await CategoryModel.create({
    name: data.name,
    desc: data.desc,
  });

  res.redirect("/products");
});

app.get("/products/category/:id", async (req, res) => {
  const id = req.params.id;
  const category = await CategoryModel.findById(id).lean();
  console.log("Category: ", category);

  res.render("create-category", {
    pageCode: "product",
    category,
    isEditing: true,
  });
});

app.post("/products/category/:id", async (req, res) => {
  const id = req.params.id;
  const data = req.body;
  console.log("Data: ", data);

  // Cap nhat du lieu moi cho danh muc trong MongoDB
  await CategoryModel.updateOne(
    // Filter object
    {
      _id: id,
    },
    // Update object
    {
      $set: {
        name: data.name,
        desc: data.desc,
      },
    }
  );

  res.redirect("/products");
});

app.get("/products/category/:id/delete", async (req, res) => {
  const id = req.params.id;

  // Xoa danh muc trong MongoDB
  await CategoryModel.deleteOne({
    _id: id,
  });

  res.redirect("/products");
});

app.delete("/products/category/:id", async (req, res) => {
  const id = req.params.id;

  // Xoa danh muc trong MongoDB
  await CategoryModel.deleteOne({
    _id: id,
  });

  res.json({
    status: true,
  });
});

// Route hien thi trang them moi san pham
app.get("/products/create-product", async (req, res) => {
  // Lay danh sach danh muc
  const categories = await CategoryModel.find().lean();

  res.render("create-product", {
    pageCode: "product",
    categories,
  });
});

app.post(
  "/products/create-product",
  multerUploader.single("image"),
  async (req, res) => {
    // Du lieu truyen theo
    const file = req.file;
    console.log("Product image file: ", file);
    const data = req.body;
    console.log("Product Data: ", data);

    // Tao san pham & luu vao mongoDB
    const product = new ProductModel({
      name: data.name,
      desc: data.desc,
      price: data.price,
      unitInStock: data.unitInStock,
      categoryId: data.categoryId,
      imageUrl: `/assets/img/${file.filename}`,
    });
    await product.save();

    res.redirect("/products");
  }
);

// Run app
app.listen(3000, () => {
  console.log("App is running on port 3000");
});
