
const generateMessages = (entity) => ({
    notFound: `${entity} not found`,
    alreadyExist: `${entity} already exist`,
    failToCreate: `fail to create ${entity}`,
    failToUpdate: `fail to update ${entity}`,
    failToDelete: `fail to delete ${entity}`,
    failToFetch: `fail to fetch ${entity}`,
    createdSuccessfully: `${entity} created successfully`,
    updatedSuccessfully: `${entity} updated successfully`,
    deletedSuccessfully: `${entity} deleted successfully`,
    fetchedSuccessfully: `${entity} fetched successfully`
})
export const messages = {
    category: {...generateMessages('category'),isEmpty: "category is empty"},
    subcategory: {...generateMessages('subcategory'), },
    brand: {...generateMessages('brand'), isEmpty: "No brands exist"},
    product: {...generateMessages('product'), outOfStock: "product out of stock", notFoundInWishlist: "product not found in your wishlist"},

    user: {...generateMessages('user'), 
    verifyAccount: "account verified successfully",
    invalidOTP: "invalid OTP", 
    checkEmail: "check your email", 
    hasOTP: "you already has OTP, check your email",
    emailNotUnique: "this email is already associated with another account. Please use a different email address",
    phoneNotUnique: "this phone is already associated with another account. Please use a different phone number"

},

    file: {...generateMessages('file'), required: "file is required"},
    password: {invalidCredintial: "invalid credintials", updatedSuccessfully: "password updated successfully"},
    token: {required: "token is required"},
    wishlist: { ...generateMessages('wishlist'), addedSuccessfully: "wishlist added successfully" },
    review: {...generateMessages('review'), 
    notAllowed: "not allowed", 
    retrievedSuccessfully: "reviews retrieved successfully", 
    noReviews: "No reviews found for this product",
    noOrderFound: "the product is not ordered to review on this product"
},
    coupon: generateMessages('coupon'),
    cart: {...generateMessages('cart'), isEmpty: "cart is empty"},
    order:generateMessages('order')


}