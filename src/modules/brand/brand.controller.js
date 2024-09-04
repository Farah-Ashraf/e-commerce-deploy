import { ApiFeature } from "../../utils/apiFeature.js";
import cloudinary from "../../utils/cloudinary.js";
import { Brand } from "./../../../db/index.js";
import { AppError } from "./../../utils/appError.js";
import { messages } from "./../../utils/constant/messages.js";

//create brand
export const createBrand = async (req, res, next) => {
  //get data
  let { name } = req.body;
  name = name.toLowerCase();

  //check file
  if (!req.file) {
    return next(new AppError(messages.file.required, 400));
  }

  //check existence
  const brandExist = await Brand.findOne({ name }); //{}, null

  if (brandExist) {
    return next(new AppError(messages.brand.alreadyExist, 409));
  }

  //upload image at the cloud
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: "ecommerce/brand",
    }
  );

  //prepare data
  const brand = new Brand({
    name,
    logo: { secureUrl: secure_url, publicId: public_id },
    createdBy: req.authUser._id,
  });

  const createdBrand = await brand.save();
  if (!createdBrand) {
    //remove image
    await cloudinary.uploader.destroy(brand.logo.publicId);
    return next(new AppError(messages.brand.failToCreate, 500));
  }

  //send response
  return res.status(201).json({
    message: messages.brand.createdSuccessfully,
    success: true,
    data: createdBrand,
  });
};

//update brand
export const updateBrand = async (req, res, next) => {
  //get data from request
  const { brandId } = req.params;
  let { name } = req.body;

  //check existence
  const brandExist = await Brand.findById(brandId); // null, {}

  if (!brandExist) {
    return next(new AppError(messages.brand.notFound, 404));
  }

  if (name) {
    name = name.toLowerCase();
    const nameExist = await Brand.findOne({ name, _id: { $ne: brandId } });
    if (nameExist) {
      return next(new AppError(messages.brand.alreadyExist, 409));
    }
    brandExist.name = name;
  }
  const oldLogoUrl = brandExist.logo.publicId;
  if (req.file) {
    //remove old image
    // await cloudinary.uploader.destroy(brandExist.logo.public_id);
    //update new image
    const { public_id, secure_url } = await cloudinary.uploader.upload(
      req.file.path,
      { folder: "ecommerce/brand" }
    );
    brandExist.logo = { publicId: public_id, secureUrl: secure_url };
  }

  const updatedBrand = await brandExist.save();
  if (!updatedBrand) {
    //remove image
    await cloudinary.uploader.destroy(brandExist.logo.publicId);
    return next(new AppError(messages.brand.failToUpdate, 500));
  }

  //remove old image
  await cloudinary.uploader.destroy(oldLogoUrl);

  //return response
  return res.status(200).json({
    message: messages.brand.updatedSuccessfully,
    success: true,
    data: updatedBrand,
  });
};

//delete brand
export const deleteBrand = async (req, res, next) => {
  // get data from req
  const { brandId } = req.params;

  // check existence
  const brandExist = await Brand.findById(brandId); // {}, null

  if (!brandExist) {
    return next(new AppError(messages.brand.notFound, 404));
  }

  // remove the logo file associated with the brand
  await cloudinary.uploader.destroy(brandExist.logo.publicId);

  // delete the brand from the database
  const deletedBrand = await Brand.findByIdAndDelete(brandId);

  if (!deletedBrand) {
    return next(new AppError(messages.brand.failToDelete, 500));
  }

  // return response
  return res.status(200).json({
    message: messages.brand.deletedSuccessfully,
    success: true,
  });
};

//get all brands
export const getAllBrands = async (req, res, next) => {
  const apiFeature = new ApiFeature(Brand.find(), req.query)
    .pagination()
    .sort()
    .select()
    .filter();
  const allBrands = await apiFeature.mongooseQuery;

  if (!allBrands.length) {
    return next(new AppError(messages.brand.isEmpty, 404));
  }

  // Send res
  return res.status(200).json({
    message: messages.brand.fetchedSuccessfully,
    success: true,
    data: allBrands,
  });
};

//get specific brand
export const getSpecificBrand = async (req, res, next) => {
  //get data from req
  const { brandId } = req.params;

  //check existence
  const brandExist = await Brand.findById(brandId); //{}, null
  if (!brandExist) {
    return next(new AppError(messages.brand.notFound, 404));
  }
  // Send res
  return res.status(200).json({
    message: messages.brand.fetchedSuccessfully,
    success: true,
    data: brandExist,
  });
};
