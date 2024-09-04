import  joi  from 'joi';
import { generalFields } from './../../middleware/validation.js';

export const addToCartVal = joi.object({
    productId: generalFields.objectId.required(),
    quantity: joi.number().required(),
}).required();

export const removeFromCartVal = joi.object({
    productId: generalFields.objectId.required(),
    cartId: generalFields.objectId.required(),
}).required();
