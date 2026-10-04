import multer from "multer";
import path from "path";
import { Op } from "sequelize";
import Landlord from "../models/landlordModel.js";
import { isAdmin } from "../helpers/ownership.js";

export const registerLandlord = async (req, res) => {
    const { landlord_fname, landlord_lname, landlord_phonenumber, landlord_idno, landlord_location } = req.body;
    if (!landlord_fname || !landlord_lname || !landlord_phonenumber || !landlord_idno) {
        return res.status(400).json({ msg: "Please Provide All Fields" });
    }
    const existing = await Landlord.findOne({ where: { [Op.or]: [{ landlord_idno }, { landlord_phonenumber }] } });
    if (existing) {
        return res.status(422).json({ msg: "Landlord Already Exists" });
    }

    const landlord = await Landlord.create({
        // A landlord record grants its user rights over the landlord's
        // apartments, so only an admin may register one for someone else.
        userId: isAdmin(req.user) && req.body.userId ? req.body.userId : req.user.id,
        landlord_fname,
        landlord_lname,
        landlord_phonenumber,
        landlord_idno,
        landlord_location,
        landlord_avatar: req.file ? "https://api.waridi.org/" + req.file.filename : null,
        type: req.file?.mimetype,
    });
    return res.status(201).send(landlord);
}

export const getAllLandlord = async (req, res) => {
    const landlords = await Landlord.findAll();
    return res.status(200).json(landlords);
}

export const getSingleLandlord = async (req, res) => {
    const userId = Number(req.params.userId);
    if (!Number.isInteger(userId)) {
        return res.status(400).json({ msg: "userId must be a number" });
    }
    const landlord = await Landlord.findOne({ where: { userId } });
    if (!landlord) {
        return res.status(404).json({ msg: "Landlord Not Found" });
    }
    return res.status(200).json({ landlord });
}

export const getLandlordById = async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
        return res.status(400).json({ msg: "id must be a number" });
    }
    const landlord = await Landlord.findByPk(id);
    if (!landlord) {
        return res.status(404).json({ msg: "Landlord Not Found" });
    }
    return res.status(200).send(landlord);
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
        const fileTypes = /jpeg|jpg|png|gif/;
        const mimeTypes = fileTypes.test(file.mimetype);
        const extname = fileTypes.test(path.extname(file.originalname));

    if( mimeTypes && extname){
        cb(null, true);
    } else {
        cb("Please Upload the correct file Type");
      }
    }
}).single('image');

