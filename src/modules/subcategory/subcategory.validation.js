import joi from "joi";
import { generalFields } from "../../middleware/validation.js";

export const createSubcategoryVal = joi.object({
    name: generalFields.name.required(),
    category: generalFields.objectId.required(),
}).required()

export const updateSubcategoryVal = joi.object({
    name: generalFields.name,
    category: generalFields.objectId,
    subcategoryId: generalFields.objectId.required()
}).required()


export const deleteSubcategoryVal = joi.object({
    subcategoryId: generalFields.objectId.required()
}).required()


export const getSpecificSubcategoryVal = joi.object({
    subcategoryId: generalFields.objectId.required()
}).required()


export const getSubcategoriesVal = joi.object({
    categoryId: generalFields.objectId.required(),
    page: joi.number().integer().min(1).optional(),   
    size: joi.number().integer().min(1).optional(),   
    sort: joi.string().optional(),                    
    select: joi.string().optional(),                  

}).required()

