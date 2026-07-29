import AgentProfile from "../models/agentProfileModel.js";

export const createAgentProfile = async (req, res) => {
  try {
    const user_id = req.user.id;

        console.log("User ID from  Create Profile request:", user_id);

    const { agent_fname, agent_lname, agent_mname, agent_phonenumber, agent_idno, agent_gender, agent_description } = req.body;

    const newAgentProfile = await AgentProfile.create({
      user_id,
      agent_fname,
      agent_lname,
      agent_mname,
      agent_phonenumber,
      agent_idno,
      agent_gender,
      agent_description
    });

    return res.status(201).json(newAgentProfile);
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

