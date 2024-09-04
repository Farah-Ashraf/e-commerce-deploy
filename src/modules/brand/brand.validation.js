import  joi  from 'joi';
import { generalFields } from './../../middleware/validation.js';

export const createBrandVal = joi.object({
    name: generalFields.name.required(),
}).required()

export const updateBrandVal = joi.object({
    name: generalFields.name,
    brandId: generalFields.objectId.required()

}).required()

export const deleteBrandVal = joi.object({
    brandId: generalFields.objectId.required()
}).required()


export const getBrandVal = joi.object({
    brandId: generalFields.objectId.required()
}).required()


