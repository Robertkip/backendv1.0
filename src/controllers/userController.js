import multer from "multer";
import path from "path";
import { Op } from "sequelize";
import UserProfile from "../models/userProfileModel.js";
import User from "../models/authModel.js";

export const createUserProfile = async (req, res, next) => {
  const userId = req.body.userId;
  const user_fname = req.body.user_fname;
  const user_lname = req.body.user_lname;
  const user_phonenumber = req.body.user_phonenumber;
  const user_location = req.body.user_location;
  const followers = req.body.followers;
  const following = req.body.following;
  const user_avatar = "https://api.waridi.co/images/" + req.file.filename;

  const userprofile = await UserProfile.findOne({
    where: { user_phonenumber },
  });

  if (!user_fname || !user_lname || !user_phonenumber) {
    res.status(400).json({ msg: "Please Provide All Fields" });
  } else if (userprofile) {
    res.status(400).json({ msg: "Landlord with that name does not exist" });
  } else {
    UserProfile.create({
      userId,
      user_fname,
      user_lname,
      user_phonenumber,
      user_location,
      followers,
      following,
      user_avatar,
      type: req.file.mimetype,
    }).then((data) => {
      res.status(201).send(data);
    });
  }
};

export const getUserProfile = async (req, res, next) => {
  await UserProfile.findAll()
    .then((data) => {
      res.status(200).json(data);
      next();
    })
    .catch((err) => next(err));
};

export const getUserById = async (req, res, next) => {
  const a_id = req.params.id;
  UserProfile.findByPk(a_id)
    .then((user) => {
      if (!user) {
        res.status(404).json({ message: "User Not Found" });
        next();
      } else {
        res.json(user);
      }
    })
    .catch();
};

export const getSingleUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await UserProfile.findOne({
      where: { userId: userId },
    });
    if (user) {
      return res.status(200).json({ user });
    }
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

export const searchUserQuery = async (req, res, next) => {
  // Retrieve all Tutorials from the database.
  const title = req.query.user_fname;
  var condition = title ? { user_fname: { [Op.like]: `%${title}%` } } : null;

  await UserProfile.findAll({ where: condition })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
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
    const fileTypes = /jpeg||jpg||png||gif/;
    const mimeTypes = fileTypes.test(file.mimetype);
    const extname = fileTypes.test(path.extname(file.originalname));

    if (mimeTypes && extname) {
      cb(null, true);
    } else {
      cb("Please Upload the correct file Type");
    }
  },
}).single("image");
