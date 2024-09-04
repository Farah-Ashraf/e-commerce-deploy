import Stripe from "stripe";
import { connectDB } from "../db/connection.js"
import { asyncHandler, globalErrorHandling } from "./utils/asyncHandler.js"
import * as allRouters from './index.js';
import { Order, Cart, Product } from './../db/index.js';
import { orderStatus } from "./utils/constant/enums.js";

export const initApp = (app, express) => {

    //vercel webhook api => must put before express.json() bec. it has special parser which is express.raw
    //stripe calls this api 
    app.post('/webhook', express.raw({type: 'application/json'}), asyncHandler( async (req, res) => {
        let event = req.body;
        // Only verify the event if you have an endpoint secret defined.
        // Otherwise use the basic event deserialized with JSON.parse
        if (endpointSecret) {
          // Get the signature sent by Stripe
          const signature = req.headers['stripe-signature'].toString();
          const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
            event = stripe.webhooks.constructEvent(
              req.body,
              signature,
              'whsec_i9iPQdw9ZcVMBHzFwwQooY99hLBanT7D'
            );
        }
      
        // Handle the event
        if(event.type == 'checkout.session.completed'){
            const checkout = event.data.object; //this object is similar to the checkout in the order controller

            //once the event occur => clear cart of that user, update order status, update product stock
            const orderId = checkout.metadata.orderId;
            const orderExist = await Order.findByIdAndUpdate(orderId, { status: orderStatus.PLACED }, { new: true });
            await  Cart.findOneAndUpdate({ user: orderExist.user }, { products: [] }, { new: true })
            for (const product of orderExist.products) {
                await Product.findByIdAndUpdate(product.productId, { $inc: { stock: -product.quantity } })
                
            }


        }
        
        // Return a 200 res to acknowledge receipt of the event
        res.send();
      }) );

    app.use(express.json())
    app.use('/uploads', express.static('uploads'))

    connectDB()
    const port = process.env.PORT || 3000
    app.use('/category', allRouters.categoryRouter)
    app.use('/sub-category', allRouters.subcategoryRouter)
    app.use('/brand', allRouters.brandRouter)
    app.use('/product', allRouters.productRouter)
    app.use('/auth', allRouters.authRouter)
    app.use('/admin', allRouters.adminRouter)
    app.use('/wishlist', allRouters.wishlistRouter)
    app.use('/review', allRouters.reviewRouter)
    app.use('/coupon', allRouters.couponRouter)
    app.use('/cart', allRouters.cartRouter)
    app.use('/user', allRouters.userRouter)
    app.use('/order', allRouters.orderRouter)
    app.use('*', (req,res,next) => {
        return res.json({ message: "invalid url" })
    })


    app.use(globalErrorHandling)
    app.listen(port, () => console.log('server is running on port', port))
}