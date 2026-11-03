import multer from "multer";
import { Op } from "sequelize";
import path from "path";
import Tenant from "../models/tenantModel.js";
import { isAdmin } from "../helpers/ownership.js";

export const registerTenant = async (req, res) => {
    const { tenant_fname, tenant_lname, tenant_idno, tenant_phonenumber, tenant_location } = req.body;
    if (!tenant_idno || !tenant_phonenumber) {
        return res.status(400).send({ msg: "Please provide all fields" });
    }
    const existing = await Tenant.findOne({ where: { [Op.or]: [{ tenant_idno }, { tenant_phonenumber }] } });
    if (existing) {
        return res.status(422).send({ msg: "Tenant Already Exists" });
    }

    const tenant = await Tenant.create({
        userId: isAdmin(req.user) && req.body.userId ? req.body.userId : req.user.id,
        tenant_fname,
        tenant_lname,
        tenant_idno,
        tenant_phonenumber,
        tenant_location,
        tenant_avatar: req.file ? (process.env.PRODUCTION_IMAGE_URL || "") + req.file.filename : null,
        type: req.file?.mimetype,
    });
    return res.status(201).json(tenant);
}

export const getAllTenant = async (req, res) => {
    const tenants = await Tenant.findAll();
    return res.status(200).json(tenants);
}

export const getTenantByPK = async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
        return res.status(400).send({ msg: "id must be a number" });
    }
    const tenant = await Tenant.findByPk(id);
    if (!tenant) {
        return res.status(404).send({ msg: "Tenant Not Found" });
    }
    return res.json(tenant);
}

export const getSingleTenant = async (req, res) => {
    const userId = Number(req.params.userId);
    if (!Number.isInteger(userId)) {
        return res.status(400).send({ msg: "userId must be a number" });
    }
    const tenant = await Tenant.findOne({ where: { userId } });
    if (!tenant) {
        return res.status(404).send({ msg: "Tenant Not Found" });
    }
    return res.status(200).json({ tenant });
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
        const fileTypes = /jpeg|jpg|png|gif/
        const mimeTypes = fileTypes.test(file.mimetype)
        const extname = fileTypes.test(path.extname(file.originalname))

        if(mimeTypes && extname){
          return cb(null, true)
        }
        cb('Please upload proper file type');
    }
}).single('image');
