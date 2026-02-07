import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import multer from "multer";
import { Op } from "sequelize";
import { fileURLToPath } from "url";

import Agent from "../models/agentModel.js";
import Apartment from "../models/apartmentModel.js";

dotenv.config();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOAD_DIR = path.join(__dirname, "Images");

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const BASE_IMAGE_URL =
  process.env.NODE_ENV === "development"
    ? process.env.DEVELOPMENT_IMAGE_URL
    : process.env.PRODUCTION_IMAGE_URL;

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, UPLOAD_DIR),
  filename: (_, file, cb) =>
    cb(null, `${Date.now()}${path.extname(file.originalname)}`),
});

export const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    const allowed = /jpeg|jpg|png|mp4|mkv/;
    const isValid =
      allowed.test(file.mimetype) &&
      allowed.test(path.extname(file.originalname).toLowerCase());

    cb(isValid ? null : new Error("Invalid file type"), isValid);
  },
}).array("files", 2);

export const registerAgent = async (req, res) => {
  try {
    const {
      userId,
      agent_fname,
      agent_lname,
      agent_phonenumber,
      agent_idno,
      agent_location,
      agent_gender,
      agent_address,
      agent_specialization,
      agent_description,
    } = req.body;

    if (!agent_fname || !agent_lname || !agent_phonenumber || !agent_idno) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const exists = await Agent.findOne({
      where: {
        [Op.or]: [{ agent_idno }, { agent_phonenumber }],
      },
    });

    if (exists) {
      return res.status(409).json({
        message: "Agent with provided ID or phone already exists",
      });
    }

    // ✅ FILE HANDLING FIX
    const files = req.files || [];

    const agent_avatar = files[0]
      ? BASE_IMAGE_URL + files[0].filename
      : null;

    const agent_id_photo = files[1]
      ? BASE_IMAGE_URL + files[1].filename
      : null;

    const agent = await Agent.create({
      userId,
      agent_fname,
      agent_lname,
      agent_phonenumber,
      agent_idno,
      agent_location,
      agent_gender,
      agent_address,
      agent_specialization,
      agent_description,
      agent_avatar,
      agent_id_photo,
      agent_verified: "PENDING",
      type: files[0]?.mimetype || null,
    });

    return res.status(201).json(agent);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};


export const getAllAgents = async (_, res) => {
  try {
    const agents = await Agent.findAll();
    return res.status(200).json(agents);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


export const getAgentById = async (req, res) => {
  try {
    const agent = await Agent.findByPk(req.params.id);

    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }

    return res.status(200).json(agent);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


export const getSingleAgent = async (req, res) => {
  try {
    const agent = await Agent.findOne({
      where: { userId: req.params.userId },
    });

    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }

    return res.status(200).json(agent);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/* ----------------------------- GET APARTMENTS BY AGENT ----------------------------- */

export const getAllApartmentsByAgent = async (req, res) => {
  try {
    const agent = await Agent.findByPk(req.params.id, {
      include: { model: Apartment, as: "apartments" },
    });

    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }

    return res.status(200).json(agent.apartments);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

