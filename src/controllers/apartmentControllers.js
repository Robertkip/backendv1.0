import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import { Op } from "sequelize";
import axios from "axios";
import NodeGeocoder from "node-geocoder";

import { sequelize } from "../config/connectDb.js";
import Apartment from "../models/apartmentModel.js";

dotenv.config();




export const uploadApartment = async (req, res) => {
  try {

      const newApartment = new Apartment({
        apartment_name: req.body.apartment_name,
        apartment_location: req.body.apartment_location,
        apartment_description: req.body.apartment_description,
        apartment_slug: req.body.apartment_slug,
        rent_amount: req.body.rent_amount,
        address: req.body.address,
        agent_id: req.body.agent_id
      });
      try {
        await newApartment.save();
        console.log("Apartment Created");
      } catch (error) {
        console.log(error);
      }
     
    return res.status(201).send("Apartment Created Successfully");
  }
  catch (error) {
    console.error("Error saving apartment:", error);
    return res.status(500).send({ message: "Internal Server Error", error });
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

// export const getAllApartments = async (req, res) => {
//   await Apartment.findAll().then((data) => {
//     console.log("Apartment Data Is",data);
//     return res.status(200).json(data);
//   });
// };


export const getLandlordApartments = async (req, res) => {
  try {
    const { landlord_id } = req.params;
    const apartments = await Apartment.findAll({
      where: { landlord_id: landlord_id },
    });
    if (apartments) {
      return res.status(200).json({ apartments });
    }
  } catch (error) {
    return res.status(500).send(error.message);
  }
};
export const getAgentApartments = async (req, res) => {
  try {
    const { agent_id } = req.params;
    const apartments = await Apartment.findAll({
      where: { agent_id: agent_id },
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

export const searchApartmentQuery = async (req, res) => {
  try {
    const { search } = req.query; 

    if (!search) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const apartments = await Apartment.findAll({
      where: {
        [Op.or]: [
          { apartment_name: { [Op.like]: `%${search}%` } },
          { apartment_location: { [Op.like]: `%${search}%` } },
          { address: { [Op.like]: `%${search}%` } },
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

async function getPlaceCoordinates(place) {
  const params = {
    input: place,
    inputtype: "textquery",
    fields: "geometry",
    key: API_KEY,
  };

  const response = await axios.get(PLACES_API_ENDPOINT, { params });

  console.log("Response is", response);

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
    const houseIds = results.map((result) => result.vicinity);
    console.log("House Ids Is", houseIds);
    await Apartment.findAll({
      where: { address: houseIds },
    }).then((data) => {
      return res.status(200).send(data);
    });
  } else {
    return res.status(500).send({ message: "No Data Founde" });
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
