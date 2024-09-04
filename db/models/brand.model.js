import { model, Schema } from "mongoose";

//schema
const brandSchema = new Schema({

    name: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true
    },
    logo: {
        type: Object,
        required: true
    },
    createdBy:{
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }

},{
    timestamps: true
})

//model
export const Brand = model('Brand', brandSchema)