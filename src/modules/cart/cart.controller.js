//add to cart
import { Product, Cart, User } from './../../../db/index.js';
import { AppError } from './../../utils/appError.js';
import { messages } from './../../utils/constant/messages.js';

//add to cart
export const addToCart = async (req,res,next) => {

    //get data from req
    const { productId, quantity } = req.body;

    //check product existence
    const productExist = await Product.findById(productId);//.lean(); // {} , null. there are some metadata that returned with this object that take a lot of time to be loaded in the memory,
    // so .lean() method speedup the query 3x bec. it doesn't take the metadata you don't want. but it have some problems that you can't make chaining bec. it remove the link with the db

    if(!productExist){
        return next(new AppError(messages.product.notFound, 404));
    }

    //check product stock
    if(!productExist.inStock(quantity)){
        return next(new AppError(messages.product.outOfStock, 400));
    }

    //check for the user has cart and the product found inside it
    const userCart = await Cart.findOneAndUpdate( {
         user: req.authUser._id, 'products.productId': productId 
        }, 
        {
            $set: {"products.$.quantity": quantity}// this means update the quantity of this productId not all the products
        }, { new: true } 

        ); //give me cart that have this userId and contains this productId

        let data = userCart;


    //if the product doesn't found in the cart then add it
    if(!userCart){
        data = await Cart.findOneAndUpdate({ user: req.authUser._id },
            { $push: {products: { productId, quantity } } },
            { new: true }
        )
    }

    //return res
    return res.status(200).json({ message: 'done', success: true, data  });
}

//remove from the cart
export const removeFromCart = async (req,res,next) => {
    //get data from req
    const { cartId } = req.params;
    const { productId } = req.body;

    // Find the user's cart and check if the product exists in it
    const cart = await Cart.findOneAndUpdate({
        _id: cartId,
         user: req.authUser._id,
        'products.productId': productId,
    },
    { 
        $pull: { products: { productId } } 
    },
    { new: true }
);
    
    // If the cart or product is not found, return an error
    if (!cart) {
        return next(new AppError(messages.product.notFound, 404));
    }
    
     //return res
     return res.status(200).json({ message: messages.cart.updatedSuccessfully, success: true });

}

//move to wishlist
export const moveToWishlist = async (req, res, next) => {

    //get data from req
    const { cartId } = req.params;
    const { productId } = req.body;

    // Check cart existence
    const cartExist = await Cart.findById(cartId);
    if (!cartExist) {
        return next(new AppError(messages.cart.notFound, 404));
    }

    // Check if the product exists in the cart's products
    const productInCart = await Cart.findOne({
        user: req.authUser._id,
        'products.productId': productId,
    });
    if (!productInCart) {
        return next(new AppError(messages.product.notFound, 404));
    }

    // Remove the product from the cart
    await Cart.findOneAndUpdate(
        { user: req.authUser._id },
        { $pull: { products: { productId } } },
        { new: true }
    );

    // Add the product to the user's wishlist
    const user = await User.findByIdAndUpdate(
        req.authUser._id,
        { $addToSet: { wishlist: productId } },
        { new: true }
    ).select('wishlist');

    // Return the updated wishlist
    return res.status(200).json({
        message: messages.wishlist.addedSuccessfully,
        success: true,
        data: user
    });
};
