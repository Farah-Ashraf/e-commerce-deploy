import { Router } from "express";
import { createSubcategoryVal, getSubcategoriesVal, updateSubcategoryVal, deleteSubcategoryVal, getSpecificSubcategoryVal } from "./subcategory.validation.js";
import { createSubcategory, getSubcategories, updateSubcategory, deleteSubcategory, getSubcategory } from "./subcategory.controller.js";
import { isValid } from "../../middleware/validation.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { isAuthenticated, isAuthorized } from './../../middleware/authentication.js';
import { roles } from './../../utils/constant/enums.js';
import { cloudUpload } from "../../utils/multer.cloud.js";
const subcategoryRouter = Router();

//create subcategory 
subcategoryRouter.post('/',
    asyncHandler(isAuthenticated()),
    isAuthorized([roles.ADMIN, roles.SELLER]),
    cloudUpload().single('image'),
    isValid(createSubcategoryVal),
    asyncHandler(createSubcategory)
)

//update subcategory 
subcategoryRouter.put('/:subcategoryId',
    asyncHandler(isAuthenticated()),
    isAuthorized([roles.ADMIN, roles.SELLER]),
    cloudUpload().single('image'),
    isValid(updateSubcategoryVal),
    asyncHandler(updateSubcategory)
)

//delete subcategory
subcategoryRouter.delete('/:subcategoryId',
    asyncHandler(isAuthenticated()),
    isAuthorized([roles.ADMIN, roles.SELLER]),
    isValid(deleteSubcategoryVal),
    asyncHandler(deleteSubcategory)
)


//get subcategories of specific category
subcategoryRouter.get('/:categoryId',
 isValid(getSubcategoriesVal),
 asyncHandler(getSubcategories)
)

//get specific subcategory
subcategoryRouter.get('/specific-subcategory/:subcategoryId',
 isValid(getSpecificSubcategoryVal),
 asyncHandler(getSubcategory)
)


export default subcategoryRouter