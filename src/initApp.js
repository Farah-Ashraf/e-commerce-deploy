import { connectDB } from "../db/connection.js"
import { globalErrorHandling } from "./utils/asyncHandler.js"
import * as allRouters from './index.js';

export const initApp = (app, express) => {
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


    app.use(globalErrorHandling)
    app.listen(port, () => console.log('server is running on port', port))
}