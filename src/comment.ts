import mongoose, { Schema, Document } from "mongoose";

export interface Comment extends Document {
    id?: number;        // ID của bình luận (tùy chọn, nếu cần thiết)
    user: string;       // Người dùng đã bình luận
    text: string;       // Nội dung bình luận
    createdAt: Date;    // Dấu thời gian khi bình luận được tạo
    productId: string;  // ID của sản phẩm 
    name: string;       // Tên của người dùng 
    rating?: number;    // Đánh giá tùy chọn (1-5 sao)
    
}

const CommentSchema: Schema = new Schema({
    id: { type: Number, unique: true }, // Tùy chọn, nếu bạn muốn có id theo cách riêng
    user: { type: String, required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    productId: { type: String, required: true },
    name: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5 },
    
});


const CommentModel = mongoose.model<Comment>("Comment", CommentSchema);

export default CommentModel;