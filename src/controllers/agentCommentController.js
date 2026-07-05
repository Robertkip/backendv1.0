import AgentComment  from "../models/agentCommentModel.js";


export const createAgentComment = async (req, res) => {
  try {
    const { content, agent_id } = req.body;
    const user_id = req.user.id;

    const newComment = await AgentComment.create({
      user_id: user_id,
      content: content,
      agent_id: agent_id
    });

    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export const getAgentComments = async (req, res) => {
  try {
    const { agent_id } = req.params;

    const comments = await AgentComment.findAll({
      where: { agent_id: agent_id },
      include: [
        {
          model: UserProfile,
          as: "user",
          attributes: ["id", "user_fname", "user_lname", "user_avatar"]
        }
      ]
    });

    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export const getSingleAgentComment = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await AgentComment.findByPk(id, {
      include: [
        {
          model: UserProfile,
          as: "user",
          attributes: ["id", "user_fname", "user_lname", "user_avatar"]
        }
      ]
    });

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    res.status(200).json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}


export const updateAgentComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const comment = await AgentComment.findByPk(id);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if the user is the owner of the comment
    if (comment.user_id !== req.user.id) {
      return res.status(403).json({ message: "You are not authorized to update this comment" });
    }

    comment.content = content;
    await comment.save();

    res.status(200).json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export const deleteAgentComment = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await AgentComment.findByPk(id);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if the user is the owner of the comment
    if (comment.user_id !== req.user.id) {
      return res.status(403).json({ message: "You are not authorized to delete this comment" });
    }

    await comment.destroy();

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}   


