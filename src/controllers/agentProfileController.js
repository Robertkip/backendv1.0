import AgentProfile from "../models/agentProfileModel.js";
import ejs from "ejs";
import path from "path";
import { fileURLToPath } from "url";
import { publishEmailJob } from "../rabbitmq/publisher.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createAgentProfile = async (req, res) => {
  try {
    const user_id = req.user.id;
    const roleId = req.user.roleId;

    if (roleId !== 2 && roleId !== 3) {
      return res.status(403).json({ message: "Only agents and landlords can submit an onboarding request." });
    }

    const existingProfile = await AgentProfile.findOne({ where: { user_id } });
    if (existingProfile) {
      return res.status(409).json({
        message: "An agent profile already exists for this user.",
        data: existingProfile,
      });
    }

    const { agent_fname, agent_lname, agent_mname, agent_phonenumber, agent_idno, agent_gender, agent_description } = req.body;

    const newAgentProfile = await AgentProfile.create({
      user_id,
      agent_fname,
      agent_lname,
      agent_mname,
      agent_phonenumber,
      agent_idno,
      agent_gender,
      agent_description,
      agent_verified: "PENDING",
      is_agent_verified: false,
    });

    const templatePath = path.join(__dirname, "../templates/layouts/agent-registration-request.ejs");
    const html = await ejs.renderFile(templatePath, {
      name: req.user.username || req.user.email || "Agent",
      requestId: newAgentProfile.id,
    });

    await publishEmailJob({
      to: req.user.email,
      subject: "Your agent registration request has been received",
      html,
      text: `Hello ${req.user.username || req.user.email}, your agent registration request has been received and is pending verification.`,
    });

    return res.status(201).json({
      message: "Agent registration request submitted successfully. Your profile is pending verification.",
      data: newAgentProfile,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

export const getAgentProfiles = async (req, res) => {
  try {
    const agentProfiles = await AgentProfile.findAll();
    return res.status(200).json(agentProfiles);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

export const getMyAgentProfile = async (req, res) => {
  try {
    const agentProfile = await AgentProfile.findOne({ where: { user_id: req.user.id } });

    if (!agentProfile) {
      return res.status(404).json({ message: "Agent onboarding has not been submitted." });
    }

    return res.status(200).json(agentProfile);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

export const getSingleAgentProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const agentProfile = await AgentProfile.findByPk(id);

    if (!agentProfile) {
      return res.status(404).json({ message: "Agent profile not found" });
    }

    return res.status(200).json(agentProfile);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

export const updateAgentProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { agent_name, agent_email, agent_phone, agent_description } = req.body;

    const agentProfile = await AgentProfile.findByPk(id);

    if (!agentProfile) {
      return res.status(404).json({ message: "Agent profile not found" });
    }

    await agentProfile.update({
      agent_name,
      agent_email,
      agent_phone,
      agent_description
    });

    return res.status(200).json(agentProfile);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

export const deleteAgentProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const agentProfile = await AgentProfile.findByPk(id);

    if (!agentProfile) {
      return res.status     (404).json({ message: "Agent profile not found" });
    }

    await agentProfile.destroy();
    return res.status(200).json({ message: "Agent profile deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

