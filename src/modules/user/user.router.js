import {Router} from 'express';
import { isAuthenticated } from '../../middleware/authentication.js';
import { asyncHandler } from './../../utils/asyncHandler.js';
import { isValid } from '../../middleware/validation.js';
import { resetPasswordVal, updateProfileVal } from './user.validation.js';
import { getProfileData, resetPassword, updateProfileData } from './user.controller.js';
import { cloudUpload } from '../../utils/multer.cloud.js';

const userRouter = Router();

//reset password  
userRouter.put('/reset-password',
asyncHandler(isAuthenticated()),
isValid(resetPasswordVal),
asyncHandler(resetPassword)
)

//get profile data
userRouter.get('/profile',
asyncHandler(isAuthenticated()),
asyncHandler(getProfileData)
)

//update profile data
userRouter.put('/update-profile',
asyncHandler(isAuthenticated()),
cloudUpload().single('image'),
isValid(updateProfileVal),
asyncHandler(updateProfileData)
)




export default userRouter;
