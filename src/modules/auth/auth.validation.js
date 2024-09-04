import  joi  from 'joi';
import { generalFields } from './../../middleware/validation.js';
import { roles } from './../../utils/constant/enums.js';

export const addressSchema = joi.object({
    street: generalFields.name.trim().required(),
    city: generalFields.name.trim().required(),
    phone: joi.string().pattern(/^(010|011|012|015)[0-9]{8}$/).required()

}).required();


export const signupVal = joi.object({
    userName: generalFields.name.trim().required(),
    email: generalFields.email.trim().lowercase().required(),
    phone: joi.string().pattern(/^(010|011|012|015)[0-9]{8}$/).required().messages({
        "string.pattern.base": "Phone number must be a valid Egyptian number starting with 010, 011, 012, or 015 and followed by 8 digits.",
        "any.required": "Phone number is required."
    }),
    password: generalFields.password.required().min(8),
    role: joi.string().valid(...Object.values(roles)).default(roles.CUSTOMER),
    DOB: joi.date().optional(),
    address: joi.array().items(addressSchema).optional()
}).required()

export const loginVal = joi.object({
    phone: joi.string().pattern(/^(010|011|012|015)[0-9]{8}$/).when('email', {
        is: joi.required(),
        then: joi.optional(),
        otherwise: joi.required()
    }),
    email: generalFields.email.trim().lowercase(),
    password: generalFields.password.required(),


}).required();

export const changePasswordVal = joi.object({
    email: generalFields.email.required(),
    otp: joi.number().required(),
    newPassword: generalFields.password,
    confirmPassword: joi.string().valid(joi.ref("newPassword"))

}).required();




