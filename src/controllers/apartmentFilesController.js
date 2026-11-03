import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { Op } from "sequelize";
import ApartmentFiles from "../models/apartmentFilesModel.js";
import Apartment from "../models/apartmentModel.js";
import { canModifyApartment, sendForbidden } from "../helpers/ownership.js";
import fs from "fs";
import { imageBaseUrl } from "../helpers/imageUrl.js";
import { logger, logRequestError } from "../config/logger.js";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, "../../");

const uploadDir = path.join(projectRoot, "Images");


logger.debug({ uploadDir }, "Serving uploaded files");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 150 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|mp4|mkv/;
    const mimeType = fileTypes.test(file.mimetype);
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());

    if (mimeType && extname) {
      return cb(null, true);
    }
    cb(new Error("Only jpeg, jpg, png, mp4, or mkv files are allowed"));
  },
}).array("files", 5);

export const uploadApartment = async (req, res) => {
  try {
    const { apartment_id } = req.body;

    const uploaded_by = req.user.id;
    
    const files = req.files;

    if (!apartment_id || !uploaded_by) {
      return res.status(400).json({ message: "Apartment and Uploader are required" });
    }

    const apartment = await Apartment.findByPk(apartment_id);
    if (!apartment) {
      return res.status(404).json({ message: "Apartment not found" });
    }
    if (!(await canModifyApartment(req.user, apartment))) {
      return sendForbidden(res);
    }

    if (!files || files.length < 1) {
      return res.status(400).json({ message: "At least one file is required" });
    }

    const baseUrl = imageBaseUrl();

    const fileData = {
      apartment_id,
      uploaded_by,
      file_size: files.reduce((total, file) => total + file.size, 0), 
    };

    if (files[0]) fileData.first_image = baseUrl + files[0].filename;
    if (files[1]) fileData.second_image = baseUrl + files[1].filename;
    if (files[2]) fileData.third_image = baseUrl + files[2].filename;
    if (files[3]) fileData.fourth_image = baseUrl + files[3].filename;
    if (files[4]) fileData.video_path = baseUrl + files[4].filename;

    const newApartment = await ApartmentFiles.create(fileData);

    return res.status(201).json({
      message: "Apartment files uploaded successfully",
      data: newApartment,
    });
  } catch (error) {
    logRequestError(req, error, "Error saving apartment files");
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

export const getPagination = (page, size) => {
  const limit = size ? +size : 3;
  const offset = page ? page * limit : 0;
  return { limit, offset };
};

export const getPagingData = (data, page, limit) => {
  const { count: totalItems, rows: apartments } = data;
  const currentPage = page ? +page : 0;
  const totalPages = Math.ceil(totalItems / limit);
  return { totalItems, apartments, totalPages, currentPage };
};
