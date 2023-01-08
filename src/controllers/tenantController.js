import multer from "multer";
import path from "path";
import Tenant from "../models/tenantModel";

export const registerTenant = async (req, res) => {
    try {
        const tenant_fname = req.body.tenant_name;
        const tenant_lname = req.body.tenant_lname;
        const tenant_id =    req.body.tenant_id;
        const tenant_phonenumber = req.body.tenant_phonenumber;
        const tenant_location = req.body.tenant_location;
        const tenant_avatar = "http://192.168.0.37:8084/" + req.file.filename;

        let tenant = await Tenant.findOne({where: {[Op.or]: [{tenant_id}, {tenant_phonenumber}]}});

        if(!req.body.tenant_id || !req.body.tenant_phonenumber) {
            res.status(400).send({
                msg: 'Please provide all fields'
            })
          } else if (tenant) {
               res.status(422).send({msg: "Landlord Already Exists"});
          } else 
          if(password !== confirm_password) {
            console.log("Passwords Do not Match")
        } else if(!email || !password || !confirm_password) {
           console.log("Please Provide All Fields")
        } else {    
        Tenant.create({
            tenant_fname,
            tenant_lname,
            tenant_id,
            tenant_phonenumber,
            tenant_location,
            tenant_avatar,
            type: req.file.mimeType
        }).then(tenant => {
          
        res.status(201).json(tenant);
        })
    }
    } catch (error) {
        res.status(404).send({msg: "Error Creating User"});
    }
}


export const getAllTenant = async (req, res, next) => {
   await Tenant.findAll().then(data => {
    res.status(200).json(data);
    next();
   }).catch(err =>  next(err));
}

export const getTenantByPK = async (req, res, next) => {
  const t_id = req.params.id;
  
  await Tenant.findByPk(t_id).then(tenant => {
     if(!tenant){
        res.status(404).send({msg: "Tenant Not Found"});
        next();
     } else {
        res.json(tenant);
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
