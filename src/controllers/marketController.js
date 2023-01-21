import multer from "multer";
import path from "path";
import Market from "../models/marketModel.js";

export const createMarket = (req, res) => {
    try {
        const product_image = "http://38.242.239.1:8084/images/" + req.file.filename;
        Market.create({
            sellerId: req.body.sellerId,
            product_name: req.body.product_name,
            product_description: req.body.product_description,
            product_price: req.body.product_price,
            type: req.file.mimetype,
            product_image: product_image,
        });
        return res.status(201).send("Product Uploaded");
    } catch (err) {
        res.status(500).send({message: err.message}) 
    }
}

export const getMarket = async (req, res) => {
   await Market.findAll().then(data => {
      return res.status(200).send(data);
   })
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, __basedir + '/Images')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname))
    }
 })
 
export const upload = multer({
    storage: storage,
    limits: { fileSize: '1000000' },
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png|gif/
        const mimeType = fileTypes.test(file.mimetype)  
        const extname = fileTypes.test(path.extname(file.originalname))
 
        if(mimeType && extname) {
            return cb(null, true)
        }
        cb('Give proper files formate to upload')
    }
 }).single('image')
