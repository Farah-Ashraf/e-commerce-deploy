import { Router } from "express";
import { asyncHandler } from './../../utils/asyncHandler.js';
import { isAuthenticated, isAuthorized } from './../../middleware/authentication.js';
import { isValid } from "../../middleware/validation.js";
import { addReviewVal, reviewIdVal, productIdAndQueryVal} from './review.validation.js';
import { addReview, deleteReview, getProductReviews } from './review.controller.js';
import { roles } from './../../utils/constant/enums.js';

const reviewRouter = Router();

//add/update review
reviewRouter.post('/:productId',
asyncHandler(isAuthenticated()),
isValid(addReviewVal),
asyncHandler(addReview)

)

//delete review
reviewRouter.delete('/:reviewId',
asyncHandler(isAuthenticated()),
isAuthorized([roles.ADMIN, roles.CUSTOMER]),
isValid(reviewIdVal),
asyncHandler(deleteReview)
)

//get product reviews
reviewRouter.get('/:productId',
isValid(productIdAndQueryVal),
asyncHandler(getProductReviews)
)



export default reviewRouter;

