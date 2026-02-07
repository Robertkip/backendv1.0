import { sequelize } from '../config/connectDb.js';
import User from './authModel.js';
import UserProfile from './userProfileModel.js';
import Post from './postModel.js';
import Comment from './commentModel.js';
import Like from './likeModel.js';
import Agent from './agentModel.js';
import Apartment from './apartmentModel.js';

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

User.hasOne(Agent, { foreignKey: 'userId' });
Agent.belongsTo(User, { foreignKey: 'userId' });

Agent.hasMany(Apartment, { foreignKey: 'agentId', as: 'apartments' });
Apartment.belongsTo(Agent, { foreignKey: 'agentId' });

export { sequelize, User, UserProfile, Post, Comment, Like, Agent, Apartment };
