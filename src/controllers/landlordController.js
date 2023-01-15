import multer from "multer";
import path from "path";
import { Op } from "sequelize";
import Landlord from "../models/landlordModel.js";

export const registerLandlord = async (req, res) => {
    const userId = req.body.userId;
    const landlord_fname = req.body.landlord_fname;
    const landlord_lname = req.body.landlord_lname;
    const landlord_phonenumber = req.body.landlord_phonenumber;
    const landlord_idno = req.body.landlord_idno;
    const landlord_location = req.body.landlord_location;
    const landlord_avatar = "http://38.242.239.1:8084/" + req.file.filename;

    const landlord = await Landlord.findOne({where: { [Op.or]: [{landlord_idno}, {landlord_phonenumber}]}})

    if(!landlord_fname || !landlord_lname || !landlord_phonenumber || !landlord_idno){
       res.status(400).json({msg: "Please Provide All Fields"})
    } else if(landlord){
        res.status(400).json({msg: "Landlord with that name does not exist"});
    } else {
        Landlord.create({
            userId,
            landlord_fname,
            landlord_lname,
            landlord_phonenumber,
            landlord_idno,
            landlord_location,
            landlord_avatar,
            type: req.file.mimetype,
        }).then(data => {
            res.status(201).send(data);
        })
    }
}

export const getAllLandlord = async (req, res, next) => {
   await Landlord.findAll().then(data => {
    res.status(200).json(data);
    next();
   }).catch(err =>  next(err));
}

export const getLandlordById = async (req, res, next) => {
  const s_id = req.params.userId;
  
  await Landlord.findByPk(s_id).then(landlord => res.status(200).send(landlord))
  .catch((error) => {
    res.status(400).send(error);
  })
  .catch((error) => next(error));
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, __basedir + '/Images')
    },
    filename: (req, file, cb) => {
       cb(null, Date.now() + path.extname(file.originalname));
    }
})

export const upload = multer({
    storage: storage,
    limits: {fileSize: '1000000'},
    fileFilter: (req, file, cb ) => {
        const fileTypes = /jpeg||jpg||png||gif/;
        const mimeTypes = fileTypes.test(file.mimetype);
        const extname = fileTypes.test(path.extname(file.originalname));

    if( mimeTypes && extname){
        cb(null, true);
    } else {
        cb("Please Upload the correct file Type");
      }
    }
}).single('image');

