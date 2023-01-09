import Agent from "../models/agentModel.js";
import { Op } from "sequelize";
import multer from "multer";
import path from "path";

 
export const registerAgent = async (req, res) => {
    const userId = req.body.userId;
    const agent_fname = req.body.agent_fname;
    const agent_lname = req.body.agent_lname;
    const agent_phonenumber = req.body.agent_phonenumber;
    const agent_idno = req.body.agent_idno;
    const agent_location = req.body.agent_location;
    const agent_avatar = req.file.filename;

    const agent = await Agent.findOne({where: { [Op.or]: [{agent_idno}, {agent_phonenumber}]}})

    if(!agent_fname || !agent_lname || !agent_phonenumber || !agent_idno){
       res.status(400).json({msg: "Please Provide All Fields"})
    } else if(agent){
        res.status(400).json({msg: "User with that name does not exist"});
    } else {
        Agent.create({
            userId,
            agent_fname,
            agent_lname,
            agent_phonenumber,
            agent_idno,
            agent_location,
            agent_avatar,
            type: req.file.mimetype,
        }).then(data => {
            res.status(201).send(data);
        })
    }
}

export const getAllAgents = async (req, res) => {
   await Agent.findAll().then(data => {
      res.status(200).send(data);
   });
};


export const getAgentById = async (req, res, next) => {
   const a_id = req.params.id;
   Agent.findByPk(a_id).then(agent => {
    if(!agent){
        res.status(404).json({message: "Agent Not Found"});
        next();
    } else {
        res.json(agent)
    }
   }).catch()
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, __basedir, 'Image')
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

