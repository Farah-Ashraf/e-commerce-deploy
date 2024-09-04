import { Schema, model } from "mongoose";

//schema
const reviewSchema = new Schema({

    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    product:{
        type: Schema.Types.ObjectId,
        ref: 'Product'
    },
    comment: {
        type: String,
        required: true
    },
    rate: {
        type: Number,
        min: 0,
        max: 5
    }

},{ 
    timestamps: true 
});

//model
export const Review = model('Review', reviewSchema);