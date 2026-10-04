import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import { Op } from "sequelize";
import UserProfile from "../models/userProfileModel.js";
import User from "../models/authModel.js";
import { isAdmin } from "../helpers/ownership.js";

dotenv.config();
export const createUserProfile = async (req, res) => {
  const { user_fname, user_lname, user_phonenumber, user_location, followers, following } = req.body;
  if (!user_fname || !user_lname || !user_phonenumber) {
    return res.status(400).json({ msg: "Please Provide All Fields" });
  }
  if (await UserProfile.findOne({ where: { user_phonenumber } })) {
    return res.status(400).json({ msg: "A profile with that phone number already exists" });
  }

  const profile = await UserProfile.create({
    userId: isAdmin(req.user) && req.body.userId ? req.body.userId : req.user.id,
    user_fname,
    user_lname,
    user_phonenumber,
    user_location,
    followers,
    following,
    user_avatar: req.file ? (process.env.PRODUCTION_IMAGE_URL || "") + req.file.filename : null,
    type: req.file?.mimetype,
  });
  return res.status(201).send(profile);
};

export const getUserProfile = async (req, res) => {
  const profiles = await UserProfile.findAll();
  return res.status(200).json(profiles);
};

export const getUserById = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ message: "id must be a number" });
  }
  const user = await UserProfile.findByPk(id);
  if (!user) {
    return res.status(404).json({ message: "User Not Found" });
  }
  return res.json(user);
};

export const getSingleUser = async (req, res) => {
  const userId = Number(req.params.userId);
  if (!Number.isInteger(userId)) {
    return res.status(400).json({ message: "userId must be a number" });
  }
  const user = await UserProfile.findOne({ where: { userId } });
  if (!user) {
    return res.status(404).json({ message: "User Not Found" });
  }
  return res.status(200).json({ user });
};

export const searchUserQuery = async (req, res, next) => {
  const title = req.query.username;
  var condition = title ? { username: { [Op.like]: `%${title}%` } } : null;

  await User.findAll({ where: condition })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      console.error("userController.js failed on " + req.method + " " + req.originalUrl + ":", err);
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving Apartments.",
      });
    });
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, __basedir + "/Images");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

export const upload = multer({
  storage: storage,
  limits: { fileSize: "1000000" },
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif/;
    const mimeTypes = fileTypes.test(file.mimetype);
    const extname = fileTypes.test(path.extname(file.originalname));

    if (mimeTypes && extname) {
      cb(null, true);
    } else {
      cb("Please Upload the correct file Type");
    }
  },
}).single("image");
