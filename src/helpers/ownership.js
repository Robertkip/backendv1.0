import Landlord from "../models/landlordModel.js";
import AgentProfile from "../models/agentProfileModel.js";

// ADMIN and SUPERADMIN role ids (see README → Configure Database).
const ADMIN_ROLE_IDS = [5, 6];

export const isAdmin = (user) => ADMIN_ROLE_IDS.includes(user?.roleId);

// True when the user is an admin or one of ownerUserIds is the user's own id.
export const canModify = (user, ...ownerUserIds) =>
  isAdmin(user) || ownerUserIds.some((id) => id != null && Number(id) === user?.id);

// An apartment belongs to the user who listed it (agent_id) and to the user
// behind its landlord record (landlord_id points at the landlords table).
export const canModifyApartment = async (user, apartment) => {
  if (canModify(user, apartment.agent_id)) return true;
  if (apartment.landlord_id == null) return false;
  const landlord = await Landlord.findByPk(apartment.landlord_id);
  return canModify(user, landlord?.userId);
};

// Agent records (documents, locations) belong to the user behind the agent profile.
export const canModifyAgentRecord = async (user, agentProfileId) => {
  if (isAdmin(user)) return true;
  const agentProfile = await AgentProfile.findByPk(agentProfileId);
  return canModify(user, agentProfile?.user_id);
};

export const sendForbidden = (res) =>
  res.status(403).json({ message: "You are not allowed to change this record" });
