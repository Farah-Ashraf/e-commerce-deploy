import joi from 'joi'
import { generalFields } from '../../middleware/validation.js'
// create category val
export const createCategoryVal = joi.object({
    name: generalFields.name,
}).required()

//get category
export const getCategoryVal = joi.object({
    categoryId: generalFields.objectId.required(),
}).required()

//update category
export const updateCategoryVal = joi.object({
    name: generalFields.name,
    categoryId: generalFields.objectId.required(),
}).required()

//delete category
export const deleteCategoryVal = joi.object({
    categoryId: generalFields.objectId.required(),
}).required()



