import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import Market from "../models/marketModel.js";
import { canModify, sendForbidden } from "../helpers/ownership.js";

dotenv.config();

export const createMarket = async (req, res) => {
  const { product_name, product_description, product_quantity, product_price } = req.body;
  if (!product_name || !product_price) {
    return res.status(400).json({ msg: "Please Provide All Fields" });
  }
  if (await Market.findOne({ where: { product_name } })) {
    return res.status(400).json({ msg: "A product with that name already exists" });
  }

  const product = await Market.create({
    // The seller is whoever is logged in; ownership checks rely on it.
    sellerId: req.user.id,
    product_name,
    product_description,
    product_price,
    product_image: req.file ? process.env.PRODUCTION_IMAGE_URL + req.file.filename : null,
    product_quantity,
  });
  return res.status(201).send(product);
};

export const getMarket = async (req, res) => {
  const products = await Market.findAll();
  return res.status(200).send(products);
};

export const getMarketBySellerId = async (req, res) => {
  const sellerId = Number(req.params.sellerId);
  if (!Number.isInteger(sellerId)) {
    return res.status(400).json({ message: "sellerId must be a number" });
  }
  const market = await Market.findAll({ where: { sellerId } });
  return res.status(200).json({ market });
};

export const deleteMarket = async (req, res, next) => {
  const p_id = req.params.id;
  const product = await Market.findByPk(p_id);
  if (!product) {
    return res.status(404).json({ message: "Market product not found" });
  }
  if (!canModify(req.user, product.sellerId)) {
    return sendForbidden(res);
  }
  await Market.destroy({ where: { id: p_id } })
    .then(() => {
      res.status(200).json({ message: "Market deleted successfully" });
    })
    .catch((error) => next(error));
};

export const deleteAllMarket = async (req, res, next) => {
  await Market.destroy({ where: {}, truncate: false })
    .then(() => {
      res.status(200).json({ message: "Market deleted successfully" });
    })
    .catch((error) => next(error));
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
    const mimeTypes = fileTypes.test(file.mimetype);
    const extname = fileTypes.test(path.extname(file.originalname));

    if (mimeTypes && extname) {
      cb(null, true);
    } else {
      cb("Please Upload the correct file Type");
    }
  },
}).single("image");
