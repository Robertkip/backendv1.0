import Connection from '../models/connectionsModel.js';
import UserProfile from '../models/userProfileModel.js';

const connectionResolvers = {
  Query: {
    async pendingConnectionRequests(_, { userId }) {
      return await Connection.findAll({
        where: {
          connectionId: userId,
          status: 'pending',
        },
      });
    },

    async acceptedConnections(_, { userId }) {
      return await Connection.findAll({
        where: {
          [sequelize.Op.or]: [
            { userId, status: 'accepted' },
            { connectionId: userId, status: 'accepted' },
          ],
        },
      });
    },
  },

  Mutation: {
    async sendConnectionRequest(_, { userId, connectionId }) {
      // prevent duplicate
      const existing = await Connection.findOne({
        where: {
          userId,
          connectionId,
          status: 'pending',
        },
      });

      if (existing) {
        throw new Error('Connection request already sent');
      }

      return await Connection.create({
        userId,
        connectionId,
        status: 'pending',
      });
    },

    async acceptConnectionRequest(_, { requestId }) {
      const request = await Connection.findByPk(requestId);
      if (!request || request.status !== 'pending') {
        throw new Error('Invalid or already handled request');
      }

      request.status = 'accepted';

const senderProfile = await UserProfile.findOne({ where: { userId: request.userId } });
const recipientProfile = await UserProfile.findOne({ where: { userId: request.connectionId } });

if (senderProfile && recipientProfile) {
  senderProfile.following = [...new Set([...senderProfile.following, request.connectionId])];
  recipientProfile.followers = [...new Set([...recipientProfile.followers, request.userId])];

  await senderProfile.save();
  await recipientProfile.save();
}

      await request.save();

      return request;
    },
  },
};


export default connectionResolvers;
