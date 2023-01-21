import multer from "multer";
import path from "path";
import Market from "../models/marketModel.js";

export const createMarket = async (req, res) => {
    const sellerId = req.body.sellerId;
    const product_name = req.body.product_name;
    const product_description = req.body.product_description;
    const product_price = req.body.product_price;
    const product_image = "http://38.242.239.1:8084/" + req.file.filename;

    const market = await Market.findOne({where:{product_name}});

    if(!product_name || !product_price){
       res.status(400).json({msg: "Please Provide All Fields"})
    } else if(market){
        res.status(400).json({msg: "Product with that name does not exist"});
    } else {
        Market.create({
            sellerId,
            product_name,
            product_description,
            product_price,
            product_image
        }).then(data => {
            res.status(201).send(data);
        })
    }
}

export const getMarket = async (req, res) => {
   await Market.findAll().then(data => {
      return res.status(200).send(data);
   })
}


export const getMarketBySellerId = async () => {
   try {
     const {sellerId} = req.params;

     const market = Market.findOne({
        where: {sellerId: sellerId}
     })
     if(market){
        return res.status(200).json({market});
      }
    } catch (error) {
      return res.status(500).send(error.message);
    }
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, __basedir + '/Images')
    },
    filename: (req, file, cb) => {
       cb(null, Date.now() + path.extname(file.originalname));
    }
})

export const upload = multer({
    storage: storage,
    limits: {fileSize: '1000000'},
    fileFilter: (req, file, cb ) => {
        const fileTypes = /jpeg||jpg||png||gif/;
        const mimeTypes = fileTypes.test(file.mimetype);
        const extname = fileTypes.test(path.extname(file.originalname));

    if( mimeTypes && extname){
        cb(null, true);
    } else {
        cb("Please Upload the correct file Type");
      }
    }
}).single('image');

