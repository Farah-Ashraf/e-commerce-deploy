import {Router} from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { signupVal, loginVal, changePasswordVal } from './auth.validation.js';
import { login, signup, verifyAccount, forgetPassword, changePassword } from './auth.controller.js';
import { isValid } from '../../middleware/validation.js';
const authRouter = Router();

//signUp
authRouter.post('/signup',
    isValid(signupVal),
    asyncHandler(signup)
)

//verify => when click on the link, it will take you to the browser then the method will be get bec. any api from the browser is get method
authRouter.get('/verify-account', asyncHandler(verifyAccount))

//login
authRouter.post('/login',
isValid(loginVal),
 asyncHandler(login)
)

//forget password
authRouter.put('/forget-password',
asyncHandler(forgetPassword)
)

//change Passwword
authRouter.put('/change-password',
isValid(changePasswordVal),
asyncHandler(changePassword)
)


export default authRouter;