import slugify from "slugify"
import { Category, Subcategory, Product } from "../../../db/index.js"
import { AppError } from "../../utils/appError.js"
import { messages } from '../../utils/constant/messages.js'
import cloudinary from './../../utils/cloudinary.js';
import { ApiFeature } from './../../utils/apiFeature.js';

//create subCategory
export const createSubcategory = async (req, res, next) => {
    // get data from req
    let { name, category } = req.body;
    name = name.toLowerCase();

    // check category existence
    const categoryExist = await Category.findById(category);// {},null
    if (!categoryExist) {
        return next(new AppError(messages.category.notFound, 404));
    }
    if (!req.file) {
        return next(new AppError(messages.file.required, 404));
    }

    // check subcategory existence
    const subcategoryExist = await Subcategory.findOne({ name });// {},null
    if (subcategoryExist) {
        return next(new AppError(messages.subcategory.alreadyExist, 409)); //conflict
    }

    //upload image
    const { public_id, secure_url } = await cloudinary.uploader.upload(req.file.path, { folder: 'ecommerce/subcategory' });

    // prepare data
    const slug = slugify(name)
    const subcategory = new Subcategory({
        name,
        slug,
        category,
        image: { publicId: public_id, secureUrl: secure_url },
        createdBy: req.authUser._id
    });
    // add to db
    const createdSubcategory = await subcategory.save();
    if (!createdSubcategory) {
        // remove image
        await cloudinary.uploader.destroy(subcategory.image.publicId);
        return next(new AppError(messages.subcategory.failToCreate, 500))
    }
    // send response
    return res.status(201).json({ message: messages.subcategory.createdSuccessfully, success: true, data: createdSubcategory })
}

//update subcategory
export const updateSubcategory = async (req, res, next) => {
    //get data from req => name, category, image
    const { subcategoryId } = req.params;
    const { name, category } = req.body;

    //check subcategory existence
    const subcategoryExist = await Subcategory.findById(subcategoryId); //{}, null
    if (!subcategoryExist) {
        return next(new AppError(messages.subcategory.notFound, 404));
    }

    if (category) {
        //check category existence
        const categoryExist = await Category.findById(category); //{}, null
        if (!categoryExist) {
            return next(new AppError(messages.category.notFound, 404));
        }
        subcategoryExist.category = category;
    }

    //check for name uniqeness
    if (name) {
        const subcategoryNameExist = await Subcategory.findOne({ name, _id: { $ne: subcategoryId } }); //{}, null
        if (subcategoryNameExist) {
            return next(new AppError(messages.subcategory.alreadyExist, 409));
        }
        subcategoryExist.name = name;
        subcategoryExist.slug = slugify(name);
    }

    //check for image 
    let oldSubcategoryImage = subcategoryExist.image.publicId;

    if (req.file) {
        //update new image
        const { public_id, secure_url } = await cloudinary.uploader.upload(req.file.path, { folder: 'ecommerce/subcategory' });
        subcategoryExist.image = { publicId: public_id, secureUrl: secure_url };
    }

    //save
    const updatedSubcategory = await subcategoryExist.save();
    if (!updatedSubcategory) {
        //remove new image if found
        if (req.file) {
            await cloudinary.uploader.destroy(subcategoryExist.image.publicId);
        }
        return next(new AppError(messages.subcategory.failToUpdate, 500));
    }

    //remove old image
    if (oldSubcategoryImage) {
        await cloudinary.uploader.destroy(oldSubcategoryImage);
    }

    //return res
    return res
        .status(200)
        .json({ message: messages.subcategory.updatedSuccessfully, success: true, data: updatedSubcategory });
}

//delete subcategory
export const deleteSubcategory = async (req, res, next) => {
    //get data from req
    const { subcategoryId } = req.params;

    //check existence
    const subcategoryExist = await Subcategory.findById(subcategoryId);
    if (!subcategoryExist) {
        return next(new AppError(messages.subcategory.notFound, 404));
    }

    // Delete subcategory
    await Subcategory.findByIdAndDelete(subcategoryId);

    //delete image of the subcategory
    if (subcategoryExist.image) {
        await cloudinary.uploader.destroy(subcategoryExist.image.publicId);
    }

    // Delete related products
    const products = await Product.find({ subcategory: subcategoryId }).select("mainImage subImages");

    const productIds = products.map((product) => product._id); //[1,2,3]

    //delete images
    const imagePublicIds = [];

    // Collect publicIds from all related images
    products.forEach((product) => {
        if (product.mainImage?.publicId) {
            imagePublicIds.push(product.mainImage.publicId);
        }
        product.subImages?.forEach((img) => {
            if (img.publicId) {
                imagePublicIds.push(img.publicId);
            }
        });
    });

    // Delete all collected images from Cloudinary
    await Promise.all(imagePublicIds.map((publicId) => cloudinary.uploader.destroy(publicId)));

    //delete products
    await Product.deleteMany({ _id: { $in: productIds } });


    //return response
    return res
        .status(200)
        .json({
            message: messages.subcategory.deletedSuccessfully,
            success: true
        });


}


//get subcategories for specific category
export const getSubcategories = async (req, res, next) => {
    // get data from req
    const { categoryId } = req.params;

    // check category existence
    const categoryExist = await Category.findById(categoryId)// {},null
    if (!categoryExist) {
        return next(new AppError(messages.category.notFound, 404))
    }

    //apply api features
    const apiFeature = new ApiFeature(Subcategory.find({ category: categoryId }).populate([{ path: 'category' }]), req.query)
        .pagination()
        .sort()
        .select()
        .filter();

    const subcategories = await apiFeature.mongooseQuery;

    if (subcategories.length == 0) {
        return next(new AppError(messages.subcategory.notFound, 404));
    }

    //return res
    return res.status(200).json({ message: messages.subcategory.fetchedSuccessfully, data: subcategories, success: true });
}


//get specific subcategory
export const getSubcategory = async (req, res, next) => {

    //get data from req
    const { subcategoryId } = req.params;

    //check existence nad return both
    const subcategory = await Subcategory.findById(subcategoryId);// {},null

    subcategory ? res.status(200).json({ message: messages.subcategory.fetchedSuccessfully, data: subcategory, success: true })
        : next(new AppError(messages.subcategory.notFound, 404));

}
