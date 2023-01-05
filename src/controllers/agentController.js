import Agent from "../models/agentModel";
import { Op } from "sequelize";
import multer from "multer";
import path from "path";


const registerAgent = async (req, res) => {
    const agent_fname = req.body.agent_fname;
    const agent_lname = req.body.agent_lname;
    const agent_number = req.body.agent_number;
    const agent_idno = req.body.agent_idno;
    const agent_location = req.body.agent_location;
    const agent_avatar = req.body.agent_avatar;

    const agent = await Agent.findOne({where: { [Op.or]: [{agent_idno}, {agent_number}]}})

    if(!agent_fname || !agent_lname || !agent_number || !agent_idno){
       res.status(400).json({msg: "Please Provide All Fields"})
    } else if(agent){
        res.status(400).json({msg: "User with that name does not exist"});
    } else {
        Agent.create({
            agent_fname,
            agent_lname,
            agent_number,
            agent_idno,
            agent_location,
            agent_avatar,
        })
    }
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, __basedir, 'Image')
    },
    filename: (req, file, cb) => {
       cb(null, Date.now() + path.extname(file.originalname));
    }
})


