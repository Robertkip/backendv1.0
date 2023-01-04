import multer from "multer";
import path from "path";
import fs from "fs";
import Apartment from "../models/apartmentModel.js";

export const uploadApartment = (req, res) => {
    try {
        const name1 = "http://192.168.0.28:8084/images/" + req.files[0].filename;
        const name2 = "http://192.168.0.28:8084/images/" + req.files[1].filename;
        const name3 = "http://192.168.0.28:8084/images/" + req.files[2].filename;
        const name4 = "http://192.168.0.28:8084/images/" + req.files[3].filename;

         Apartment.create({
          apartment_name : req.body.apartment_name,
          apartment_location : req.body.apartment_location,
          apartment_description : req.body.apartment_description, 
          type1 : req.files.mimetype,
          name1: name1,
          type2 : req.files.mimetype,
          name2: name2,
          type3 : req.files.mimetype,
          name3: name3,
          type4 : req.files.mimetype,
          name4: name4,
        
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
}).array('images', 4);
