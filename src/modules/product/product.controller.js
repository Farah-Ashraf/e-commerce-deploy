import slugify from "slugify";
import { Category, Subcategory, Brand, Product } from "./../../../db/index.js";
import { AppError } from "./../../utils/appError.js";
import { messages } from "./../../utils/constant/messages.js";
import { ApiFeature } from './../../utils/apiFeature.js';
import cloudinary from './../../utils/cloudinary.js';

//create product
export const createProduct = async (req, res, next) => {
  //get data
  let {
    title,
    description,
    category,
    subcategory,
    brand,
    price,
    discount,
    size,
    colors,
    stock,
  } = req.body;

  //check category existence
  const categoryExist = await Category.findById(category); //{} , null
  if (!categoryExist) {
    return next(new AppError(messages.category.notFound, 404));
  }

  //check category existence
  const subCategoryExist = await Subcategory.findById(subcategory); //{} , null
  if (!subCategoryExist) {
    return next(new AppError(messages.subcategory.notFound, 404));
  }

  //check brand existence
  const brandExist = await Brand.findById(brand); //{} , null
  if (!brandExist) {
    return next(new AppError(messages.brand.notFound, 404));
  }

  //prepare data
  const slug = slugify(title);

  let mainImage  = {};
  let subImages  = [];

    // Upload main image to Cloudinary
    if (req.files.mainImage && req.files.mainImage[0]) {
      const { secure_url, public_id } = await cloudinary.uploader.upload(req.files.mainImage[0].path, {
        folder: 'ecommerce/products/main-images',
      });
      mainImage = { secureUrl: secure_url, publicId: public_id };
    }

    // Upload sub-images to Cloudinary
    if (req.files.subImages) {
      const subImagePromises = req.files.subImages.map(async (file) => { //array contains promises that represent the asynchronous operations of uploading each subimage to Cloudinary.
        const { secure_url, public_id } = await cloudinary.uploader.upload(file.path, {
          folder: 'ecommerce/products/sub-images',
        });
        return { secureUrl: secure_url, publicId: public_id };
      });

      subImages = await Promise.all(subImagePromises);// waits for all these upload promises to resolve and returns an array of results
    }
  
  const product = new Product({
    title,
    slug,
    description,
    mainImage,
    subImages,
    category,
    subcategory,
    brand,
    price,
    discount,
    size: JSON.parse(size),
    colors: JSON.parse(colors),
    stock,
    createdBy: req.authUser._id,
    updatedBy: req.authUser._id
  });

  //save
  const createdProduct = await product.save();
  if (!createdProduct) {
    // remove images
    if (mainImage.publicId) {
      await cloudinary.uploader.destroy(mainImage.publicId);
    }
    if (subImages.length > 0) {
      for (const img of subImages) {
        await cloudinary.uploader.destroy(img.publicId);
      }
    }
    return next(new AppError(messages.product.failToCreate, 500));
  }

  //return res
  return res.status(201).json({
    message: messages.product.createdSuccessfully,
    success: true,
    data: createdProduct
  });
};

//update product
export const updateProduct = async (req,res,next) => {

    //get data
    let { title, description, category, subcategory, brand, price, discount, size, colors, stock } = req.body;
    const { productId } = req.params;

    //check product existence
    const productExist = await Product.findById(productId); // null,{}
    if(!productExist){
      return next(new AppError(messages.product.notFound, 404));
    }

    //check category existence
    if(category){
      const categoryExist = await Category.findById(category); //{} , null
      if (!categoryExist) {
        return next(new AppError(messages.category.notFound, 404));
      }
      productExist.category = category;
    }

    //check Subcategory existence
    if(subcategory){
      const subCategoryExist = await Subcategory.findById(subcategory); //{} , null
      if (!subCategoryExist) {
        return next(new AppError(messages.subcategory.notFound, 404));
      }
      productExist.subcategory = subcategory;
    }

    //check brand existence
    if(brand){
      const brandExist = await Brand.findById(brand); //{} , null
      if (!brandExist) {
        return next(new AppError(messages.brand.notFound, 404));
      }
      productExist.brand = brand;
    }

    if(title){
      productExist.title = title;
      productExist.slug = slugify(title);
    }

    //handle images
    let mainImage = productExist.mainImage;
    let subImages = productExist.subImages;

    if (req.files.mainImage && req.files.mainImage[0]) {
      // remove the old mainImage
      if (mainImage.publicId) {
        console.log('hello');
        await cloudinary.uploader.destroy(mainImage.publicId);
      }
      // Upload the new main image
      const { secure_url, public_id } = await cloudinary.uploader.upload(req.files.mainImage[0].path, {
        folder: 'ecommerce/products/main-images',
      });
      mainImage = { secureUrl: secure_url, publicId: public_id };
  }

  if(req.files.subImages){
    //remove old subImages
    if(subImages.length > 0){
      for (const img of subImages) {
        await cloudinary.uploader.destroy(img.publicId);
      }
    }

    //upload new subImages
    const subImagePromises = req.files.subImages.map(async (file) => { 
      const { secure_url, public_id } = await cloudinary.uploader.upload(file.path, {
        folder: 'ecommerce/products/sub-images',
      });
      return { secureUrl: secure_url, publicId: public_id };
    });

    subImages = await Promise.all(subImagePromises);
  }

  //complete updates
  productExist.description = description || productExist.description;
  productExist.price = price || productExist.price;
  productExist.discount = discount || productExist.discount;
  productExist.size = size ? JSON.parse(size) : productExist.size;
  productExist.colors = colors ? JSON.parse(colors) : productExist.colors;
  productExist.stock = stock || productExist.stock;
  productExist.mainImage = mainImage;
  productExist.subImages = subImages;
  productExist.updatedBy = req.authUser._id;

  //save updates
  const updatedProduct = await productExist.save();

  if(!updatedProduct){
    if(mainImage.publicId && mainImage.publicId !== productExist.mainImage.publicId){
      await cloudinary.uploader.destroy(mainImage.publicId);
    }
    if (subImages.length > 0 && subImages !== productExist.subImages) {
      for (const img of subImages) {
        await cloudinary.uploader.destroy(img.publicId);
      }
    }
    return next(new AppError(messages.product.failToUpdate, 500));

  }

  //return res
  return res.status(200).json({
    message: messages.product.updatedSuccessfully,
    success: true,
    data: updatedProduct
  });
}

