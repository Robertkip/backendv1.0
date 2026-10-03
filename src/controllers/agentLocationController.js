import AgentLocation from "../models/agentLocationModel.js";
import AgentProfile from "../models/agentProfileModel.js";
import { canModifyAgentRecord, sendForbidden } from "../helpers/ownership.js";


export const createAgentLocation = async (req, res) => {
  try {


        const user = req.user.id;
    
        console.log("User ID from request:", user);
        const agent = await AgentProfile.findOne({ where: { user_id: user } });
    
        const agent_profile_id = agent.id;

    const {agent_county, agent_subcounty, agent_town, agent_street, agent_location_description } = req.body;

    if (!agent_profile_id || !agent_county || !agent_subcounty || !agent_street) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newLocation = await AgentLocation.create({
      agent_profile_id,
      agent_county,
      agent_subcounty,
      agent_town,
      agent_street,
      agent_location_description
    });

    res.status(201).json(newLocation);
  } catch (error) {
    console.error("Error creating agent location:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getAgentLocations = async (req, res) => {
  try {
    const locations = await AgentLocation.findAll();
    res.status(200).json(locations);
  } catch (error) {
    console.error("Error fetching agent locations:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getSingleAgentLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const location = await AgentLocation.findByPk(id);

    if (!location) {
      return res.status(404).json({ message: "Agent location not found" });
    }

    res.status(200).json(location);
  } catch (error) {
    console.error("Error fetching agent location:", error);
    res.status(500).json({ message: error.message });
  }
};

export const updateAgentLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { agent_county, agent_subcounty, agent_town, agent_street, agent_location_description } = req.body;

    const location = await AgentLocation.findByPk(id);

    if (!location) {
      return res.status(404).json({ message: "Agent location not found" });
    }
    if (!(await canModifyAgentRecord(req.user, location.agent_profile_id))) {
      return sendForbidden(res);
    }

    await location.update({
      agent_county,
      agent_subcounty,
      agent_town,
      agent_street,
      agent_location_description
    });

    res.status(200).json(location);
  } catch (error) {
    console.error("Error updating agent location:", error);
    res.status(500).json({ message: error.message });
  }
};

export const deleteAgentLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const location = await AgentLocation.findByPk(id);

    if (!location) {
      return res.status(404).json({ message: "Agent location not found" });
    }
    if (!(await canModifyAgentRecord(req.user, location.agent_profile_id))) {
      return sendForbidden(res);
    }

    await location.destroy();
    res.status(200).json({ message: "Agent location deleted successfully" });

  } catch (error) {
    console.error("Error deleting agent location:", error);
    res.status(500).json({ message: error.message });
  }
};  


