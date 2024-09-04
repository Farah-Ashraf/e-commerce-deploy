import { comparePassword } from "../../utils/hash-and-compare.js";
import { AppError } from './../../utils/appError.js';
import { messages } from './../../utils/constant/messages.js';
import { hashPassword } from './../../utils/hash-and-compare.js';
import { User } from './../../../db/index.js';
import { status } from "../../utils/constant/enums.js";
import { sendEmail } from './../../utils/email.js';
import cloudinary from './../../utils/cloudinary.js';


//reset password
export const resetPassword = async (req,res,next) => {

    //get data from req
    const { oldPassword, newPassword } = req.body;
    const userId = req.authUser._id; 

    //check user old password
    const match = comparePassword({ password: oldPassword, hashedPassword: req.authUser.password }); //return boolean
    if(!match){
        return next(new AppError(messages.password.invalidCredintial, 401));
    }

    //hash new password
    const hashedNewPassword = hashPassword({ password: newPassword });

    //update user
    await User.updateOne( { _id: userId }, { password: hashedNewPassword }, { new: true } );

    //return res
    return res.status(200).json({ message: messages.user.updatedSuccessfully, success: true })

}

//get profile data
export const getProfileData = async (req,res,next) => {
    //get data from req
    const userId = req.authUser._id;

    const user = await User.findById(userId).select('userName email phone role image DOB address');

    if(!user){
        return next(new AppError(messages.user.failToFetch, 500));
    }

    //return res
    return res.status(200).json({
        message: messages.user.fetchedSuccessfully,
        success: true,
        data: user
    });
}

//update profile data
export const updateProfileData = async (req,res,next) => {
    //get data from req
    const { userName, email, phone, DOB, address } = req.body;

    //find user
    const user = await User.findById(req.authUser._id);
    if (!user) {
        return next(new AppError(messages.user.notFound, 404)); // Not Found
    }


    //check for email
    if(email){
        const userExist = await User.findOne({email, _id: { $ne: req.authUser._id }});
        if(userExist){
            return next(new AppError(messages.user.emailNotUnique, 409)); //conflict
        }
        user.email = email;
        user.status = status.PENDING;
    }

    //check for phone
    if(phone){
        const userExist = await User.findOne({phone, _id: { $ne: req.authUser._id }});
        if(userExist){
            return next(new AppError(messages.user.phoneNotUnique, 409)); //conflict
        }
        user.phone = phone;
    }

    
    // check file exist
    if (req.file) {
        // If the user already has an image, delete it
        if (user.image && user.image.publicId) {
            await cloudinary.uploader.destroy(user.image.publicId);
        }
        // Upload the new image to Cloudinary
        const { public_id, secure_url } = await cloudinary.uploader.upload(req.file.path, { folder: 'ecommerce/users' });
        user.image = { publicId: public_id, secureUrl: secure_url };
    }

    //complete updates
    if (userName) user.userName = userName;
    if (DOB) user.DOB = DOB;
    if (address) user.address = address;

    //save
    const updatedUser = await user.save();

    if(!updatedUser){
        return next(new AppError(messages.user.failToUpdate, 500));
    }

    //send email
    const { token } = req.headers;
    await sendEmail({
        to: updatedUser.email, subject: "verify account", html:`<p>to verify your email click
     <a href='${req.protocol}://${req.headers.host}/auth/verify-account?token=${token}'>verify account</a> </p>`
    }) //http://localhost:3000/auth/verify-account?token=token


    // Return a response
    return res.status(200).json({
        message: messages.user.updatedSuccessfully,
        success: true,
        data: updatedUser
    });  
}
