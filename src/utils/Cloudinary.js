const cloudinary = require("cloudinary");
require ('dotenv').config()
cloudinary.config({
  cloud_name: "dabqsdm47",
  api_key: "829692194268581",
  api_secret: "DRXHVhAXVvdEXHXM7uCSbDrC7OE",
});

console.log(process.env.API_KEY);
console.log(process.env.CLOUD_NAME);
console.log(process.env.SECRET_KEY);
const cloudinaryUploadImg = async (fileToUploads) => {
  return new Promise((resolve) => {
    cloudinary.uploader.upload(fileToUploads, (result) => {
      console.log(result);
      console.log(fileToUploads);
      resolve(
        {
          url: result.secure_url,
          asset_id: result.asset_id,
          public_id: result.public_id,
        },
        {
          resource_type: "auto",
        }
      );
    });
  });
};
const cloudinaryDeleteImg = async (fileToDelete) => {
  return new Promise((resolve) => {
    cloudinary.uploader.destroy(fileToDelete, (result) => {
      resolve(
        {
          url: result.secure_url,
          asset_id: result.asset_id,
          public_id: result.public_id,
        },
        {
          resource_type: "auto",
        }
      );
    });
  });
};

module.exports = { cloudinaryUploadImg, cloudinaryDeleteImg };