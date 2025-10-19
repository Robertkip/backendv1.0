import { sequelize } from '../config/connectDb.js';
import UserProfile from '../models/userProfileModel.js';
import Comment from '../models/commentModel.js';
import { QueryTypes } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

const socialResolvers = {
  Query: {
    getPosts: async (_, __, { user, roleId }) => {
      if (!user || !roleId) throw new Error('Unauthorized');
      const posts = await sequelize.query(
        `
        SELECT p.*, up.user_fname, up.user_lname, up.user_avatar
        FROM "posts" p
        JOIN "userprofiles" up ON p."authorId" = up."userId"
        ORDER BY p."createdAt" DESC
        `,
        { type: QueryTypes.SELECT }
      );
      return Promise.all(
        posts.map(async (post) => ({
          ...post,
          author: {
            userId: post.authorId,
            user_fname: post.user_fname,
            user_lname: post.user_lname,
            user_avatar: post.user_avatar,
          },
          likes: await sequelize.query(
            `
            SELECT up.* FROM "userprofiles" up
            JOIN "Likes" l ON up."userId" = l."userId"
            WHERE l."postId" = :postId
            `,
            { replacements: { postId: post.id }, type: QueryTypes.SELECT }
          ),
          comments: await Comment.findAll({
            where: { postId: post.id },
            include: [UserProfile],
          }),
          likeCount: (
            await sequelize.query(
              `SELECT COUNT(*) as count FROM "Likes" WHERE "postId" = :postId`,
              { replacements: { postId: post.id }, type: QueryTypes.SELECT }
            )
          )[0].count,
          originalPost: post.originalPostId
            ? (
                await sequelize.query(
                  `
                  SELECT p.*, up.user_fname, up.user_lname, up.user_avatar
                  FROM "posts" p
                  JOIN "userprofiles" up ON p."authorId" = up."userId"
                  WHERE p.id = :id
                  `,
                  { replacements: { id: post.originalPostId }, type: QueryTypes.SELECT }
                )
              )[0]
            : null,
        }))
      );
    },
    getPost: async (_, { id }, { user, roleId }) => {
      if (!user || !roleId) throw new Error('Unauthorized');
      const [post] = await sequelize.query(
        `
        SELECT p.*, up.user_fname, up.user_lname, up.user_avatar
        FROM "posts" p
        JOIN "userprofiles" up ON p."authorId" = up."userId"
        WHERE p.id = :id
        `,
        { replacements: { id }, type: QueryTypes.SELECT }
      );
      if (!post) throw new Error('Post not found');
      return {
        ...post,
        author: {
          userId: post.authorId,
          user_fname: post.user_fname,
          user_lname: post.user_lname,
          user_avatar: post.user_avatar,
        },
        likes: await sequelize.query(
          `
          SELECT up.* FROM "userprofiles" up
          JOIN "Likes" l ON up."userId" = l."userId"
          WHERE l."postId" = :postId
          `,
          { replacements: { postId: post.id }, type: QueryTypes.SELECT }
        ),
        comments: await Comment.findAll({
          where: { postId: post.id },
          include: [UserProfile],
        }),
        likeCount: (
          await sequelize.query(
            `SELECT COUNT(*) as count FROM "Likes" WHERE "postId" = :postId`,
            { replacements: { postId: post.id }, type: QueryTypes.SELECT }
          )
        )[0].count,
        originalPost: post.originalPostId
          ? (
              await sequelize.query(
                `
                SELECT p.*, up.user_fname, up.user_lname, up.user_avatar
                FROM "posts" p
                JOIN "userprofiles" up ON p."authorId" = up."userId"
                WHERE p.id = :id
                `,
                { replacements: { id: post.originalPostId }, type: QueryTypes.SELECT }
              )
            )[0]
            : null,
      };
    },
    getComments: async (_, { postId }, { user, roleId }) => {
      if (!user || !roleId) throw new Error('Unauthorized');
      return await sequelize.query(
        `
        SELECT c.*, up.user_fname, up.user_lname, up.user_avatar
        FROM "Comments" c
        JOIN "userprofiles" up ON c."authorId" = up."userId"
        WHERE c."postId" = :postId
        ORDER BY c."createdAt" DESC
        `,
        { replacements: { postId }, type: QueryTypes.SELECT }
      ).then(comments =>
        comments.map(c => ({
          ...c,
          author: {
            userId: c.authorId,
            user_fname: c.user_fname,
            user_lname: c.user_lname,
            user_avatar: c.user_avatar,
          },
          post: { id: c.postId },
        }))
      );
    },
    getUserProfile: async (_, { userId }, { user, roleId }) => {
      if (!user || !roleId) throw new Error('Unauthorized');
      const [profile] = await sequelize.query(
        `
        SELECT * FROM "userprofiles" WHERE "userId" = :userId
        `,
        { replacements: { userId }, type: QueryTypes.SELECT }
      );
      if (!profile) throw new Error('User profile not found');
      return profile;
    },
  },
  Mutation: {
    createPost: async (_, { content, imageUrl, videoUrl, originalPostId }, { user, roleId }) => {
      if (!user || !roleId) throw new Error('Unauthorized');
      if (!content && !imageUrl && !videoUrl && !originalPostId) {
        throw new Error('Post must have content, image, video, or be a share');
      }
      if (videoUrl && imageUrl) {
        throw new Error('Post cannot have both image and video');
      }
      const postId = uuidv4();
      const [post] = await sequelize.query(
        `
        INSERT INTO "posts" ("id", "content", "imageUrl", "videoUrl", "authorId", "originalPostId", "createdAt")
        VALUES (:id, :content, :imageUrl, :videoUrl, :authorId, :originalPostId, NOW())
        RETURNING *
        `,
        {
          replacements: {
            id: postId,
            content: content || null,
            imageUrl: imageUrl || null,
            videoUrl: videoUrl || null,
            authorId: user.id,
            originalPostId: originalPostId || null,
          },
          type: QueryTypes.INSERT,
        }
      );
      const [author] = await sequelize.query(
        `
        SELECT * FROM "userprofiles" WHERE "userId" = :userId
        `,
        { replacements: { userId: user.id }, type: QueryTypes.SELECT }
      );
      return {
        ...post,
        author,
        likes: [],
        comments: [],
        likeCount: 0,
        originalPost: post.originalPostId
          ? (
              await sequelize.query(
                `
                SELECT p.*, up.user_fname, up.user_lname, up.user_avatar
                FROM "posts" p
                JOIN "userprofiles" up ON p."authorId" = up."userId"
                WHERE p.id = :id
                `,
                { replacements: { id: post.originalPostId }, type: QueryTypes.SELECT }
              )
            )[0]
            : null,
      };
    },
    likePost: async (_, { postId }, { user, roleId }) => {
      if (!user || !roleId) throw new Error('Unauthorized');
      await sequelize.query(
        `
        INSERT INTO "Likes" ("userId", "postId", "createdAt")
        VALUES (:userId, :postId, NOW())
        ON CONFLICT DO NOTHING
        `,
        { replacements: { userId: user.id, postId }, type: QueryTypes.INSERT }
      );
      const [post] = await sequelize.query(
        `
        SELECT p.*, up.user_fname, up.user_lname, up.user_avatar
        FROM "posts" p
        JOIN "userprofiles" up ON p."authorId" = up."userId"
        WHERE p.id = :id
        `,
        { replacements: { id: postId }, type: QueryTypes.SELECT }
      );
      if (!post) throw new Error('Post not found');
      return {
        ...post,
        author: {
          userId: post.authorId,
          user_fname: post.user_fname,
          user_lname: post.user_lname,
          user_avatar: post.user_avatar,
        },
        likes: await sequelize.query(
          `
          SELECT up.* FROM "userprofiles" up
          JOIN "Likes" l ON up."userId" = l."userId"
          WHERE l."postId" = :postId
          `,
          { replacements: { postId }, type: QueryTypes.SELECT }
        ),
        comments: await Comment.findAll({
          where: { postId },
          include: [UserProfile],
        }),
        likeCount: (
          await sequelize.query(
            `SELECT COUNT(*) as count FROM "Likes" WHERE "postId" = :postId`,
            { replacements: { postId }, type: QueryTypes.SELECT }
          )
        )[0].count,
        originalPost: post.originalPostId
          ? (
              await sequelize.query(
                `
                SELECT p.*, up.user_fname, up.user_lname, up.user_avatar
                FROM "posts" p
                JOIN "userprofiles" up ON p."authorId" = up."userId"
                WHERE p.id = :id
                `,
                { replacements: { id: post.originalPostId }, type: QueryTypes.SELECT }
              )
            )[0]
            : null,
      };
    },
    unlikePost: async (_, { postId }, { user, roleId }) => {
      if (!user || !roleId) throw new Error('Unauthorized');
      await sequelize.query(
        `
        DELETE FROM "Likes"
        WHERE "userId" = :userId AND "postId" = :postId
        `,
        { replacements: { userId: user.id, postId }, type: QueryTypes.DELETE }
      );
      const [post] = await sequelize.query(
        `
        SELECT p.*, up.user_fname, up.user_lname, up.user_avatar
        FROM "posts" p
        JOIN "userprofiles" up ON p."authorId" = up."userId"
        WHERE p.id = :id
        `,
        { replacements: { id: postId }, type: QueryTypes.SELECT }
      );
      if (!post) throw new Error('Post not found');
      return {
        ...post,
        author: {
          userId: post.authorId,
          user_fname: post.user_fname,
          user_lname: post.user_lname,
          user_avatar: post.user_avatar,
        },
        likes: await sequelize.query(
          `
          SELECT up.* FROM "userprofiles" up
          JOIN "Likes" l ON up."userId" = l."userId"
          WHERE l."postId" = :postId
          `,
          { replacements: { postId }, type: QueryTypes.SELECT }
        ),
        comments: await Comment.findAll({
          where: { postId },
          include: [UserProfile],
        }),
        likeCount: (
          await sequelize.query(
            `SELECT COUNT(*) as count FROM "Likes" WHERE "postId" = :postId`,
            { replacements: { postId }, type: QueryTypes.SELECT }
          )
        )[0].count,
        originalPost: post.originalPostId
          ? (
              await sequelize.query(
                `
                SELECT p.*, up.user_fname, up.user_lname, up.user_avatar
                FROM "posts" p
                JOIN "userprofiles" up ON p."authorId" = up."userId"
                WHERE p.id = :id
                `,
                { replacements: { id: post.originalPostId }, type: QueryTypes.SELECT }
              )
            )[0]
            : null,
      };
    },
    createComment: async (_, { postId, content }, { user, roleId }) => {
      if (!user || !roleId) throw new Error('Unauthorized');
      const commentId = uuidv4();
      const [comment] = await sequelize.query(
        `
        INSERT INTO "Comments" ("id", "content", "authorId", "postId", "createdAt")
        VALUES (:id, :content, :authorId, :postId, NOW())
        RETURNING *
        `,
        {
          replacements: { id: commentId, content, authorId: user.id, postId },
          type: QueryTypes.INSERT,
        }
      );
      const [author] = await sequelize.query(
        `
        SELECT * FROM "userprofiles" WHERE "userId" = :userId
        `,
        { replacements: { userId: user.id }, type: QueryTypes.SELECT }
      );
      return {
        ...comment,
        author,
        post: { id: postId },
      };
    },
  },
};

export default socialResolvers;