import { Schema, model } from 'mongoose';
import { orderStatus, paymentTypes } from '../../src/utils/constant/enums.js';

//Schema
const orderSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    products: [
        {
            productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
            title: String,
            itemPrice: Number,
            quantity: Number,
            finalPrice: Number,
            image: Object
        }
    ],
    address: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true    
    },
    coupon: {
        couponId: { type: Schema.Types.ObjectId, ref: 'Coupon' },
        code: String,
        discountAmount: Number
    },
    status: {
        type: String,
        enum: Object.values(orderStatus),
        default: orderStatus.PLACED
    },
    payment: {
        type: String,
        enum: Object.values(paymentTypes),
        required: true
    },
    orderPrice: Number,
    finalPrice: Number


},{ timestamps: true });

//model
export const Order = model( 'Order',  orderSchema);