import Redis from 'ioredis';
import PostSchema from '../mongomodel/postSchema.js';

const redis = new Redis();

export async function createPost({ userId, content, media }) {
  const post = await PostSchema.create({ userId, content, media });
  await redis.lpush(`timeline:${userId}`, JSON.stringify(post));
  return { postId: post._id.toString() };
}

export async function getTimeline({ userId }) {
  let cached = await redis.lrange(`timeline:${userId}`, 0, 10);
  if (cached.length > 0) {
    return { posts: cached.map((p) => JSON.parse(p)) };
  }

  const posts = await PostSchema.find({ userId }).sort({ createdAt: -1 }).limit(10);
  posts.forEach((p) => redis.rpush(`timeline:${userId}`, JSON.stringify(p)));
  return { posts };
}
