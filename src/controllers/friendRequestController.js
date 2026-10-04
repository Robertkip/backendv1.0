import FriendRequest from "../models/friendRequestModel.js";
export const postFriendRequest = async (req, res) => {
  try {
    const receiverId = Number(req.body.receiverId);
    if (!Number.isInteger(receiverId)) {
      return res.status(400).json({ error: "receiverId is required" });
    }

    // Requests are always sent by the logged-in user.
    const friendRequest = await FriendRequest.create({ senderId: req.user.id, receiverId });

    res.json(friendRequest);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const approveFriendRequest = async () => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Update the friend request status
    const friendRequest = await FriendRequest.findByPk(id);
    friendRequest.status = status;
    await friendRequest.save();

    res.json(friendRequest);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
