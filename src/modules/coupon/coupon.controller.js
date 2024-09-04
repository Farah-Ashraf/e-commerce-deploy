import { Coupon } from "../../../db/index.js";
import { AppError } from './../../utils/appError.js';
import { messages } from './../../utils/constant/messages.js';
import { couponTypes } from './../../utils/constant/enums.js';

//create coupon
export const createCoupon = async (req,res,next) => {

    //get data from req
    const { couponCode, discountAmount, couponType, fromDate, toDate } = req.body;

    //check coupon existence
    const couponExist = await Coupon.findOne({ couponCode });
    if(couponExist){
        return next(new AppError(messages.coupon.alreadyExist, 409));
    }
    if( couponType == couponTypes.PERCENTAGE && discountAmount > 100 ){
        return next(new AppError('must less than 100', 400));
    }

    //prepare data
    const coupon = new Coupon({

        couponCode, 
        discountAmount, 
        couponType, 
        fromDate, 
        toDate,
        createdBy: req.authUser._id
    });

    const createdCoupon = await coupon.save();
    if(!createdCoupon){
        return next(new AppError(messages.coupon.failToCreate, 500));
    }

    //return res
    return res.status(201).json({ message: messages.coupon.createdSuccessfully, success: true, data: createdCoupon });



}

//update Coupon
export const updateCoupon = async (req,res,next) => {
    //get data from req
    const { discountAmount, couponType, fromDate, toDate } = req.body;
    const { couponId } = req.params;

    //check coupon existence
    const couponExist = await Coupon.findById( couponId );
    if(!couponExist){
        return next(new AppError(messages.coupon.notFound, 404));
    }
    if( couponType && couponType == couponTypes.PERCENTAGE && discountAmount > 100 ){
        return next(new AppError('must less than 100', 400));
    }

    //update
    const updatedCoupon = await Coupon.findByIdAndUpdate(couponId, { discountAmount, couponType, fromDate, toDate } , { new: true });


    if(!updatedCoupon){
        return next(new AppError(messages.coupon.failToUpdate, 500));
    }

    //return res
    return res.status(200).json({ message: messages.coupon.updatedSuccessfully, success: true, data: updatedCoupon });

}

//delete coupon
export const deleteCoupon = async (req,res,next) => {

    //get data from req
    const { couponId } = req.params;
    
    //check coupon existence
    const couponExist = await Coupon.findById( couponId );
    if(!couponExist){
        return next(new AppError(messages.coupon.notFound, 404));
    }

    //delete it
    const deletedCoupon = await Coupon.findByIdAndDelete(couponId);
    if (!deletedCoupon) {
        return next(new AppError(messages.coupon.failToDelete, 500));
    }

    //return res
    return res.status(200).json({ message: messages.coupon.deletedSuccessfully, success: true });

}

