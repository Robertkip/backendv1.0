import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import { Op } from "sequelize";
import { Sequelize } from "sequelize";
import Apartment from "../models/apartmentModel.js";
import { sequelize } from "../config/connectDb.js";

dotenv.config();

export const uploadApartment = (req, res) => {
  try {
    if (process.env.NODE_ENV === "development") {
      const name1 = "http://192.168.0.37:8084/images/" + req.files[0].filename;
      const name2 = "http://192.168.0.37:8084/images/" + req.files[1].filename;
      const name3 = "http://192.168.0.37:8084/images/" + req.files[2].filename;
      const name4 = "http://192.168.0.37:8084/images/" + req.files[3].filename;
      Apartment.create({
        apartment_name: req.body.apartment_name,
        apartment_location: req.body.apartment_location,
        apartment_description: req.body.apartment_description,
        logent_id: req.body.logent_id,
        type1: req.files.mimetype,
        name1: name1,
        type2: req.files.mimetype,
        name2: name2,
        type3: req.files.mimetype,
        name3: name3,
        type4: req.files.mimetype,
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
    } else if (process.env.NODE_ENV === "production") {
      const name1 = "http://38.242.239.1:8084/images/" + req.files[0].filename;
      const name2 = "http://38.242.239.1:8084/images/" + req.files[1].filename;
      const name3 = "http://38.242.239.1:8084/images/" + req.files[2].filename;
      const name4 = "http://38.242.239.1:8084/images/" + req.files[3].filename;
      Apartment.create({
        apartment_name: req.body.apartment_name,
        apartment_location: req.body.apartment_location,
        apartment_description: req.body.apartment_description,
        logent_id: req.body.logent_id,
        type1: req.files.mimetype,
        name1: name1,
        type2: req.files.mimetype,
        name2: name2,
        type3: req.files.mimetype,
        name3: name3,
        type4: req.files.mimetype,
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
    } else {
      const name1 = "http://192.168.0.37:8084/images/" + req.files[0].filename;
      const name2 = "http://192.168.0.37:8084/images/" + req.files[1].filename;
      const name3 = "http://192.168.0.37:8084/images/" + req.files[2].filename;
      const name4 = "http://192.168.0.37:8084/images/" + req.files[3].filename;
      Apartment.create({
        apartment_name: req.body.apartment_name,
        apartment_location: req.body.apartment_location,
        apartment_description: req.body.apartment_description,
        logent_id: req.body.logent_id,
        type1: req.files.mimetype,
        name1: name1,
        type2: req.files.mimetype,
        name2: name2,
        type3: req.files.mimetype,
        name3: name3,
        type4: req.files.mimetype,
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
    }
    return res.status(201).send("Apartment Created Successfully");
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const getAllApartments = async (req, res) => {
  await Apartment.findAll().then((data) => {
    return res.status(200).send(data);
  });
};

export const getTenantLandlordApartments = async (req, res) => {
  try {
    const { logent_id } = req.params;
    const apartments = await Apartment.findAll({
      where: { logent_id: logent_id },
    });
    if (apartments) {
      return res.status(200).json({ apartments });
    }
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

export const getApartmentById = async (req, res, next) => {
  const p_id = req.params.id;
  Apartment.findByPk(p_id)
    .then((apartment) => {
      if (!apartment) {
        res.status(404).json({ message: "Apartment not found" });
        next();
      } else {
        return res.json(apartment);
      }
    })
    .catch((error) => next(error));
};

export const updateApartment = async (req, res, next) => {
  const p_id = req.params.id;
  const {
    apartment_name,
    apartment_location,
    apartment_description,
    logent_id,
  } = req.body;
  await Apartment.update(
    { apartment_name, apartment_location, apartment_description, logent_id },
    { where: { id: p_id } }
  )
    .then(() => {
      res.status(200).json({ message: "Apartment updated successfully" });
    })
    .catch((error) => next(error));
};

export const deleteApartment = async (req, res, next) => {
  const p_id = req.params.id;
  await Apartment.destroy({ where: { id: p_id } })
    .then(() => {
      res.status(200).json({ message: "Apartment deleted successfully" });
    })
    .catch((error) => next(error));
};

export const deleteAllApartments = async (req, res, next) => {
  await Apartment.destroy({ where: {}, truncate: false })
    .then(() => {
      res.status(200).json({ message: "All Apartments deleted successfully" });
    })
    .catch((error) => next(error));
};

export const searchApartmentQuery = async (req, res, next) => {
  // Retrieve all Tutorials from the database.
  const title = req.query.apartment_location;
  var condition = title
    ? { apartment_location: { [Op.like]: `%${title}%` } }
    : null;

  await Apartment.findAll({ where: condition })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    });
};

// console.log(rows[0]);
// console.log(rows[0].length);
// console.log(rows[0][0].apartment_name);
// console.log(rows[0][0].apartment_location);

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
    const mimeType = fileTypes.test(file.mimetype);
    const extname = fileTypes.test(path.extname(file.originalname));

    if (mimeType && extname) {
      return cb(null, true);
    }
    cb("Give proper files formate to upload");
  },
}).array("images", 4);
