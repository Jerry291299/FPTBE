import {v2 as cloudinary} from 'cloudinary';


export const Uploadfile = async() => {

    // Configuration
    cloudinary.config({ 
        cloud_name: "dabqsdm47", 
        api_key: "255657924865145", 
        api_secret: "<E6yjN9zbb2Dcon3_HYBN89WZQgc>" // Click 'View Credentials' below to copy your API secret
    });
    
    // Upload an image
    const uploadResult = await cloudinary.uploader.upload("https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg", {
        public_id: "shoes"
    }).catch((error)=>{console.log(error)});
    
    console.log(uploadResult);
    
    // Optimize delivery by resizing and applying auto-format and auto-quality
    const optimizeUrl = cloudinary.url("shoes", {
        fetch_format: 'auto',
        quality: 'auto'
    });
    
    console.log(optimizeUrl);
    
    // Transform the image: auto-crop to square aspect_ratio
    const autoCropUrl = cloudinary.url("shoes", {
        crop: 'auto',
        gravity: 'auto',
        width: 500,
        height: 500,
    });
    
    console.log(autoCropUrl);    
};

// import multer from "multer";
// import path from "path";

// Configure multer storage
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploads/"); // Directory where files will be saved
//   },
//   filename: function (req, file, cb) {
//     cb(null, `${Date.now()}_${file.originalname}`);
//   },
// });

// const fileFilter = (req: any, file: any, cb: any) => {
//   // Accept images only
//   if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
//     return cb(new Error("Only image files are allowed!"), false);
//   }
//   cb(null, true);
// };

// // Create multer instance with storage configuration
// const upload = multer({
//   storage: storage,
//   fileFilter: fileFilter,
//   limits: { fileSize: 1024 * 1024 * 5 }, // Limit file size to 5MB
// });

// export default upload;