import slugify from "slugify";
import axios from "axios";
import { Types } from "mongoose";
import { Category, Subcategory, Product } from "../../../db/index.js";
import { AppError } from "../../utils/appError.js";
import { messages } from "../../utils/constant/messages.js";
import cloudinary from "../../utils/cloudinary.js";
import { ApiFeature } from './../../utils/apiFeature.js';

//create category
export const createCategory = async (req, res, next) => {
  // get data from req
  let { name } = req.body;
  name = name.toLowerCase();
  // check existence
  const categoryExist = await Category.findOne({ name }); // {},null
  if (categoryExist) {
    return next(new AppError(messages.category.alreadyExist, 409));
  }
  // prepare data
  const slug = slugify(name);

  //upload image at the cloud
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: "ecommerce/category",
    }
  );
  const category = new Category({
    name,
    slug,
    image: { secureUrl: secure_url, publicId: public_id },
    createdBy: req.authUser._id
  });

  // add to db
  const createdCategory = await category.save();
  if (!createdCategory) {
    // remove image using cloud
    await cloudinary.uploader.destroy(category.image.publicId);
    return next(new AppError(messages.category.failToCreate, 500));
  }
  // send response
  return res.status(201).json({
     message: messages.category.createdSuccessfully, 
     success: true ,
     data: createdCategory
    });
};

//update category
export const updateCagtegory = async (req, res, next) => {
  //get data from req
  const { name } = req.body;
  const { categoryId } = req.params;

  //check category existence
  const categoryExist = await Category.findById(categoryId); //{}, null
  if (!categoryExist) {
    return next(new AppError(messages.category.notFound, 404));
  }

  let oldCategoryImage = categoryExist.image.publicId;

  if (req.file) {
    //update new image
    const { public_id, secure_url } = await cloudinary.uploader.upload(req.file.path, { folder: 'ecommerce/category' });
    categoryExist.image = { publicId: public_id, secureUrl: secure_url };
  }

  if (name) {
    categoryExist.name = name;
    categoryExist.slug = slugify(name);
  }

  //save
  const updatedCategory = await categoryExist.save();
  if (!updatedCategory) {
    //remove image
    if (req.file) {
      await cloudinary.uploader.destroy(categoryExist.image.publicId);
    }
      return next(new AppError(messages.category.failToUpdate, 500));
  }

  //remove old image
  if (oldCategoryImage) {
    await cloudinary.uploader.destroy(oldCategoryImage);
  }

  return res
    .status(200)
    .json({ message: messages.category.updatedSuccessfully, success: true, data: updatedCategory });
};

//delete category
export const deleteCategory = async (req, res, next) => {
  //get data
  const { categoryId } = req.params;
  //check existence
  const categoryExist = await Category.findByIdAndDelete(categoryId);
  if (!categoryExist) {
    return next(new AppError(messages.category.notFound, 404));
  }
  //delete image of the category
  if (categoryExist.image) {
    await cloudinary.uploader.destroy(categoryExist.image.publicId);
  }

  // Delete related subcategories and products
  const subcategories = await Subcategory.find({ category: categoryId }).select(
    "image"
  ); //by default the _id will be selected
  const products = await Product.find({ category: categoryId }).select(
    "mainImage subImages"
  );
  const subCategoriesIds = subcategories.map((sub) => sub._id); //[1,2,3]
  const productIds = products.map((product) => product._id); //[1,2,3]

  //delete subCategories and products
  await Subcategory.deleteMany({ _id: { $in: subCategoriesIds } });
  await Product.deleteMany({ _id: { $in: productIds } });

  //delete images
  const imagePublicIds = [];

  // Collect publicIds from all related images
  subcategories.forEach((subCategory) => {
    if (subCategory.image?.publicId) {
        imagePublicIds.push(subCategory.image.publicId);
    }
  });

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


  //return response
  return res
    .status(200)
    .json({ message: messages.category.deletedSuccessfully, success: true });
};


//get specific catagory with id
export const getCategory = async (req, res, next) => {
  // get data from req
  const { categoryId } = req.params;
  // check existence
  //--1 // const category = await Category.findById(categoryId).populate([{ path: "subcategories" }])// {},null
  //--2 using aggregate
  const category = await Category.aggregate([
    {
      $match: {
        _id: new Types.ObjectId(categoryId),
      },
    },
    {
      $lookup: {
        from: "subcategories",
        localField: "_id",
        foreignField: "category",
        as: "subcategories",
      },
    },
  ]);

  category
    ? res.status(200).json({ data: category, success: true })
    : next(new AppError(messages.category.notFound, 404));

  //another way using axios due to the similar code of this api code to the code of the getSubCategories
  // axios({
  //     method: "get",
  //     url: `${req.protocol}://${req.headers.host}/sub-category/${req.params.categoryId}`
  // }).then((response) => {
  //     return res.status(response.status).json(response.data)
  // }).catch(err => { return next(new AppError(err)) })
};


//get all categories
export const getAllcategories = async (req, res, next) => {
  const apiFeature = new ApiFeature(Category.find(), req.query)
    .pagination()
    .sort()
    .select()
    .filter();
  const allCategories = await apiFeature.mongooseQuery;

  if (!allCategories.length) {
    return next(new AppError(messages.category.notFound, 404));
  }

  // Send res
  return res.status(200).json({
    message: messages.category.fetchedSuccessfully,
    success: true,
    data: allCategories
  });
};


