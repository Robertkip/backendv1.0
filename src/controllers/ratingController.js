import { getRedis } from "../config/redisClient.js";

export const addRating = async (req, res) => {
  const { itemId, rating } = req.body;
  const value = Number(rating);
  if (!itemId || !Number.isFinite(value) || value < 1 || value > 5) {
    return res.status(400).json({ message: "itemId and a rating from 1 to 5 are required" });
  }
  const redis = await getRedis();
  await redis.hSet(`ratings:${itemId}`, String(req.user.id), String(value));
  return res.status(200).json({ message: "Rating added successfully" });
};

export const getAverageRating = async (req, res) => {
  const { itemId } = req.params;
  const redis = await getRedis();
  const ratings = (await redis.hVals(`ratings:${itemId}`)).map(Number);
  const average = ratings.length ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : 0;
  return res.status(200).json({ average, count: ratings.length });
};
