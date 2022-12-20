import Apartment from "../models/apartmentModel.js";
import fs from 'fs';
import multer from "multer";
import path from "path";

export const apartmentUpload = async (req, res, next) => {
   try {
      console.log(req.file);
     Apartment.create({
      apartment_name:req.body.apartment_name,
      apartment_description:req.body.apartment_description,
      apartment_location:req.body.apartment_location,
       
   }).then((image) => {
      fs.writeFileSync(
         __basedir + "/resources/static/assets/tmp" + image.name,
         image.data
      );
      return res.send(`File Uploaded`);
   });
   } catch (err) {
      res.status(500).send({message: err.message});
   }
}

export const getAllApartments = async (req, res) => {
     await Apartment.findAll().then(data => {
       return res.status(200).send(data);
    });
}

//  Upload Image Controller

const storage = multer.diskStorage({
   destination: (req, file, cb) => {
       cb(null, `Images`)
   },
   filename: (req, file, cb) => {
       cb(null, Date.now() + path.extname(file.originalname))
   }
})

export const upload = multer({
   storage: storage,
   limits: { fileSize: '1000000' },
   fileFilter: (req, file, cb) => {
       const fileTypes = /jpeg|jpg|png|gif/
       const mimeType = fileTypes.test(file.mimetype)  
       const extname = fileTypes.test(path.extname(file.originalname))

       if(mimeType && extname) {
           return cb(null, true)
       }
       cb('Give proper files formate to upload')
   }
}).single('image')

