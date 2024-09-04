import { Router } from "express";
import { fileUpload } from "../../utils/multer.js";
import { cloudUpload } from "../../utils/multer.cloud.js";
import { isValid } from "../../middleware/validation.js";
import { createCategoryVal, deleteCategoryVal, getCategoryVal, updateCategoryVal } from "./category.validation.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { createCategory,deleteCategory,getCategory,updateCagtegory, getAllcategories } from "./category.controller.js";
import { isAuthenticated, isAuthorized } from './../../middleware/authentication.js';
import { roles } from './../../utils/constant/enums.js';

const categoryRouter = Router()


//create category
categoryRouter.post('/',
    asyncHandler(isAuthenticated()),
    isAuthorized([roles.ADMIN, roles.SELLER]),
    cloudUpload().single('image'),
    isValid(createCategoryVal),
    asyncHandler(createCategory)
)

// get category
categoryRouter.get('/:categoryId',
isValid(getCategoryVal),
asyncHandler(getCategory)
)

//update category
categoryRouter.put('/:categoryId',
asyncHandler(isAuthenticated()),
isAuthorized([roles.ADMIN, roles.SELLER]),
 isValid(updateCategoryVal),
 cloudUpload().single('image'),
 asyncHandler(updateCagtegory)
 )

//delete category
categoryRouter.delete('/:categoryId',
asyncHandler(isAuthenticated()),
isAuthorized([roles.ADMIN, roles.SELLER]),
 isValid(deleteCategoryVal),
 asyncHandler(deleteCategory)
 )  

//get all categories
categoryRouter.get("/",
    asyncHandler(getAllcategories)
);


export default categoryRouter