import { Product, Review, Order } from "../../../db/index.js";
import { AppError } from './../../utils/appError.js';
import { messages } from './../../utils/constant/messages.js';
import { ApiFeature } from './../../utils/apiFeature.js';

// add/update review
export const addReview = async (req,res,next) => {
    //get data from request
    const { comment, rate } = req.body;
    const { productId } = req.params;

    //check existence
    const productExist = await Product.findById(productId); // {} ,null

    if(!productExist){
        return next(new AppError(messages.product.notFound, 404));
    }

    //check has order or not
    const hasOrder = await Order.findOne({ user: req.authUser._id, 'products.productId': productId })
    if (!hasOrder) {
        return next(new AppError(messages.review.noOrderFound, 400)); // Bad Request
    }

    //check user has review on this product or not, if found this means he wants to update his review
    const reviewExist = await Review.findOneAndUpdate({ user: req.authUser._id, product: productId }, { comment, rate }, { new: true });

    let message = messages.review.updatedSuccessfully;
    let data = reviewExist;
    if(!reviewExist){
        //prepare review
        const review = new Review({
            comment,
            rate,
            user: req.authUser._id,
            product: productId
        });

        const createdReview = await review.save();
        if(!createdReview){
            return next(new AppError(messages.review.failToCreate, 500));
        }

        message = messages.review.createdSuccessfully;
        data = createdReview;

    }
    
    //return
    return res.status(200).json({ message: message, success: true, data: data });

}

//delete review only the customer can remove the review => role={customer, admin}, and the customer must be the owner => find with this customer and this review
export const deleteReview = async (req,res,next) => {
    //get reviewId and the userId
    const { reviewId } = req.params;

    // Find the review by id
    const reviewExist = await Review.findOne({ _id: reviewId });

    if (!reviewExist) {
        return next(new AppError(messages.review.notFound, 404)); // Review not found
    }
    
    // Check if the user is the owner of the review or an admin
    if (reviewExist.user !== req.authUser._id && req.authUser.role !== 'admin') {
        return next(new AppError(messages.review.notAllowed, 403)); // Not allowed
    }
    
    // Delete the review
    await Review.findByIdAndDelete(reviewId);
    
    return res.status(200).json({ message: messages.review.deletedSuccessfully, success: true });
    
} 

//get allreview related to specific product
export const getProductReviews = async (req,res,next) => {
    //get productId
    const { productId } = req.params;

    //check existence
    const productExist = await Product.findById(productId); // {} ,null

    if(!productExist){
        return next(new AppError(messages.product.notFound, 404));
    }

    //find reviews
    const apiFeature = new ApiFeature(Review.find({ product: productId }), req.query).pagination().sort().select().filter();
    const allReviews = await apiFeature.mongooseQuery;

    let message = messages.review.retrievedSuccessfully;
    if (allReviews.length === 0) {
        message = messages.review.noReviews
    }


    //return 
    return res.status(200).json({ message: message, success: true, data: allReviews });

}