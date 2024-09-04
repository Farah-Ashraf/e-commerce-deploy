import { Product, User, Cart } from './../../../db/index.js';
import { AppError } from './../../utils/appError.js';
import { messages } from './../../utils/constant/messages.js';

//add to wishlist
export const addToWishlist = async (req, res, next) => {
    //get data from req
    const { productId } = req.params;

    //check for product existence
    const productExist = await Product.findById(productId);
    if (!productExist) {
        return next(new AppError(messages.product.notFound));
    }

    // add to wishlist
    const user = await User.findByIdAndUpdate(
        req.authUser._id,
        { $addToSet: { wishlist: productId } },  //addToSet => will add the productId if it is not found , but push will add it even if it is found
        { new: true }).select('wishlist');

    //return
    return res.status(200).json({ message: messages.wishlist.addedSuccessfully, success: true, data: user });


}

//delete from wishlist
export const deleteFromWishlist = async (req, res, next) => {
    //get data from req
    const { productId } = req.params;

    const user = await User.findByIdAndUpdate(
        req.authUser._id,
        {
            $pull: { wishlist: productId }
        },
        { new: true }).select('wishlist');

    //return
    return res.status(200).json({ message: messages.wishlist.deletedSuccessfully, success: true, data: user });


}

//get wishlist
export const getWishlist = async (req, res, next) => {

    const user = await User.findById(req.authUser._id).select('wishlist');

    //return
    return res.status(200).json({ success: true, data: user });

}

//move to cart
export const moveToCart = async (req, res, next) => {

    //get data from req
    const userId = req.authUser._id;
    const { productId } = req.params;

    // Check user existence
    const userExist = await User.findById(userId);
    if (!userExist) {
        return next(new AppError(messages.user.notFound, 404));
    }

    // Check if the product exists in the wishlist
    const productInWishlist = await User.findOne({
        _id: userId,
        wishlist: productId
    });

    if (!productInWishlist) {
        return next(new AppError(messages.product.notFoundInWishlist, 404));
    }

    // Remove the product from the wishlist
    await User.findOneAndUpdate(
        { _id: userId },
        { $pull: { wishlist: productId } },
        { new: true }
    );

    // Add the product to the user's cart
    const userCart = await Cart.findOne({ user: userId, 'products.productId': productId });
    if (userCart) {
        //product already in the cart
        await Cart.findOneAndUpdate(
            { user: userId, 'products.productId': productId },
            { $inc: { 'products.$.quantity': 1 } }, // Increment quantity by 1
            { new: true }
        )
    } else {
        //product is not in the cart
        await Cart.findOneAndUpdate(
            { user: userId },
            { $push: { products: { productId, quantity: 1 } } },
            { new: true }
        );

    }

    // Return the updated cart
    const updatedCart = await Cart.findOne({ user: userId });

    return res.status(200).json({
        message: messages.cart.updatedSuccessfully,
        success: true,
        data: updatedCart
    });
};


//todo: make all the project use the cloud