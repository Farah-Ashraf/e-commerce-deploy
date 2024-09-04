import {Router} from 'express';
import { isValid } from '../../middleware/validation.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { createProductVal, deleteProductVal, updateProductVal, getSpecificProductVal, getProductsVal } from './product.validation.js';
import { createProduct, getProduct, getProducts, updateProduct, deleteProduct } from './product.controller.js';
import { isAuthenticated, isAuthorized } from './../../middleware/authentication.js';
import { roles } from './../../utils/constant/enums.js';
import { cloudUpload } from '../../utils/multer.cloud.js';

const productRouter = Router();

//create product 
productRouter.post('/',
asyncHandler(isAuthenticated()),
isAuthorized([roles.ADMIN, roles.SELLER]),
cloudUpload().fields([
    {name: "mainImage", maxCount: 1},
    {name: "subImages", maxCount: 5}
]),
isValid(createProductVal),
asyncHandler(createProduct)
)

//update product 
productRouter.put('/:productId',
asyncHandler(isAuthenticated()),
isAuthorized([roles.ADMIN, roles.SELLER]),
cloudUpload().fields([
    {name: "mainImage", maxCount: 1},
    {name: "subImages", maxCount: 5}
]),
isValid(updateProductVal),
asyncHandler(updateProduct)
)

//delete product 
productRouter.delete('/:productId',
asyncHandler(isAuthenticated()),
isAuthorized([roles.ADMIN, roles.SELLER]),
isValid(deleteProductVal),
asyncHandler(deleteProduct)
)

//get products
productRouter.get('/:subcategoryId',
isValid(getProductsVal),
asyncHandler(getProducts)
)

//get specific product
productRouter.get('/:productId',
isValid(getSpecificProductVal),
asyncHandler(getProduct))


export default productRouter;