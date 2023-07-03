import redis from "redis";
import express from "express";
import { Authenticated } from "../middlewares/authorizationPermission.js";

const router = express.Router();

router.use(Authenticated);

const client = redis.createClient({
  host: "localhost",
  port: 6379,
});

await client.connect().catch(console.error);

export const addRating = async (req, res) => {
  const { user } = req;
  const userId = user.dataValues.id;
  const { itemId, rating } = req.body;
  client.hSet(`ratings:${itemId}`, userId, rating);
  res.status(200).json({ message: "Rating added successfully" });
};

export const getAverageRating = (req, res) => {
  const { itemId } = req.params;
  client.hVals(`ratings:${itemId}`, (err, ratings) => {
    if (err) {
      res
        .status(500)
        .json({ error: "An error occurred while fetching ratings" });
    } else {
      const sum = ratings.reduce((acc, rating) => acc + parseInt(rating), 0);
      const average = sum / ratings.length;
      res.status(200).json({ average });
    }
  });
};
