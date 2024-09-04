import jwt from 'jsonwebtoken';
export const generateToken = ({payload={}, secretKey=process.env.SECRET_KEY, expiresIn='1h'}) => {
    return jwt.sign(payload, secretKey, { expiresIn })
}

export const verifyToken = ({token, secretKey = process.env.SECRET_KEY}) => {
    return jwt.verify(token, secretKey)
}