import { v2 as cloudinary } from 'cloudinary';

export const cloudware = (req, res, next) => {
    try {
  cloudinary.uploader.upload(file.tempFilePath,(err,result)=>{
    console.log(result)
  })
    } catch (err) {
        next(err);

    }
  
};
