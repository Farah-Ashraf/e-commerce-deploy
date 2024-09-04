import { Schema, model } from "mongoose";
import { couponTypes } from './../../src/utils/constant/enums.js';

//schema
const couponSchema = new Schema({

    couponCode: {
        type: String,
        required: true,
        unique: true
    },
    discountAmount: {
        type: Number,
        min: 1
    },
    couponType: {
        type: String,
        enum: Object.values(couponTypes),
        default: couponTypes.FIXEDAMOUNT
    },
    fromDate:{
        type: String, //not date bec. it will cause some problems
        default: Date.now()
    },
    toDate:{
        type: String,
        default: Date.now() + (24 * 60 * 60 * 1000) //ms
    },
    assignedUsers: [
        {
            user: { type: Schema.Types.ObjectId, ref: 'User' },
            maxUse: { type: Number, default: 5, max: 5 }
        }
    ],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' }

},{ 
    timestamps: true 
});

//model
export const Coupon = model('Coupon', couponSchema);