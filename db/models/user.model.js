import path from 'path';
import dotenv from 'dotenv';
import { model, Schema } from "mongoose";
import { roles, status } from "../../src/utils/constant/enums.js";

//to be sure that the env file readed first
dotenv.config({ path: path.resolve('./config/.env') })

//schema
const userSchema = new Schema({
    userName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true
    },
    phone: {
        type: String, //it is not number because the zero at the first      
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: Object.values(roles),//return ['customer, admin, seller]
        default: roles.CUSTOMER
    },
    status: {
        type: String,
        enum: Object.values(status),
        default: status.PENDING
    },
    isActive: {
        type: Boolean,
        default: false
    },
    image: {
        type: Object,
        default: {
            secureUrl: process.env.SECURE_URL,
            publicId: process.env.PUBLIC_ID
        }
    }, // {secure_url, public_id}
    DOB: Date,
    address: [
        {
            street: String,
            city: String,
            phone: String //phone for each address
        }
    ],

    wishlist: [
        { 
            type: Schema.Types.ObjectId, 
            ref: 'Product' 
        }
    ],
    isDeleted: {
        type: Boolean,
        default: false
    },
    otp: Number,
    expireDateOtp: Date

}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

//hooks => used in specific cases
// userSchema.pre('save', function(){
//     this.password = hashPassword({passord: this.password})
// })

//model
export const User = model('User', userSchema);