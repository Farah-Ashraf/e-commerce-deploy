import Router from 'express';
import { isValid } from '../../middleware/validation.js';
import { cloudUpload } from '../../utils/multer.cloud.js';
import { isAuthenticated, isAuthorized } from './../../middleware/authentication.js';
import { asyncHandler } from './../../utils/asyncHandler.js';
import { roles } from './../../utils/constant/enums.js';
import { addUser, deleteUser, updateUser, getUser } from './admin.controller.js';
import { addUserAdminValidation, updateUserAdminValidation, getUserAdminValidation } from './admin.validation.js';

const adminRouter = Router();

//add user
adminRouter.post('/add',
asyncHandler(isAuthenticated()),
isAuthorized([roles.ADMIN]),
cloudUpload().single('image'),
isValid(addUserAdminValidation),
asyncHandler(addUser)

)

//delete user
adminRouter.delete('/delete-user/:userId',
asyncHandler(isAuthenticated()),
isAuthorized([roles.ADMIN]),
asyncHandler(deleteUser)
)

//update user
adminRouter.put('/update-user/:userId',
asyncHandler(isAuthenticated()),
isAuthorized([roles.ADMIN]),
cloudUpload().single('image'),
isValid(updateUserAdminValidation),
asyncHandler(updateUser)

)

//get user
adminRouter.get('/:userId',
asyncHandler(isAuthenticated()),
isAuthorized([roles.ADMIN]),
isValid(getUserAdminValidation),
asyncHandler(getUser)

)
export default adminRouter;