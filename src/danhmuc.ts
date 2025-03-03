import mongoose,{ Schema ,Document} from "mongoose";

export interface ICategory extends Document{
    _id: number;
    name: string;
    status: 'active' | 'deactive'; // Trường status có thể là 'active' hoặc 'deactive'
}const CategorySchema: Schema = new Schema({
    name: { type: String, required: true },
    status: { type: String, enum: ['active', 'deactive'], default: 'active' } // Mặc định là 'active'
})
export default mongoose.model<ICategory>('Category',CategorySchema);