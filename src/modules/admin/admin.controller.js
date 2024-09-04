import { status } from '../../utils/constant/enums.js';
import { User } from './../../../db/index.js';
import { messages } from './../../utils/constant/messages.js';
import cloudinary from './../../utils/cloudinary.js';
import { AppError } from './../../utils/appError.js';
import { hashPassword } from './../../utils/hash-and-compare.js';

//add user
export const addUser = async (req, res, next) => {
    //get data from req
    const { userName, email, phone, role, DOB } = req.body;

    console.log('req.body', req.body)
    let { address } = req.body;

    // Parse the address field if necessary
    if (typeof address === 'string') {
        address = JSON.parse(address);
    }


    //check for user Exist
    const userExist = await User.findOne({ $or: [{ email }, { phone }] }); // (,) means => and, but we need email or phone 


    if (userExist) {
        return next(new AppError(messages.user.alreadyExist))
    }

    //prepare 

    //upload image
    if (req.file) {
        const { public_id, secure_url } = await cloudinary.uploader.upload(req.file.path, { folder: 'ecommerce/users' });
        req.body.image = { publicId: public_id, secureUrl: secure_url };
    }
    console.log('req.body after', req.body)

    const hashedPassword = hashPassword({ password: 'e-commerce' });

    const createdUser = await User.create({
        userName,
        email,
        phone,
        role,
        DOB,
        address,
        password: hashedPassword,
        status: status.VERIFIED,
        image: req.body.image
    });
    if (!createdUser) {
        return next(new AppError(messages.user.failToCreate, 500));//server error
    }

    return res.status(201).json({ message: messages.user.createdSuccessfully, success: true, data: createdUser })
}

//delete user
export const deleteUser = async (req, res, next) => {

    const { userId } = req.params;

    //cehck existence
    const userExist = await User.findById(userId);
    if (!userExist) {
        return next(new AppError(messages.user.notFound, 404));
    }

    // If the user has an image, delete it from Cloudinary
    if (userExist.image && userExist.image.publicId) {
        await cloudinary.uploader.destroy(userExist.image.publicId);
    }

    await userExist.deleteOne();

    return res.status(200).json({
        message: messages.user.deletedSuccessfully,
        success: true
    });





}

//update user
export const updateUser = async (req, res, next) => {

    const { userId } = req.params;
    const updates = req.body;

    //cehck existence
    const userExist = await User.findById(userId);
    if (!userExist) {
        return next(new AppError(messages.user.notFound, 404));
    }

    // check file exist
    if (req.file) {
        // If the user already has an image, delete it from Cloudinary
        if (userExist.image && userExist.image.publicId) {
            await cloudinary.uploader.destroy(userExist.image.publicId);
        }

        // Upload the new image to Cloudinary
        const { public_id, secure_url } = await cloudinary.uploader.upload(req.file.path, { folder: 'ecommerce/users' });
        updates.image = { publicId: public_id, secureUrl: secure_url };
    }

    // If password is provided in the update, hash it
    if (updates.password) {
        updates.password = hashPassword({ password: updates.password });
    }


    // Update the user with the new data
    const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true });

    if (!updatedUser) {
        return next(new AppError(messages.user.failToUpdate, 500));
    }

    return res.status(200).json({
        message: messages.user.updatedSuccessfully,
        success: true,
        data: updatedUser
    });
}

//get user
export const getUser = async (req, res, next) => {
    const { userId } = req.params;

    //cehck existence
    const userExist = await User.findById(userId).select('-password');;
    if (!userExist) {
        return next(new AppError(messages.user.notFound, 404));
    }

    //return 
    return res.status(200).json({ success: true, data: userExist });


}



