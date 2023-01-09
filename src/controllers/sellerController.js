import Seller from "../models/sellerModel.js";
import multer from "multer";
import path from "path";

export const registerSeller = (req, res) => {
    try {
        const userId = req.body.userId;
        const seller_fname = req.body.seller_name;
        const seller_lname = req.body.seller_lname;
        const seller_id = req.body.seller_id;
        const seller_phonenumber = req.body.seller_phonenumber;
        const seller_avatar = "http://192.168.0.37:8084/" + req.file.filename;

        Seller.create({
            userId,
            seller_fname,
            seller_lname,
            seller_id,
            seller_phonenumber,
            seller_avatar,
            type: req.file.mimeType
        }).then(data => {
          
        res.status(201).json(data);
        })

    } catch (error) {
        res.status(404).send({msg: "Error Creating User"});
    }
}


export const getAllSeller = async (req, res, next) => {
   await Seller.findAll().then(data => {
    res.status(200).json(data);
    next();
   }).catch(err =>  next(err));
}

export const getSellerByPK = async (req, res, next) => {
  const s_id = req.params.id;
  
  await Seller.findByPk(s_id).then(seller => {
     if(!seller){
        res.status(404).send({msg: "Seller Not Found"});
        next();
     } else {
        res.json(seller);
     }
  }).catch((error) => next(error));
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, __basedir, 'Images');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
})

export const upload = multer({
    storage: storage,
    limits: {fileSize: '1000000'},
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png|gif/
        const mimeType = fileTypes.test(file.originalname)
        const extname = fileTypes.test(path.extname(file.originalname));

        if(mimeType && extname){
            return cb(null, true)
        }
        cb("Please Upload Proper file type");
    },
}).single('image');
