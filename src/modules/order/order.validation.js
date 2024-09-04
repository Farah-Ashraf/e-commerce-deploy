import joi from 'joi';
import { generalFields } from './../../middleware/validation.js';
import { paymentTypes } from './../../utils/constant/enums.js';

export const createOrderVal = joi.object({
    address: joi.string().required(),
    phone: joi.string().required(),
    payment: joi.string().valid(...Object.values(paymentTypes)).required(),
    coupon: joi.string().optional()
}).required();
