import joi from "joi";
import { generalFields } from "../../middleware/validation.js";

export const productIdVal = joi.object({
    productId: generalFields.objectId.required(),
}).required()
