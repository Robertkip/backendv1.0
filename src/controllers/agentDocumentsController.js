import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import AgentDocuments from "../models/agentDocumentsModel.js";
import fs from "fs";
import AgentProfile from "../models/agentProfileModel.js";
import { canModifyAgentRecord, sendForbidden } from "../helpers/ownership.js";


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

    if (!agent) {
      return res.status(404).json({ message: "Agent profile not found" });
    }

    const agent_id = agent.id;

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

    if (files[0]) fileData.agent_passport_photo = baseUrl + files[0].filename;
    if (files[1]) fileData.front_id_photo = baseUrl + files[1].filename;
    if (files[2]) fileData.back_id_photo = baseUrl + files[2].filename;

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

// Agent documents are identity papers: only the agent and admins may read them.

// GET /agent-documents/:id lists the documents of agent profile :id.
export const getAgentDocuments = async (req, res) => {
  const agentProfileId = Number(req.params.id);
  if (!Number.isInteger(agentProfileId)) {
    return res.status(400).json({ message: "id must be a number" });
  }
  if (!(await AgentProfile.findByPk(agentProfileId))) {
    return res.status(404).json({ message: "Agent profile not found" });
  }
  if (!(await canModifyAgentRecord(req.user, agentProfileId))) {
    return sendForbidden(res);
  }
  const documents = await AgentDocuments.findAll({ where: { agent_profile_id: agentProfileId } });
  return res.status(200).json(documents);
};

// GET /agent-documents lists the logged-in agent's own documents.
export const getMyAgentDocuments = async (req, res) => {
  const agent = await AgentProfile.findOne({ where: { user_id: req.user.id } });
  if (!agent) {
    return res.status(404).json({ message: "Agent profile not found" });
  }
  const documents = await AgentDocuments.findAll({ where: { agent_profile_id: agent.id } });
  return res.status(200).json(documents);
};

export const deleteAgentDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await AgentDocuments.findByPk(id);

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }
    if (!(await canModifyAgentRecord(req.user, document.agent_profile_id))) {
      return sendForbidden(res);
    }

    // Delete the files from the filesystem
    const filesToDelete = [document.agent_passport_photo, document.front_id_photo, document.back_id_photo];
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
    console.error("agentDocumentsController.js failed on " + req.method + " " + req.originalUrl + ":", error);
    res.status(500).json({ message: error.message });
  }
}   
