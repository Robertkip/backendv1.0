import multer from "multer";
import { Op } from "sequelize";
import path from "path";
import Tenant from "../models/tenantModel.js";

export const registerTenant = async (req, res) => {
        const userId = req.body.userId;
        const tenant_fname = req.body.tenant_fname;
        const tenant_lname = req.body.tenant_lname;
        const tenant_idno =    req.body.tenant_idno;
        const tenant_phonenumber = req.body.tenant_phonenumber;
        const tenant_location = req.body.tenant_location;
        const tenant_avatar = "http://38.242.239:1/image/" + req.file.filename;

        let tenant = await Tenant.findOne({where: {[Op.or]: [{tenant_idno}, {tenant_phonenumber}]}});

        if(!req.body.tenant_idno || !req.body.tenant_phonenumber) {
            res.status(400).send({
                msg: 'Please provide all fields'
            })
          } else if (tenant) {
               res.status(422).send({msg: "Landlord Already Exists"});
          } else {    
        Tenant.create({
            userId,
            tenant_fname,
            tenant_lname,
            tenant_idno,
            tenant_phonenumber,
            tenant_location,
            tenant_avatar,
            type: req.file.mimeType
        }).then(tenant => {
          
        res.status(201).json(tenant);
        })
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


export const getSingleTenant = async (req, res) => {

  try {
    const {userId} = req.params;
    const tenant = await Tenant.findOne({
      where: {userId: userId},
    })
    if(tenant){
      return res.status(200).json({tenant});
    }
  } catch (error) {
    return res.status(500).send(error.message);
  }
}


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, __basedir + '/Images');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
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
