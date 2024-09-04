import Stripe from 'stripe';
import { couponTypes, paymentTypes } from '../../utils/constant/enums.js';
import { Coupon, Cart, Product, Order } from './../../../db/index.js';
import { AppError } from './../../utils/appError.js';
import { messages } from './../../utils/constant/messages.js';

//create order
export const createOrder = async (req,res,next) => {

    //get data from req
    const { address, phone, coupon, payment } = req.body;

    //check coupon valid or not
    let couponValid;
    if(coupon){

        couponValid = await Coupon.findOne({ couponCode: coupon }); // {}, null
        if(!couponValid){
            return next(new AppError(messages.coupon.notFound, 404));
        }
        if( couponValid.fromDate > Date.now() || couponValid.toDate < Date.now()){
            return next(new AppError(messages.coupon.notFound, 404));
        }
    
    }

    //pull the products at the cart
    const cart = await Cart.findOne( { user: req.authUser._id } ).populate('products.productId');
    const products = cart.products;

    if(products.length <= 0){
        return next(new AppError(messages.cart.isEmpty, 400));
    }

    //check products
    let orderProducts = [];
    let finalPrice =0;
    let orderPrice = 0;
    for (const product of products) {
        const productExist = await Product.findById( product.productId );
        if(!productExist){
            return next(new AppError(messages.product.notFound, 404))
        }
        if(!productExist.inStock(product.quantity)){
            return next(new AppError(messages.product.outOfStock, 400));
        } 
        orderProducts.push({
            productId: productExist._id,
            title: productExist.title,
            itemPrice: productExist.finalPrice,
            quantity: product.quantity,
            image: productExist.mainImage,
            finalPrice: product.quantity * productExist.finalPrice

        });
        orderPrice += product.quantity * productExist.finalPrice;
    }

    couponValid?.couponType == couponTypes.FIXEDAMOUNT 
    ? finalPrice = orderPrice - couponValid?.discountAmount
    : finalPrice = orderPrice - (orderPrice * ((couponValid?.discountAmount || 0) / 100));

    //prepare
    const order = new Order({
        user: req.authUser._id,
        products: orderProducts,
        address, 
        phone, 
        coupon: { 
            couponId: couponValid?._id, 
            code: couponValid?.couponCode, 
            discountAmount: couponValid?.discountAmount 
        }, 
        payment,
        orderPrice,
        finalPrice

    });

    //save
    const orderCreated = await order.save();
    if(!orderCreated){
        return next(new AppError(messages.order.failToCreate, 500));
    }

    // Clear the products array in the cart
    // await Cart.findByIdAndUpdate(cart._id, { products: [] });


    if(payment == paymentTypes.VISA){
        //integrate with payment gateway => stripe
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
        const checkout = await stripe.checkout.sessions.create({
            success_url: 'https://www.google.com', //update when have html pages(frontend)
            cancel_url: 'https://www.google.com',//update when have html pages(frontend)
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: orderCreated.products.map( (product) => {
                return {
                    price_data: {
                        currency: 'egp',
                        product_data: {
                            name: product.title,
                            images: [product.image.secureUrl]
                        },
                        unit_amount: Math.round(product.itemPrice * 100), // Convert EGP to piastres
                    },
                    quantity: product.quantity
                }
            } )
        })
        return res.status(201).json({ message: messages.order.createdSuccessfully, success: true, data: orderCreated, url: checkout.url });
    }

    //return res
    return res.status(201).json({ message: messages.order.createdSuccessfully, success: true, data: orderCreated });
}