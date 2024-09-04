import { Router } from "express";
import { isValid } from "../../middleware/validation.js";
import { createBrandVal, updateBrandVal, deleteBrandVal, getBrandVal } from "./brand.validation.js";
import { asyncHandler } from "./../../utils/asyncHandler.js";
import { createBrand, updateBrand, deleteBrand, getAllBrands, getSpecificBrand } from "./brand.controller.js";
import { isAuthenticated, isAuthorized } from "../../middleware/authentication.js";
import { roles } from "./../../utils/constant/enums.js";
import { cloudUpload } from "../../utils/multer.cloud.js";

const brandRouter = Router();

//create brand
brandRouter.post(
  "/",
  asyncHandler(isAuthenticated()),
  isAuthorized([roles.ADMIN, roles.SELLER]),
  cloudUpload().single("logo"),
  isValid(createBrandVal),
  asyncHandler(createBrand)
);

//update brand
brandRouter.put(
  "/:brandId",
  asyncHandler(isAuthenticated()),
  isAuthorized([roles.ADMIN, roles.SELLER]),
  cloudUpload().single("logo"),
  isValid(updateBrandVal),
  asyncHandler(updateBrand)
);

//delete brand
brandRouter.delete( "/:brandId",
  asyncHandler(isAuthenticated()),
  isAuthorized([roles.ADMIN, roles.SELLER]),
  isValid(deleteBrandVal),
  asyncHandler(deleteBrand)
);

//get all brands
brandRouter.get("/",
    asyncHandler(getAllBrands)
);
  
//get specific brand
brandRouter.get("/:brandId", 
isValid(getBrandVal), 
asyncHandler(getSpecificBrand)
);



export default brandRouter;
