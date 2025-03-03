import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String ,required: true },
    email: { type: String },
    address: { type: String, required: true },
    notes: { type: String },
  },
  { timestamps: true }
);

const Customer = mongoose.model("Customer", customerSchema);
export default Customer;