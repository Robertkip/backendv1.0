import { GraphQLUpload } from 'graphql-upload';
import fs, {createWriteStream} from 'fs';
import { finished } from 'stream/promises';

import UserProfile from '../models/userProfileModel.js';

const resolvers = {
  Upload: GraphQLUpload,

  Query: {
    async userProfile(_, { id }) {
      const profile = await UserProfile.findOne({ where: { userId: id } });

      if (!profile) {
        throw new Error('UserProfile not found');
      }

      return profile;
    },
    async paginatedUserProfiles(_, { page = 1, pageSize = 30 }) {
      const offset = (page - 1) * pageSize;
      const { rows, count } = await UserProfile.findAndCountAll({
        limit: pageSize,
        offset: offset,
        order: [['createdAt', 'DESC']], 
      });

      return {
        data: rows,
        total: count,
        page,
        pageSize
      };
    },

  },
  

  Mutation: {
    uploadProfileImage: async (_, { file, userId }) => {
      const { createReadStream, filename, mimetype } = await file;
      const stream = createReadStream();
  
      const filePath = `Images/${Date.now()}-${filename}`;
      const writeStream = createWriteStream(filePath);
  
      await new Promise((resolve, reject) =>
        stream.pipe(writeStream).on("finish", resolve).on("error", reject)
      );
  
      const imageUrl = `https://api.waridi.co/${filePath}`;
  
      // 🔥 Update user profile avatar
      const profile = await UserProfile.findOne({ where: { userId } });
      if (!profile) {
        throw new Error('User profile not found');
      }
  
      await profile.update({ user_avatar: imageUrl });
  
      return imageUrl;
    },
    

    async updateUserProfile(_, { id, input }) {
      const profile = await UserProfile.findOne({ where: { userId: id } });

      if (!profile) {
        throw new Error('UserProfile not found');
      }

      await profile.update(input);

      return profile;
    },
  },
};

export default resolvers;
