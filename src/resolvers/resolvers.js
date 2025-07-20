import UserProfile from '../models/userProfileModel.js';

const resolvers = {
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
