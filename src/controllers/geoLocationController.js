import { getRedis } from "../config/redisClient.js";

const coordinatesKey = (userId) => `user_coordinates:${userId}`;

// Saves the logged-in user's latest position.
export const userGeolocation = async (req, res) => {
    const { latitude, longitude, timestamp } = req.body;
    if (latitude == null || longitude == null || !Number.isFinite(Number(latitude)) || !Number.isFinite(Number(longitude))) {
        return res.status(400).json({ error: "latitude and longitude are required" });
    }

    const coordinates = { id: req.user.id, latitude, longitude, timestamp: timestamp ?? Date.now() };
    const redis = await getRedis();
    await redis.set(coordinatesKey(req.user.id), JSON.stringify(coordinates));
    return res.status(200).json(coordinates);
};

// Latest position of ?id=, or of the logged-in user when no id is given.
export const getUserCoordinates = async (req, res) => {
    const userId = req.query.id === undefined ? req.user.id : Number(req.query.id);
    if (!Number.isInteger(userId)) {
        return res.status(400).json({ error: "id must be a number" });
    }

    const redis = await getRedis();
    const saved = await redis.get(coordinatesKey(userId));
    if (!saved) {
        return res.status(404).json({ error: "User coordinates not found." });
    }
    const { id, latitude, longitude } = JSON.parse(saved);
    return res.status(200).json({ id, latitude, longitude });
};
