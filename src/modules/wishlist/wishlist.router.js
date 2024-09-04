import Router from 'express';
import { isAuthenticated } from '../../middleware/authentication.js';
import { isValid } from '../../middleware/validation.js';
import { asyncHandler } from './../../utils/asyncHandler.js';
import { addToWishlist, deleteFromWishlist, getWishlist, moveToCart } from './wishlist.controller.js';
import { productIdVal } from './wishlist.validation.js';

const wishlistRouter = Router();

//add to wishlist
wishlistRouter.put('/add/:productId',
    asyncHandler(isAuthenticated()),
    isValid(productIdVal),
    asyncHandler(addToWishlist)
)

//delete from wishlist
wishlistRouter.put('/remove/:productId',
    asyncHandler(isAuthenticated()),
    isValid(productIdVal),
    asyncHandler(deleteFromWishlist)
)

//get  wishlist
wishlistRouter.get('/',
asyncHandler(isAuthenticated()),
asyncHandler(getWishlist)

)

//move to cart
wishlistRouter.put('/move-to-cart/:productId',
asyncHandler(isAuthenticated()),
isValid(productIdVal),
asyncHandler(moveToCart)
)


export default wishlistRouter;