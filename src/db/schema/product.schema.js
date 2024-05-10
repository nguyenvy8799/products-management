import mongoose from "mongoose";

// Dinh nghia cau truc du lieu cho san pham
export const ProductSchema = new mongoose.Schema({
  // Ten san pham
  name: {
    type: String,
  },
  // Mo ta cua san pham
  desc: {
    type: String,
  },
  // So luong san pham con trong kho
  unitInStock: {
    type: Number,
  },
  // Gia san pham
  price: {
    type: Number,
  },
  // Danh muc ID
  categoryId: {
    type: mongoose.Types.ObjectId,
  },
});
