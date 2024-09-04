import joi from 'joi';
import { generalFields } from './../../middleware/validation.js';

//add review 
export const addReviewVal = joi.object({
    comment: generalFields.comment.required(),
    rate: joi.number().min(0).max(5),
    productId: generalFields.objectId.required()
}).required();

//reviewId check
export const reviewIdVal = joi.object({
    reviewId: generalFields.objectId.required()
}).required()

//productId check
export const productIdAndQueryVal = joi.object({
    productId: generalFields.objectId.required(),
    page: joi.number().integer().min(1).optional(),   
    size: joi.number().integer().min(1).optional(),   
    sort: joi.string().optional(),                    
    select: joi.string().optional(),                  

}).required()