//delete product
export const deleteProduct = async (req,res,next) => {
  //get data from req
  const { productId } = req.params;

  //check product existence
  const productExist = await Product.findById(productId); // {}, null
  if(!productExist){
    return next(new AppError(messages.product.notFound, 404));
  }

  //remove main image
  if(productExist.mainImage?.publicId){
    await cloudinary.uploader.destroy(productExist.mainImage.publicId);
  }
  //remove subImages
  if(productExist.subImages.length > 0){
    for (const img of productExist.subImages) {
      await cloudinary.uploader.destroy(img.publicId);
    }
  }

  //delete product
  const deletedProduct = await Product.findByIdAndDelete(productId);
  if (!deletedProduct) {
    return next(new AppError(messages.product.failToDelete, 500));
  }

  // return res
  return res.status(200).json({
    message: messages.product.deletedSuccessfully,
    success: true
  });





}

//get product with id
export const getProduct = async (req,res,next) => {
  //get data from req
  const { productId } = req.params;

  //check product existence
  const productExist = await Product.findById(productId).populate('category subcategory brand'); // {}, null
  if(!productExist){
    return next(new AppError(messages.product.notFound, 404));
  }

  //return res
  return res.status(200).json({
    message: messages.product.fetchedSuccessfully,
    success: true,
    data: productExist
  });



}

//get products 
export const getProducts = async (req, res, next) => {
  //get data from req
  const { subcategoryId } = req.params;

  //check subcategory existence
  const subcategoryExist = await Subcategory.findById(subcategoryId); // {}, null
  if(!subcategoryExist){
    return next(new AppError(messages.subcategory.notFound, 404));
  }

  //apply api features
  const apiFeature = new ApiFeature(Product.find({ subcategory: subcategoryId }), req.query).pagination().sort().select().filter();
  const products = await apiFeature.mongooseQuery
  if(!products){
    return next(new AppError(messages.product.failToFetch, 500));
  }
  //return res
  return res.status(200).json({ message: messages.product.fetchedSuccessfully, success: true, data: products });
}








//===============pagination==========================================//
//.limit(10) => the count of the retreived data/documnets
//.skip(10) => retreive data after skipping specific amount of documents

//we will need the (page number) and the (size) of this page at the => req.query
/*
page = 1   size = 1-5    skip = 0
page = 2   size = 6-10   skip = 5
page = 3   size = 11-15  skip = 10

then: skip = (page - 1) * size

for testing: http://localhost:3000/product?page=1&size=2

//===============sort==========================================//

.sort('createdAt') => take the value that will sort by it
==> if you want to sort it desc then add - before the value => sort('-createdAt')
==> we will make the frontend decide with which variable he want to sort, 
    so he will add key like (sort=createdAt) at the url

    for testing: http://localhost:3000/product?sort=createdAt
==> what if we want to sort by 2 values like createdBy and price for example
        for testing: http://localhost:3000/product?sort=createdAt price
        ==>there is an algorithem that will replace the space found with %20
           result (http://localhost:3000/product?sort=createdAt%20price)
           so we will replace the %20 with (,) that will make the url looks more comfortable,
           but we will need to remove the , because the sort method need space between the values
           so we will use (sort = sort?.replaceAll(',',' ');)

           for testing: http://localhost:3000/product?sort=createdAt,price

//===============select==========================================//

.select('title price')
==> we will make the frontend decide with which variable he want to select, 
    so he will add key like (select=title,price) at the url
    for testing: http://localhost:3000/product?sort=createdAt,price&select=title,price

//===============filter==========================================//

.find(req.query) => req.query={title: 'wide leg pants'}
for example i want to pring all products with specific title, i don't want all the 
products to be returned.
for testing: http://localhost:3000/product?title=wide%20leg%20pants

==> what if i want to send another keys in the req.query like sort, so we need to
    remove them and prepare the filter
    let filter = {...req.query};
    let exclude = ['sort','select','page','size'] 
    exclude.forEach((ele) => {
        //search for every key ele in filter
        delete filter[ele];
    })
    .find(filter)

    //another way
    let {...filter} = req.query => الfilter جمعلى اللى باقى وحوطه فى 
    .find(filter)

    for testing: http://localhost:3000/product?sort=createdAt,price&select=title,price&title=wide%20leg%20pants

    => i write title=wide%20leg%20pants in url but if i console.log(req.filter) => {title: 'wide leg pants'}
       so the = converted to :

       => what if i want to write price > 500 , how to write it?
            we know in MOONGOSE we use the operators => price: {$gt:500} 
            http://localhost:3000/product?price[gt]=500
*/


