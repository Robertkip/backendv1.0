import { sequelize } from '../config/connectDb.js';
import User from './authModel.js';
import UserProfile from './userProfileModel.js';
import Post from './postModel.js';
import Comment from './commentModel.js';
import Like from './likeModel.js';
import Apartment from './apartmentModel.js';
import AgentProfile from './agentProfileModel.js';
import AgentDocuments from './agentDocumentsModel.js';
import AgentComment from './agentCommentModel.js';
import AgentLocation from './agentLocationModel.js';
import AgentNotification from './agentNotificationModel.js';
import ApartmentComment from './apartmentCommentModel.js';
import ApartmentPaymentPlan from './apartmentPaymentPlanModel.js';
// Define associations
User.hasOne(UserProfile, { foreignKey: 'userId' });
UserProfile.belongsTo(User, { foreignKey: 'userId' });

UserProfile.hasMany(Post, { foreignKey: 'authorId' });
Post.belongsTo(UserProfile, { foreignKey: 'authorId' });

Post.hasMany(Comment, { foreignKey: 'postId' });
Comment.belongsTo(Post, { foreignKey: 'postId' });
Comment.belongsTo(UserProfile, { foreignKey: 'authorId' });

Post.belongsTo(Post, { as: 'originalPost', foreignKey: 'originalPostId' });

UserProfile.belongsToMany(Post, { through: Like, foreignKey: 'userId' });
Post.belongsToMany(UserProfile, { through: Like, foreignKey: 'postId' });

User.hasOne(AgentProfile, { foreignKey: 'userId' });
AgentProfile.belongsTo(User, { foreignKey: 'userId' });

AgentProfile.hasMany(Apartment, { foreignKey: 'agentId', as: 'apartments' });
Apartment.belongsTo(AgentProfile, { foreignKey: 'agentId' });

export { sequelize, User, UserProfile, Post, Comment, Like, AgentProfile, Apartment, AgentProfile, AgentDocuments, AgentComment, AgentLocation, AgentNotification, ApartmentComment, ApartmentPaymentPlan };
