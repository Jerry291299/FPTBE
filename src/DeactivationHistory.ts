import mongoose, { Schema, Document } from "mongoose";

interface IDeactivationHistory extends Document {
  userId: mongoose.Types.ObjectId;
  reason: string;
  deactivatedBy: mongoose.Types.ObjectId;
  deactivatedAt: Date;
}

const DeactivationHistorySchema: Schema = new Schema({
  userId: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  reason: { type: String, required: true },
  deactivatedBy: { type: mongoose.Types.ObjectId, required: true, ref: "User" }, // Người thực hiện hành động
  deactivatedAt: { type: Date, default: Date.now },
});

const DeactivationHistory = mongoose.model<IDeactivationHistory>(
  "DeactivationHistory",
  DeactivationHistorySchema
);

export default DeactivationHistory;