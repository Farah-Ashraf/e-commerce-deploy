import { model, Schema } from "mongoose";

//schema
const productSchema = new Schema({

    //title
    title: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    //related ids
    category: {
        type: Schema.Types.ObjectId,
        ref: "Category",
        required: true
    },
    subcategory: {
        type: Schema.Types.ObjectId,
        ref: "Subcategory",
        required: true
    },
    brand: {
        type: Schema.Types.ObjectId,
        ref: "Brand",
        required: true
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    //images
    mainImage: {
        type: Object,
        required: true
    },
    subImages: [Object],
    //price
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    discount: {
        type: Number,
        min: 0,
    },

    //specifications
    size: [String],
    colors: [String],
    stock: {
        type: Number,
        min: 0,
        default: 1
    }
},{
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true } 
})

//virtual
productSchema.virtual('finalPrice').get(function () {
   return this.price - (this.price * ((this.discount || 0) / 100))
})

//create method inStock that can be appplied on any product document
productSchema.methods.inStock = function(quantity) {
    return this.stock >= quantity ? true: false;
}


//model
export const Product = model('Product', productSchema)