import { Router } from 'express';
import { asyncHandler } from './../../utils/asyncHandler.js';
import { isAuthenticated } from './../../middleware/authentication.js';
import { createOrder } from './order.controller.js';
import { createOrderVal } from './order.validation.js';
import { isValid } from '../../middleware/validation.js';

const orderRouter = Router();

//create order
orderRouter.post('/',
asyncHandler(isAuthenticated()),
isValid(createOrderVal),
asyncHandler(createOrder)

)


export default orderRouter;