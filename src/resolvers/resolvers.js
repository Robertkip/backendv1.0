import { GraphQLUpload } from 'graphql-upload';
import fs from 'fs';
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
  },

  Mutation: {
    async uploadProfileImage(_, { file }) {
      const { createReadStream, filename } = await file;

      const stream = createReadStream();
      const pathName = `./Images/${Date.now()}-${filename}`;
      const out = fs.createWriteStream(pathName);
      stream.pipe(out);
      await finished(out);

      // Example file URL:
      return `https://api.waridi.co/images/${pathName.replace('./Images/', '')}`;
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
