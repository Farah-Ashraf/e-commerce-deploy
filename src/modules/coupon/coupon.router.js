import {Router} from 'express';
import { isAuthorized, isAuthenticated } from '../../middleware/authentication.js';
import { asyncHandler } from './../../utils/asyncHandler.js';
import { createCouponVal, updateCouponVal, deleteCouponVal } from './coupon.validation.js';
import { createCoupon, updateCoupon, deleteCoupon } from './coupon.controller.js';
import { roles } from './../../utils/constant/enums.js';
import { isValid } from '../../middleware/validation.js';
const couponRouter = Router();

//create coupn  
couponRouter.post('/',
asyncHandler(isAuthenticated()),
isAuthorized([roles.ADMIN]),
isValid(createCouponVal),
asyncHandler(createCoupon)
)

//update coupon
couponRouter.put('/:couponId',
  asyncHandler(isAuthenticated()),
  isAuthorized([roles.ADMIN]),
  isValid(updateCouponVal),
  asyncHandler(updateCoupon)
);

//delete Coupon
couponRouter.delete('/:couponId',
  asyncHandler(isAuthenticated()),
  isAuthorized([roles.ADMIN]),
  isValid(deleteCouponVal),
  asyncHandler(deleteCoupon)
);




export default couponRouter;
