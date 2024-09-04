import joi from 'joi';
import { generalFields } from './../../middleware/validation.js';

export const resetPasswordVal = joi.object({
    oldPassword: generalFields.password.min(8).required(),
    newPassword: generalFields.password.min(8).required()
}).required()

export const addressSchema = joi.object({
    street: generalFields.name.trim().required(),
    city: generalFields.name.trim().required(),
    phone: joi.string().pattern(/^(010|011|012|015)[0-9]{8}$/).required()

}).required();

export const updateProfileVal = joi.object({
    userName: generalFields.name.trim(),
    email: generalFields.email.trim().lowercase(),
    phone: joi.string().pattern(/^(010|011|012|015)[0-9]{8}$/).messages({
        "string.pattern.base": "Phone number must be a valid Egyptian number starting with 010, 011, 012, or 015 and followed by 8 digits.",
        "any.required": "Phone number is required."
    }),
    DOB: joi.date().optional(),
    address: joi.array().items(addressSchema).optional()  
}).required()

