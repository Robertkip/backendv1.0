import express from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from "url";
import { Authenticated } from '../middlewares/authorizationPermission.js';
import UserProfile from '../models/userProfileModel.js';
import Media from "../models/mediaModel.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, "../../");
const uploadDir = path.join(projectRoot, "Posts");

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname)}`)
});

const upload = multer({ storage });

// Upload endpoint
router.post('/media', Authenticated, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ msg: 'No file uploaded' });

    // Determine file type
    const fileType = req.file.mimetype.startsWith("video") ? "video" :
                     req.file.mimetype.startsWith("image") ? "image" : "other";

    const fileUrl = `${req.protocol}://${req.get('host')}/Posts/${req.file.filename}`;

const userId = req.user.id;

// Find the user’s profile
const profile = await UserProfile.findOne({
  where: { userId: userId },   // Find by userId
});

if (!profile) {
  return res.status(400).json({ error: "User profile not found" });
}

// Save media using profile.id
const mediaItem = await Media.create({
  id: uuidv4(),
  url: fileUrl,
  type: fileType,
  uploadedBy: profile.id,  // ⭐ MUST BE profile.id, NOT userId
  usedInPost: false,
});

return res.json(mediaItem);

    res.json({ 
      msg: 'File uploaded successfully', 
      media: mediaRecord 
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error during file upload' });
  }
});

export default router;
