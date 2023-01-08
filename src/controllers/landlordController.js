import multer from "multer";
import path from "path";
import Landlord from "../models/landlordModel";

export const registerLandlord = async (req, res) => {
    try {
        const landlord_fname = req.body.landlord_name;
        const landlord_lname = req.body.landlord_lname;
        const landlord_id =    req.body.landlord_id;
        const landlord_phonenumber = req.body.landlord_phonenumber;
        const landlord_location = req.body.landlord_location;
        const landlord_avatar = "http://192.168.0.37:8084/" + req.file.filename;

        let landlord = await Landlord.findOne({where: {[Op.or]: [{landlord_id}, {landlord_phonenumber}]}});

        if(!req.body.landlord_id || !req.body.landlord_phonenumber) {
            res.status(400).send({
                msg: 'Please provide all fields'
            })
          } else if (landlord) {
               res.status(422).send({msg: "Landlord Already Exists"});
          } else 
          if(password !== confirm_password) {
            console.log("Passwords Do not Match")
        } else if(!email || !password || !confirm_password) {
           console.log("Please Provide All Fields")
        } else {    
        Landlord.create({
            landlord_fname,
            landlord_lname,
            landlord_id,
            landlord_phonenumber,
            landlord_location,
            landlord_avatar,
            type: req.file.mimeType
        }).then(landlord => {
          
        res.status(201).json(landlord);
        })
    }
    } catch (error) {
        res.status(404).send({msg: "Error Creating User"});
    }
}


export const getAllLandlord = async (req, res, next) => {
   await Landlord.findAll().then(data => {
    res.status(200).json(data);
    next();
   }).catch(err =>  next(err));
}

export const getLandlordById = async (req, res, next) => {
  const s_id = req.params.id;
  
  await Landlord.findByPk(s_id).then(landlord => {
     if(!landlord){
        res.status(404).send({msg: "Landlord Not Found"});
        next();
     } else {
        res.json(landlord);
     }
  }).catch((error) => next(error));
}


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, __basedir + 'Images');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.filename));
  } 
});

export const upload = multer({
    storage: storage,
    limits: {fileSize: '1000000'},
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg||jpg||png||gif/
        const mimeTypes = fileTypes.test(file.mimetype)
        const extname = fileTypes.test(path.extname(file.originalname))

        if(mimeTypes && extname){
          return cb(null, true)
        }
        cb('Please upload proper file type');
    }
}).single('image');
