import joi from 'joi';
import { generalFields } from './../../middleware/validation.js';
import { couponTypes } from './../../utils/constant/enums.js';


export const createCouponVal = joi.object({
    couponCode: generalFields.name.length(6).required(),
    discountAmount: joi.number().positive().min(1),
    couponType: joi.string().valid(...Object.values(couponTypes)),
    fromDate: joi.date().greater(Date.now() - (24 * 60 * 60 * 1000)),
    toDate: joi.date().greater(joi.ref('fromDate')),

}).required()

export const updateCouponVal = joi.object({
    couponId: generalFields.objectId.required(),
    discountAmount: joi.number().positive().min(1).optional(),
    couponType: joi.string().valid(...Object.values(couponTypes)).optional(),
    fromDate: joi.date().greater(Date.now() - (24 * 60 * 60 * 1000)).optional(),
    toDate: joi.date().greater(joi.ref('fromDate')).optional(),
}).required();

export const deleteCouponVal = joi.object({
    couponId: generalFields.objectId.required(),
}).required();
  
