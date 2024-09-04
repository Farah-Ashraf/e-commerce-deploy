import joi from 'joi';
import { generalFields } from './../../middleware/validation.js';
import { roles } from './../../utils/constant/enums.js';

const addressSchema = joi.object({
    street: generalFields.name.trim().required(),
    city: generalFields.name.trim().required(),
    phone: joi.string().pattern(/^(010|011|012|015)[0-9]{8}$/).required()

}).required();

const parsArray = (value, helper) => {
    value = JSON.parse(value)
    const schema = joi.array().items(addressSchema).required()
    const {error} = schema.validate(value, {abortEarly: false})
    if(error){
        return helper('invalid array')
    }
    else{
        return true
    }
}

export const addUserAdminValidation = joi.object({

    userName: generalFields.name.trim().required(),
    email: generalFields.email.trim().lowercase().required(),
    phone: joi.string().pattern(/^(010|011|012|015)[0-9]{8}$/).required().messages({
        "string.pattern.base": "Phone number must be a valid Egyptian number starting with 010, 011, 012, or 015 and followed by 8 digits.",
        "any.required": "Phone number is required."
    }),
    role: joi.string().valid(...Object.values(roles)).default(roles.CUSTOMER),
    DOB: joi.date().optional(),
    address: joi.custom(parsArray)


}).required()

export const updateUserAdminValidation = joi.object({

    userName: generalFields.name.trim().optional(),
    email: generalFields.email.trim().lowercase().optional(),
    phone: joi.string().pattern(/^(010|011|012|015)[0-9]{8}$/).optional().messages({
        "string.pattern.base": "Phone number must be a valid Egyptian number starting with 010, 011, 012, or 015 and followed by 8 digits.",
        "any.required": "Phone number is required."
    }),
    role: joi.string().valid(...Object.values(roles)).optional(),
    DOB: joi.date().optional(),
    address: joi.custom(parsArray).optional(),
    password: generalFields.password.optional().min(8),
    userId: generalFields.objectId.required()

}).required()

export const getUserAdminValidation = joi.object({
    userId: generalFields.objectId.required()

}).required()

