import Stripe from "stripe";
import { connectDB } from "../db/connection.js"
import { asyncHandler, globalErrorHandling } from "./utils/asyncHandler.js"
import * as allRouters from './index.js';
import { Order, Cart, Product } from './../db/index.js';
import { orderStatus } from "./utils/constant/enums.js";

export const initApp = (app, express) => {

  //vercel webhook api => must put before express.json() bec. it has special parser which is express.raw
  //stripe calls this api 
  app.post('/webhook', express.raw({ type: 'application/json' }), asyncHandler(async (req, res) => {
    let event = req.body;
    console.log('req.body', req.body)
    // Only verify the event if you have an endpoint secret defined.
    // Otherwise use the basic event deserialized with JSON.
    const endpointSecret = 'whsec_CHm50gJSDefBrJFKf6k7rLSQpDNBFK4X';
    console.log('endpointSecret', endpointSecret)
    console.log('req.headers', req.headers)
    console.log('req.headers[stripe-signature]', req.headers['stripe-signature'])
    // Get the signature sent by Stripe
    const signature = req.headers['stripe-signature'].toString();
    console.log('signature', signature)

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      endpointSecret
    );

    console.log('event', event)
    console.log('event.type', event.type)
    // Handle the event
    if (event.type == 'checkout.session.completed') {
      console.log('inside event completed')
      const checkout = event.data.object; //this object is similar to the checkout in the order controller
      console.log('checkout', checkout)

      //once the event occur => clear cart of that user, update order status, update product stock
      const orderId = checkout.metadata.orderId;
      console.log('orderId', orderId)

      const orderExist = await Order.findByIdAndUpdate(orderId, { status: orderStatus.SHIPPING }, { new: true });
      console.log("🚀 ~ app.post ~ orderExist:", orderExist)
      const updatedCart = await Cart.findOneAndUpdate({ user: orderExist.user }, { products: [] }, { new: true })
      console.log("🚀 ~ app.post ~ updatedCart:", updatedCart)
      for (const product of orderExist.products) {
        const updatedProduct = await Product.findByIdAndUpdate(product.productId, { $inc: { stock: -product.quantity } }, { new: true })
        console.log("🚀 ~ app.post ~ updatedProduct:", updatedProduct)
      }
    }
    console.log('after condition')
    // Return a 200 res to acknowledge receipt of the event
    res.send();
  }));

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
  app.use('*', (req, res, next) => {
    return res.json({ message: "invalid url" })
  })


  app.use(globalErrorHandling)
  app.listen(port, () => console.log('server is running on port', port))
}