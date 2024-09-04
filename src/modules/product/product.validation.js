import  joi  from 'joi';
import { generalFields } from './../../middleware/validation.js';

const parsArray = (value, helper) => {
    value = JSON.parse(value)
    const schema = joi.array().items(joi.string())
    const {error} = schema.validate(value, {abortEarly: false})
    if(error){
        return helper('invalid array')
    }
    else{
        return true
    }
}

export const createProductVal = joi.object({
    title: generalFields.name.required(),
    description: generalFields.name.required(),
    category: generalFields.objectId.required(),
    subcategory: generalFields.objectId.required(),
    brand: generalFields.objectId.required(),
    price: joi.number().min(0).required(),
    discount: joi.number().min(0).default(0),
    size: joi.custom(parsArray),
    colors: joi.custom(parsArray),
    stock: joi.number().min(0)
}).required()

export const deleteProductVal = joi.object({
    productId: generalFields.objectId.required()
}).required()

export const updateProductVal = joi.object({
    productId: generalFields.objectId.required(),
    title: generalFields.name,
    description: generalFields.name,
    category: generalFields.objectId,
    subcategory: generalFields.objectId,
    brand: generalFields.objectId,
    price: joi.number().min(0),
    discount: joi.number().min(0).default(0),
    size: joi.custom(parsArray),
    colors: joi.custom(parsArray),
    stock: joi.number().min(0)

}).required()

export const getSpecificProductVal = joi.object({
    productId: generalFields.objectId.required()
}).required()

export const getProductsVal = joi.object({
    subcategoryId: generalFields.objectId.required()
}).required()








