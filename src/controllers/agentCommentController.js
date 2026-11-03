import AgentComment from "../models/agentCommentModel.js";
import User from "../models/authModel.js";
import { canModify, sendForbidden } from "../helpers/ownership.js";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const withAuthor = {
  include: [{ model: User, as: "user", attributes: ["id", "username", "user_avatar"] }],
};

// Comment ids are UUIDs; anything else cannot match a comment.
const findComment = (id, options) => (UUID.test(id) ? AgentComment.findByPk(id, options) : null);

export const createAgentComment = async (req, res) => {
  const { content, agent_id } = req.body;
  if (!content || !agent_id) {
    return res.status(400).json({ message: "content and agent_id are required" });
  }
  const newComment = await AgentComment.create({ user_id: req.user.id, content, agent_id });
  return res.status(201).json(newComment);
};

// GET /agent-comments/:agentId lists the comments on one agent profile.
export const getAgentComments = async (req, res) => {
  const agentId = Number(req.params.agentId);
  if (!Number.isInteger(agentId)) {
    return res.status(400).json({ message: "agentId must be a number" });
  }
  const comments = await AgentComment.findAll({ where: { agent_id: agentId }, ...withAuthor });
  return res.status(200).json(comments);
};

export const getSingleAgentComment = async (req, res) => {
  const comment = await findComment(req.params.id, withAuthor);
  if (!comment) {
    return res.status(404).json({ message: "Comment not found" });
  }
  return res.status(200).json(comment);
};

export const updateAgentComment = async (req, res) => {
  const comment = await findComment(req.params.id);
  if (!comment) {
    return res.status(404).json({ message: "Comment not found" });
  }
  if (!canModify(req.user, comment.user_id)) {
    return sendForbidden(res);
  }
  comment.content = req.body.content;
  await comment.save();
  return res.status(200).json(comment);
};

export const deleteAgentComment = async (req, res) => {
  const comment = await findComment(req.params.id);
  if (!comment) {
    return res.status(404).json({ message: "Comment not found" });
  }
  if (!canModify(req.user, comment.user_id)) {
    return sendForbidden(res);
  }
  await comment.destroy();
  return res.status(200).json({ message: "Comment deleted successfully" });
};
