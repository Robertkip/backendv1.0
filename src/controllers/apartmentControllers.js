import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import { Op } from "sequelize";
import axios from "axios";
import NodeGeocoder from "node-geocoder";
import Apartment from "../models/apartmentModel.js";

dotenv.config();

const PLACES_API_ENDPOINT = process.env.PLACES_API_ENDPOINT;
const PLACES_SEARCH_API_ENDPOINT = process.env.PLACES_SEARCH_API_ENDPOINT;
const API_KEY = process.env.API_KEY;

const geocoder = NodeGeocoder({
  provider: "google",
  apiKey: API_KEY,
});

async function geocodeAddress(address) {
  return geocoder.geocode(address).then((result) => {
    if (result.length === 0) {
      throw new Error("Unable to geocode address");
    }
    return {
      latitude: result[0].latitude,
      longitude: result[0].longitude,
    };
  });
}

export const uploadApartment = async (req, res) => {
  try {
    if (process.env.NODE_ENV === "development") {
      const name1 = "http://192.168.1.120:8084/images/" + req.files[0].filename;
      const name2 = "http://192.168.1.120:8084/images/" + req.files[1].filename;
      const name3 = "http://192.168.1.120:8084/images/" + req.files[2].filename;
      const name4 = "http://192.168.1.120:8084/images/" + req.files[3].filename;
      const newApartment = new Apartment({
        apartment_name: req.body.apartment_name,
        apartment_location: req.body.apartment_location,
        apartment_description: req.body.apartment_description,
        address: req.body.address,
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
      try {
        // const location = await geocodeAddress(newApartment.address);
        // newApartment.latitude = location.latitude;
        // newApartment.longitude = location.longitude;

        await newApartment.save();
        console.log("Apartment Created");
      } catch (error) {
        console.log(error);
      }
    } else if (process.env.NODE_ENV === "production") {
      const name1 = "http://38.242.239.1:8084/images/" + req.files[0].filename;
      const name2 = "http://38.242.239.1:8084/images/" + req.files[1].filename;
      const name3 = "http://38.242.239.1:8084/images/" + req.files[2].filename;
      const name4 = "http://38.242.239.1:8084/images/" + req.files[3].filename;
      const newApartment = new Apartment({
        apartment_name: req.body.apartment_name,
        apartment_location: req.body.apartment_location,
        apartment_description: req.body.apartment_description,
        logent_id: req.body.logent_id,
        address: req.body.address,
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
      try {
        const location = await geocodeAddress(newApartment.address);
        newApartment.latitude = location.latitude;
        newApartment.longitude = location.longitude;

        await newApartment.save();
        console.log("Apartment Created");
      } catch (error) {
        console.log(error);
      }
    } else {
      const name1 = "http://192.168.0.37:8084/images/" + req.files[0].filename;
      const name2 = "http://192.168.0.37:8084/images/" + req.files[1].filename;
      const name3 = "http://192.168.0.37:8084/images/" + req.files[2].filename;
      const name4 = "http://192.168.0.37:8084/images/" + req.files[3].filename;
      const newApartment = new Apartment({
        apartment_name: req.body.apartment_name,
        apartment_location: req.body.apartment_location,
        apartment_description: req.body.apartment_description,
        logent_id: req.body.logent_id,
        address: req.body.address,
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

      try {
        const location = await geocodeAddress(newApartment.address);
        newApartment.latitude = location.latitude;
        newApartment.longitude = location.longitude;

        await newApartment.save();
      } catch (error) {
        res.send(error);
      }
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
          err.message || "Some error occurred while retrieving Apartments.",
      });
    });
};

async function getPlaceCoordinates(place) {
  const params = {
    input: place,
    inputtype: "textquery",
    fields: "geometry",
    key: API_KEY,
  };

  const response = await axios.get(PLACES_API_ENDPOINT, { params });

  // Parse the response to retrieve the latitude and longitude coordinates
  if (response.status === 200) {
    const result = response.data.candidates[0];
    const { lat, lng } = result.geometry.location;
    return { latitude: lat, longitude: lng };
  } else {
    return null;
  }
}

export async function searchApartmentInPlace(req, res, next) {
  const { place } = req.query;

  // Get the geographic coordinates of the selected place
  const coordinates = await getPlaceCoordinates(place);
  console.log("Place Coordinates are", coordinates);

  // Query your model for houses that are within a certain radius of the selected place
  const radius = 500; // in meters
  const houses = await Apartment.findAll({
    latitude: {
      [Op.gte]: coordinates.latitude - 0.01,
      [Op.lte]: coordinates.latitude + 0.01,
    },
    longitude: {
      [Op.gte]: coordinates.longitude - 0.01,
      [Op.lte]: coordinates.longitude + 0.01,
    },
  });

  // Make a request to the Google Places API to search for houses in the selected place
  const params = {
    location: `${coordinates.latitude},${coordinates.longitude}`,
    radius,
    type: "house",
    key: API_KEY,
  };
  const response = await axios.get(PLACES_SEARCH_API_ENDPOINT, { params });

  console.log("Response is", response);
  // Parse the response to retrieve the list of house results
  if (response.status === 200) {
    const results = response.data.results;
    console.log("Results is", results);
    const houseIds = results.map((result) => result.id);
    const housesInArea = await Apartment.findAll({ where: { id: houseIds } });
    return housesInArea;
  } else {
    return [];
  }
}

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
