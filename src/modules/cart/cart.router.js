import { Router } from "express";
import { asyncHandler } from './../../utils/asyncHandler.js';
import { isAuthenticated } from './../../middleware/authentication.js';
import { addToCart, removeFromCart, moveToWishlist } from './cart.controller.js';
import { isValid } from "../../middleware/validation.js";
import { addToCartVal, removeFromCartVal } from './cart.validation.js';


const cartRouter = Router();

//add to cart
cartRouter.post('/',
asyncHandler(isAuthenticated()),
isValid(addToCartVal),
asyncHandler(addToCart)
)

//remove from cart
cartRouter.put('/:cartId',
asyncHandler(isAuthenticated()),
isValid(removeFromCartVal),
asyncHandler(removeFromCart)
);

//move to wishlist
cartRouter.put('/move-to-wishlist/:cartId',
asyncHandler(isAuthenticated()),
isValid(removeFromCartVal),
asyncHandler(moveToWishlist)

);


export default cartRouter;