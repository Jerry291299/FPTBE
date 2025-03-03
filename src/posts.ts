import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";


export interface ITintuc extends Document {
    title: string;
    content: string;
    descriptions: string;
    img: string;
}

const TintucSchema: Schema = new Schema({
    title: { type: String, required: true },
    img: [{ type: String, required: true }],
    content: { type: String, required: true },
    descriptions: { type: String, required: true }
});

TintucSchema.plugin(mongoosePaginate);
const Tintuc = mongoose.model<ITintuc, mongoose.PaginateModel<ITintuc>>(
    "Posts",
    TintucSchema
);

export default Tintuc