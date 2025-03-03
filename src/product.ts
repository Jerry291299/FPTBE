import mongoose, { Schema, Document } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";


export interface Product extends Document {
  masp: string;
  name: string; 
  price: number;
  img: string[]; 
  moTa: string;  
  category: mongoose.Schema.Types.ObjectId; 
  status: boolean;  
  createdAt: Date;
  updatedAt: Date;
}


const ProductSchema: Schema = new Schema(
  {
    masp: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    img: [{ type: String }],
    moTa: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    status: { type: Boolean, required: true },
  
  },
  { timestamps: true }
);



ProductSchema.index({ masp: 1, name: 1 }, { unique: true });


ProductSchema.plugin(mongoosePaginate);


const Product = mongoose.model<Product, mongoose.PaginateModel<Product>>(
  "Product",
  ProductSchema
);

export default Product;
