import ApartmentComment from "../models/apartmentCommentModel.js";
import { canModify, sendForbidden } from "../helpers/ownership.js";

export const createApartmentComment = async (req, res) => {
  try {
    const { content } = req.body;
    const apartmentId = Number(req.body.apartmentId ?? req.body.apartment_id);
    if (!content || !Number.isInteger(apartmentId)) {
      return res.status(400).json({ message: "content and apartmentId are required" });
    }

    const userId = req.user.id;

    const newComment = await ApartmentComment.create({
      apartment_id: apartmentId,
      user_id: userId,
      content: content
    });

    return res.status(201).json(newComment);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

export const getApartmentComments = async (req, res) => {
  try {
    // The route is /apartment-comment/:id, where id is the apartment's id.
    const apartmentId = Number(req.params.id);
    if (!Number.isInteger(apartmentId)) {
      return res.status(400).json({ message: "id must be a number" });
    }

    const comments = await ApartmentComment.findAll({
      where: { apartment_id: apartmentId }
    });

    return res.status(200).json(comments);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

export const updateApartmentComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const apartmentComment = await ApartmentComment.findByPk(id);

    if (!apartmentComment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    if (!canModify(req.user, apartmentComment.user_id)) {
      return sendForbidden(res);
    }

    await apartmentComment.update({ content });

    return res.status(200).json(apartmentComment);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

export const deleteApartmentComment = async (req, res) => {
  try {
    const { id } = req.params;
    const apartmentComment = await ApartmentComment.findByPk(id);

    if (!apartmentComment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    if (!canModify(req.user, apartmentComment.user_id)) {
      return sendForbidden(res);
    }

    await apartmentComment.destroy();
    return res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};
