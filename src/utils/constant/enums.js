export const roles = {
    CUSTOMER: 'customer',
    ADMIN: 'admin',
    SELLER: 'seller'
}
Object.freeze(roles);

export const status = {
    VERIFIED: 'verified',
    PENDING: 'pending',
    BLOCKED: 'blocked',
    DELETED: 'deleted'
}
Object.freeze(status);

export const couponTypes = {
    FIXEDAMOUNT: 'fixedAmount',
    PERCENTAGE: 'percentage',
}
Object.freeze(couponTypes);

export const orderStatus = {
    PLACED: 'placed',
    SHIPPING: 'shipping',
    DELIVERED: 'delivered',
    CANCELED: 'canceled',
    REFUNDED: 'refunded',

}
Object.freeze(orderStatus);


export const paymentTypes = {
    CASH: 'cash',
    VISA: 'visa'
}
Object.freeze(paymentTypes);