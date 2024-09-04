import { AppError } from './../../utils/appError.js';
import { messages } from './../../utils/constant/messages.js';
import { comparePassword, hashPassword } from './../../utils/hash-and-compare.js';
import { sendEmail } from './../../utils/email.js';
import { generateToken, verifyToken } from './../../utils/token.js';
import { status } from '../../utils/constant/enums.js';
import { Cart, User } from '../../../db/index.js';
import { generateOTP } from './../../utils/otp.js';


//signup
export const signup = async (req,res,next) => {
    //get data from body
    const {userName, email, password, phone, DOB, address} = req.body;

    //checkExistence
    const userExist = await User.findOne({ $or:[{email},{phone}] }); // (,) means => and, but we need email or phone 
    if(userExist){
        return next(new AppError(messages.user.alreadyExist, 409)); //conflict
    }
    //prepare data

    //hash password
    const hashedPassword = hashPassword({password})


    const user = new User({
        userName,
        email,
        phone,
        password: hashedPassword,
        DOB,
        address
    })

    //save to the db
    const createdUser = await user.save();
    if(!createdUser){
        return next(new AppError(messages.user.failToCreate, 500)) //server error
    }

    //send email
    const token = generateToken({ payload: {_id:createdUser._id} })
    await sendEmail({
        to: email, subject: "verify account", html:`<p>to verify your email click
     <a href='${req.protocol}://${req.headers.host}/auth/verify-account?token=${token}'>verify account</a> </p>`
    }) //http://localhost:3000/auth/verify-account?token=token

    //send response
    return res.status(201).json({message: messages.user.createdSuccessfully, data: createdUser, success: true})



}

//verify email
export const verifyAccount = async (req,res,next) => {
    //get data from req
    const {token} = req.query;

    //check for token
    const decode = verifyToken({token, secretKey: process.env.SECRET_KEY}); //return the data in the payload
    const user = await User.findByIdAndUpdate(decode._id, { status: status.VERIFIED },{ new: true });
    if(!user){
        return next(new AppError(messages.user.notFound, 404));
    }

    //create cart for this user
    await Cart.create({ user: user._id, products: [] });

    //return
    return res.status(200).json({ message: messages.user.verifyAccount, success: true });

    
}

//login
export const login = async (req,res,next) => {
    //get data from req
    const { email, password, phone } = req.body;

    //check existence
    const userExist = await User.findOne({ $or: [{email},{phone}] , status: status.VERIFIED }); // comma means &&(and   )
    if(!userExist){
        return next(new AppError(messages.password.invalidCredintial, 401));
    }

    //check for password
    const matchedPassword = comparePassword( { password, hashedPassword: userExist.password } );
    if(!matchedPassword){
        return next(new AppError(messages.password.invalidCredintial, 401)) //unouthorized
    }

    //change isActive to true
    userExist.isActive = true;
    await userExist.save();

    //generate token
    const accessToken = generateToken({payload: {_id: userExist._id}});

    return res.status(200).json({ message: 'login successfully', success: true, accessToken });
}

//forget password
export const forgetPassword = async (req,res,next) => {
    //get data from req
    const { email } = req.body;

    //check user existence
    const userExist = await User.findOne({ email }); //{}, null
    if(!userExist){
        return next(new AppError(messages.user.notFound, 404));
    }

    //check if he already has eamil sent to him with otp(to avoid sending a lot of mails)
    if( userExist.otp && userExist.expireDateOtp > Date.now() ){
        //then he has email sent 
        return next(new AppError(messages.user.hasOTP, 400)); //problem from user
    }

    //generate OTP
    const otp = generateOTP();

    //save this otp in the user
    userExist.otp = otp;
    userExist.expireDateOtp = Date.now() + 15 * 60 *1000; //Date.now() return time in ms. this date will be stored in ms for about 15 min from now

    //save to db
    await userExist.save();

    //send email
    await sendEmail({ to: email, 
        subject: "forget password", 
        html: `<h1>you request forget password, your OTP is ${ otp }. \n if not you please reset your password to avoid any hacking.</h1>`
    });

    //send res
    return res.status(200).json({ message: messages.user.checkEmail, success: true });

}

//change password
export const changePassword = async (req,res,next) => {

    //get data from req
    const { otp, newPassword, email } = req.body;

    //check email existence
    const user = await User.findOne({ email });
    if(!user){
        return next(new AppError(messages.user.notFound, 404));
    }

    //check for otp
    if( user.otp != otp ){
        return next(new AppError(messages.user.invalidOTP, 401)); //anauthorized
    }

    if( user.expireDateOtp < Date.now() ){
        const secondOTP = generateOTP();
        user.otp = secondOTP;
        user.expireDateOtp = Date.now() + 5 * 60 * 1000;
        await user.save();
        await sendEmail({ to: email, subject: "resend OTP", html: `<h1>your OTP is ${secondOTP}</h1>` });

        //return res
        return res.status(200).json({ message: messages.user.checkEmail, success: true });

    }

    //hash new password
    const hashedPassword = hashPassword({ password: newPassword });

    user.password = hashedPassword;
    user.otp = undefined;
    user.expireDateOtp = undefined;
    await user.save();
    //or
    // await User.updateOne({email}, { password: hashedPassword, $unset: { otp: "", expireDateOtp: "" } });

    return res.status(200).json({ message: messages.password.updatedSuccessfully, success: true });

}