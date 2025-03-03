import { Schema, model, Document } from 'mongoose';

interface IVoucher extends Document {
  code: string;
  discountAmount: number; 
  expirationDate: Date;
  isActive: boolean;
  quantity: number;
  createdAt: Date;
}

const voucherSchema = new Schema<IVoucher>({
  code: { type: String, required: true, unique: true },
  discountAmount: { type: Number, required: true },
  expirationDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  quantity: { type: Number, required: true, default: 1 },
  createdAt: { type: Date, default: Date.now },
});

const Voucher = model<IVoucher>('Voucher', voucherSchema);

export { Voucher, IVoucher };