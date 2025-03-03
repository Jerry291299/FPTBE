import mongoose, { Document, Schema } from "mongoose";

export interface ICartItem {
  productId: mongoose.Schema.Types.ObjectId; 
  name: string; 
  price: number; 
  img: string; 
  quantity: number; 
  size: string;
}

export interface ICart extends Document {
  userId: mongoose.Schema.Types.ObjectId; 
  items: ICartItem[];
}

const cartSchema = new Schema<ICart>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      name: { type: String, required: true }, 
      price: { type: Number, required: true }, 
      img: [{ type: String, required: true }], 
      quantity: { type: Number, required: true },
      size: { type: String, required: true },
    },
  ],
});

const Cart = mongoose.model<ICart>("Cart", cartSchema);

export default Cart;