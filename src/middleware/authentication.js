import { verifyToken } from '../utils/token.js';
import { AppError } from './../utils/appError.js';
import { messages } from './../utils/constant/messages.js';
import { User } from './../../db/models/user.model.js';

export const isAuthenticated = () => { //check for user loggedIn through token found in the headers
    return async (req,res,next) => {

        const { token } = req.headers;
        if(!token) {
            return next(new AppError(messages.token.required, 401)); //anauthorized
        }

        //verify the token
        const payload = verifyToken({token}); //return payload in case of success
        if(!payload?._id){ //check for payload and check that it contains _id
            return next(new AppError('invalid payload', 401))
        }

        //check for the existence of the id in the payload
        const user = await User.findById({ _id: payload._id }); //{}, null
        if(!user){
            return next(new AppError(messages.user.notFound, 401)); //unauthorized
        }
        //send this user to the next api
        req.authUser = user;
        next();



    }
}

export const isAuthorized = (roles = []) => {
    return (req,res,next) => {
        const user = req.authUser;
        if(!roles.includes(user.role)){
            return next(new AppError('not authorized', 401)); //unauthorized
        }
        next();
    }
}