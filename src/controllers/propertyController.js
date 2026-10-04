import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import { Op } from "sequelize";
import NodeGeocoder from "node-geocoder";
import { sequelize } from "../config/connectDb.js";
import Property from "../models/propertyModel.js";
import { getPlaceCoordinates, PlacesNotConfiguredError, SEARCH_RADIUS_DEGREES } from "../services/places.js";
import { canModify, sendForbidden } from "../helpers/ownership.js";

dotenv.config();

// Uploaded images are served from /images; this is the public URL prefix.
const imageBaseUrl = () =>
  (process.env.NODE_ENV === "production"
    ? process.env.PRODUCTION_IMAGE_URL
    : process.env.DEVELOPMENT_IMAGE_URL) || `http://localhost:${process.env.PORT || 8084}/images/`;

const geocodeAddress = async (address) => {
  const geocoder = NodeGeocoder({ provider: "google", apiKey: process.env.API_KEY });
  const [result] = await geocoder.geocode(address);
  return result ? { latitude: result.latitude, longitude: result.longitude } : null;
};

export const uploadApartment = async (req, res) => {
  const files = req.files || [];
  const property = new Property({
    agent_id: req.user.id,
    apartment_name: req.body.apartment_name,
    apartment_location: req.body.apartment_location,
    apartment_description: req.body.apartment_description,
    apartment_price: req.body.apartment_price,
    address: req.body.address,
  });
  files.slice(0, 4).forEach((file, i) => {
    property[`type${i + 1}`] = file.mimetype;
    property[`name${i + 1}`] = imageBaseUrl() + file.filename;
  });

  // Coordinates are a nice-to-have: a failed lookup must not block the listing.
  if (property.address && process.env.API_KEY) {
    try {
      const location = await geocodeAddress(property.address);
      if (location) {
        property.latitude = location.latitude;
        property.longitude = location.longitude;
      }
    } catch (error) {
      console.error("Geocoding failed for property address:", error.message);
    }
  }

  await property.save();
  return res.status(201).send("Apartment Created Successfully");
};

const getPagination = (page, size) => {
  const limit = size ? +size : 3;
  const offset = page ? page * limit : 0;

  return { limit, offset };
};

const getPagingData = (data, page, limit) => {
  const { count: totalItems, rows: apartments } = data;
  const currentPage = page ? +page : 0;
  const totalPages = Math.ceil(totalItems / limit);

  return { totalItems, apartments, totalPages, currentPage };
};

export const getAllApartments = async (req, res) => {
  const { page, size } = req.query;
  const { limit, offset } = getPagination(page, size);
  await Property.findAndCountAll(
    {
    limit,
    offset,
  }
  ).then((data) => {
    // const response = getPagingData(data, page, limit);
    return res.status(200).send(data);
  });
};

export const getAllProperties = async (req, res) => {
  return getAllApartments(req, res);
};



// Properties listed by one user (the agent_id recorded when it was created).
export const getUserProperties = async (req, res) => {
  const userId = Number(req.params.logent_id ?? req.params.agent_id);
  if (!Number.isInteger(userId)) {
    return res.status(400).json({ message: "id must be a number" });
  }
  const apartments = await Property.findAll({ where: { agent_id: userId } });
  return res.status(200).json({ apartments });
};

export const getApartmentById = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ message: "id must be a number" });
  }
  const property = await Property.findByPk(id);
  if (!property) {
    return res.status(404).json({ message: "Property not found" });
  }
  return res.json(property);
};

export const updateApartment = async (req, res, next) => {
  const p_id = req.params.id;
  const {
    apartment_name,
    apartment_location,
    apartment_description,
    apartment_price,
  } = req.body;
  await Property.update(
    { apartment_name, apartment_location, apartment_price, apartment_description },
    { where: { id: p_id } }
  )
    .then(() => {
      res.status(200).json({ message: "Apartment updated successfully" });
    })
    .catch((error) => next(error));
};

export const deleteApartment = async (req, res, next) => {
  const p_id = req.params.id;
  const property = await Property.findByPk(p_id);
  if (!property) {
    return res.status(404).json({ message: "Property not found" });
  }
  // Properties created before owners were recorded have no agent_id: admins only.
  if (!canModify(req.user, property.agent_id)) {
    return sendForbidden(res);
  }
  await Property.destroy({ where: { id: p_id } })
    .then(() => {
      res.status(200).json({ message: "Apartment deleted successfully" });
    })
    .catch((error) => next(error));
};

export const deleteAllApartments = async (req, res, next) => {
  await Property.destroy({ where: {}, truncate: false })
    .then(() => {
      res.status(200).json({ message: "All Apartments deleted successfully" });
    })
    .catch((error) => next(error));
};

export const searchApartmentQuery = async (req, res) => {
  try {
    const { search } = req.query; 

    if (!search) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const apartments = await Property.findAll({
      where: {
        [Op.or]: [
          { apartment_name: { [Op.iLike]: `%${search}%` } },
          { apartment_location: { [Op.iLike]: `%${search}%` } },
          { address: { [Op.iLike]: `%${search}%` } },
        ],
      },
    });

    if (apartments.length === 0) {
      return res.status(404).json({ message: "No apartments found" });
    }

    res.status(200).json(apartments);
  } catch (error) {
    console.error("Error searching apartments:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Properties within about 1 km of a named place.
export const searchApartmentInPlace = async (req, res) => {
  const { place } = req.query;
  if (!place) {
    return res.status(400).json({ message: "place is required" });
  }

  let coordinates;
  try {
    coordinates = await getPlaceCoordinates(place);
  } catch (error) {
    if (error instanceof PlacesNotConfiguredError) {
      return res.status(503).json({ message: error.message });
    }
    throw error;
  }
  if (!coordinates) {
    return res.status(404).json({ message: "Place not found" });
  }

  const properties = await Property.findAll({
    where: {
      [Op.and]: [
        sequelize.literal(`latitude ~ '^-?[0-9.]+$' AND longitude ~ '^-?[0-9.]+$'`),
        sequelize.where(sequelize.cast(sequelize.col("latitude"), "float"), {
          [Op.between]: [coordinates.latitude - SEARCH_RADIUS_DEGREES, coordinates.latitude + SEARCH_RADIUS_DEGREES],
        }),
        sequelize.where(sequelize.cast(sequelize.col("longitude"), "float"), {
          [Op.between]: [coordinates.longitude - SEARCH_RADIUS_DEGREES, coordinates.longitude + SEARCH_RADIUS_DEGREES],
        }),
      ],
    },
  });
  return res.status(200).json(properties);
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
    const mimeType = fileTypes.test(file.mimetype);
    const extname = fileTypes.test(path.extname(file.originalname));

    if (mimeType && extname) {
      return cb(null, true);
    }
    cb("Give proper files formate to upload");
  },
}).array("images", 4);
