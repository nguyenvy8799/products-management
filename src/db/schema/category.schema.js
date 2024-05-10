import mongoose from "mongoose";

export const CategorySchema = new mongoose.Schema({
  // Ten danh muc
  name: {
    type: String,
  },
  // Mo ta cua danh muc
  desc: {
    type: String,
  },
});
