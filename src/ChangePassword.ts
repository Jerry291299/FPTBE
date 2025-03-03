import mongoose,{ Schema ,Document} from "mongoose";
export interface ChangePassword extends Document {
    userId: string; // ID của người dùng
    oldPassword: string; // Mật khẩu cũ
    newPassword: string; // Mật khẩu mới
    changedAt: Date; // Thời gian thay đổi mật khẩu
    changedBy: string; // ID của admin hoặc hệ thống
  }
  
  const ChangePasswordSchema: Schema = new Schema(
    {
      userId: { type: String, required: true },
      oldPassword: { type: String, required: true },
      newPassword: { type: String, required: true },
      changedAt: { type: Date, default: Date.now },
      changedBy: { type: String, required: true },
    },
    { timestamps: true } // Thêm timestamps
  );
  
  export default mongoose.model<ChangePassword>("ChangePassword", ChangePasswordSchema);