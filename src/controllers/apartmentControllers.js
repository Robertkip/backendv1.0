import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import { Op } from "sequelize";
import slugify from "slugify";

import { sequelize } from "../config/connectDb.js";
import Apartment from "../models/apartmentModel.js";
import Landlord from "../models/landlordModel.js";
import { getPlaceCoordinates, PlacesNotConfiguredError, SEARCH_RADIUS_DEGREES } from "../services/places.js";
import { canModifyApartment, sendForbidden } from "../helpers/ownership.js";

dotenv.config();



export const uploadApartment = async (req, res) => {


   const apartment_name = req.body.apartment_name;
    if (!apartment_name) {
      return res.status(400).send({ message: "apartment_name is required" });
    }


  const apartment_slug = await generateUniqueSlug(apartment_name);

  try {

      const newApartment = new Apartment({
        apartment_name: apartment_name,
        apartment_location: req.body.apartment_location,
        apartment_description: req.body.apartment_description,
        apartment_slug: apartment_slug,
        address: req.body.address,
        agent_id: req.user.id
      });
      await newApartment.save();
      return res.status(201).send("Apartment Created Successfully");
  }
  catch (error) {
    console.error("Error saving apartment:", error);
    return res.status(500).send({ message: "Internal Server Error" });
}
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
  try {
    const { page, size } = req.query;
    const { limit, offset } = getPagination(page, size);

    const query = `
      SELECT 
        a.*,
        f.first_image, f.second_image, f.third_image, f.fourth_image, f.video_path,
        l.country, l.county, l.city_town, l.latitude, l.longitude, l.address,
        p.number_of_units, p.number_of_one_bd, p.number_of_two_bd, p.number_of_three_bd
      FROM rental_apartments a
      LEFT JOIN apartment_files f ON a.id = f.apartment_id
      LEFT JOIN apartment_locations l ON a.id = l.apartment_id
      LEFT JOIN apartment_properties p ON a.id = p.apartment_id
      ORDER BY a.id DESC
      LIMIT :limit OFFSET :offset
    `;

    const countQuery = `
      SELECT COUNT(DISTINCT a.id) as total
      FROM rental_apartments a
      LEFT JOIN apartment_files f ON a.id = f.apartment_id
      LEFT JOIN apartment_locations l ON a.id = l.apartment_id
      LEFT JOIN apartment_properties p ON a.id = p.apartment_id
    `;

    const [results, [countResult]] = await Promise.all([
      sequelize.query(query, {
        replacements: { limit, offset },
        type: sequelize.QueryTypes.SELECT
      }),
      sequelize.query(countQuery, {
        type: sequelize.QueryTypes.SELECT
      })
    ]);

    const totalItems = countResult.total;
    const response = {
      totalItems,
      apartments: results,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page ? +page : 0
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error("SQL Error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getAllRentals = async (req, res) => {
  return getAllApartments(req, res);
};

// export const getAllApartments = async (req, res) => {
//   await Apartment.findAll().then((data) => {
//     console.log("Apartment Data Is",data);
//     return res.status(200).json(data);
//   });
// };


// Apartments that belong to a user: listed by them (agent_id) or attached to
// their landlord record (landlord_id points at the landlords table).
export const getUserApartments = async (req, res) => {
  const userId = Number(req.params.logent_id);
  if (!Number.isInteger(userId)) {
    return res.status(400).json({ message: "logent_id must be a number" });
  }
  const landlords = await Landlord.findAll({ where: { userId }, attributes: ["id"] });
  const apartments = await Apartment.findAll({
    where: {
      [Op.or]: [
        { agent_id: userId },
        { landlord_id: landlords.map((landlord) => landlord.id) },
      ],
    },
  });
  return res.status(200).json({ apartments });
};

export const getApartmentByUser = async (req, res) => {
  const apartments = await Apartment.findAll({ where: { agent_id: req.user.id } });
  return res.status(200).json(apartments);
};

export const getApartmentById = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ message: "id must be a number" });
  }
  const apartment = await Apartment.findByPk(id);
  if (!apartment) {
    return res.status(404).json({ message: "Apartment not found" });
  }
  return res.json(apartment);
};

export const updateApartment = async (req, res, next) => {
  const p_id = req.params.id;
  const {
    apartment_name,
    apartment_location,
    apartment_slug,
    rent_amount,
    apartment_description,
    agent_id,
  } = req.body;
  await Apartment.update(
    { apartment_name, apartment_location, apartment_slug, rent_amount, apartment_description, agent_id },
    { where: { id: p_id } }
  )
    .then(() => {
      res.status(200).json({ message: "Apartment updated successfully" });
    })
    .catch((error) => next(error));
};

export const deleteApartment = async (req, res, next) => {
  const p_id = req.params.id;
  const apartment = await Apartment.findByPk(p_id);
  if (!apartment) {
    return res.status(404).json({ message: "Apartment not found" });
  }
  if (!(await canModifyApartment(req.user, apartment))) {
    return sendForbidden(res);
  }
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

// Joins each apartment with its location, so searches can match on place.
const APARTMENT_WITH_LOCATION = `
  SELECT a.*, l.country, l.county, l.city_town, l.latitude, l.longitude, l.address
  FROM rental_apartments a
  LEFT JOIN apartment_locations l ON a.id = l.apartment_id
`;

export const searchApartmentQuery = async (req, res) => {
  const { search } = req.query;
  if (!search) {
    return res.status(400).json({ message: "Search query is required" });
  }

  const apartments = await sequelize.query(
    `${APARTMENT_WITH_LOCATION}
     WHERE a.apartment_name ILIKE :term
        OR l.city_town ILIKE :term
        OR l.county ILIKE :term
        OR l.address ILIKE :term
     ORDER BY a.id DESC`,
    { replacements: { term: `%${search}%` }, type: sequelize.QueryTypes.SELECT }
  );

  if (apartments.length === 0) {
    return res.status(404).json({ message: "No apartments found" });
  }
  return res.status(200).json(apartments);
};

const generateUniqueSlug = async (baseName) => {
  let slug = slugify(baseName, { lower: true, strict: true });
  let uniqueSlug = slug;
  let counter = 1;

  while (await Apartment.findOne({ where: { apartment_slug: uniqueSlug } })) {
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }
  return uniqueSlug;
};

// Apartments whose location lies within about 1 km of a named place.
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

  const apartments = await sequelize.query(
    `${APARTMENT_WITH_LOCATION}
     WHERE l.latitude ~ '^-?[0-9.]+$' AND l.longitude ~ '^-?[0-9.]+$'
       AND l.latitude::float BETWEEN :minLat AND :maxLat
       AND l.longitude::float BETWEEN :minLng AND :maxLng
     ORDER BY a.id DESC`,
    {
      replacements: {
        minLat: coordinates.latitude - SEARCH_RADIUS_DEGREES,
        maxLat: coordinates.latitude + SEARCH_RADIUS_DEGREES,
        minLng: coordinates.longitude - SEARCH_RADIUS_DEGREES,
        maxLng: coordinates.longitude + SEARCH_RADIUS_DEGREES,
      },
      type: sequelize.QueryTypes.SELECT,
    }
  );
  return res.status(200).json(apartments);
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
