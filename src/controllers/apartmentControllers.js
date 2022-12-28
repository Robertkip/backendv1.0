import multer from "multer";
import path from "path";
import fs from "fs";
import Apartment from "../models/apartmentModel.js";

export const uploadApartment = (req, res) => {
    try {
        const name = "http://192.168.0.37:8084/images/" + req.file.filename;
         Apartment.create({
          apartment_name : req.body.apartment_name,
          apartment_location : req.body.apartment_location,
          apartment_description : req.body.apartment_description, 
          type : req.file.mimetype,
          name: name,
        //   data: fs.readFileSync(
        //     __basedir + "/Images/" + req.file.filename
        //   ),
        //  }).then((image) => {
        //    fs.writeFileSync(
        //     __basedir + "/Images/" + image.name,
        //     image.data
        //    );
        //    return res.status(201).send("Apartment Created Successfully"); 
       });
       return res.status(201).send("Apartment Created Successfully"); 
    } catch (err) {
       res.status(500).send({message: err.message});
    }
  }

export const getAllApartments = async (req, res) => {
     await Apartment.findAll().then(data => {
       return res.status(200).send(data);
    });
}

const storage = multer.diskStorage({
   destination: (req, file, cb) => {
       cb(null, __basedir + '/Images')
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

