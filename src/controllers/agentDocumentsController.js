import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import AgentDocuments from "../models/agentDocumentsModel.js";
import fs from "fs";
import AgentProfile from "../models/agentProfileModel.js";


dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, "../../");
const PRODUCTION_IMAGE_ADDRESS = process.env.PRODUCTION_IMAGE_URL;
const DEVELOPMENT_IMAGE_URL = process.env.DEVELOPMENT_IMAGE_URL;

const uploadDir = path.join(projectRoot, "AgentDocuments");

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
}).array("files", 3);


export const createAgentDocument = async (req, res) => {
  try {

    const user = req.user.id;

    const agent = await AgentProfile.findOne({ where: { user_id: user } });

    const agent_id = agent.id;

    console.log("Uploaded by:", user);

    const files = req.files;

    if (!files || files.length < 1) {
      return res.status(400).json({ message: "At least one file is required" });
    }

    const baseUrl =
      process.env.NODE_ENV === "development"
        ? DEVELOPMENT_IMAGE_URL
        : PRODUCTION_IMAGE_ADDRESS;

    const fileData = {
      agent_profile_id: agent_id,
      file_size: files.reduce((total, file) => total + file.size, 0),
    };

    if (files[0]) fileData.first_image = baseUrl + files[0].filename;
    if (files[1]) fileData.second_image = baseUrl + files[1].filename;
    if (files[2]) fileData.third_image = baseUrl + files[2].filename;

    const agentFiles = await AgentDocuments.create(fileData);

    return res.status(201).json({
      message: "Agent files uploaded successfully",
      data: agentFiles,
    });
  } catch (error) {
    console.error("Error saving agent files:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
}

export const getAgentDocuments = async (req, res) => {
  try {
    const { agent_id } = req.params;

    const documents = await AgentDocuments.findAll({
      where: { agent_id: agent_id },
      include: [
        {
          model: UserProfile,
          as: "user",
          attributes: ["id", "user_fname", "user_lname", "user_avatar"]
        }
      ]
    });

    res.status(200).json(documents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export const getSingleAgentDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await AgentDocuments.findByPk(id, {
      include: [
        {
          model: UserProfile,
          as: "user",
          attributes: ["id", "user_fname", "user_lname", "user_avatar"]
        }
      ]
    });

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    res.status(200).json(document);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export const deleteAgentDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await AgentDocuments.findByPk(id);

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Delete the files from the filesystem
    const filesToDelete = [document.first_image, document.second_image, document.third_image];
    filesToDelete.forEach(filePath => {
      if (filePath) {
        const fullPath = path.join(uploadDir, path.basename(filePath));
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      }
    });

    await document.destroy();

    res.status(200).json({ message: "Document deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}   
