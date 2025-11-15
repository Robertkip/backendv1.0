import { gql } from 'apollo-server-express';

const socialTypeDefs = gql`

  # --- USER PROFILE TYPE (IMPORTANT!) ---
  type UserProfile {
    userId: ID!
    user_fname: String
    user_lname: String
    user_avatar: String
  }

  # --- POST TYPE ---
  type Post {
    id: ID!
    content: String
    imageUrl: String
    videoUrl: String
    author: UserProfile!
    likes: [UserProfile!]!
    likeCount: Int!
    originalPost: Post
    comments: [Comment!]!
    createdAt: String!
  }

  # --- COMMENT TYPE ---
  type Comment {
    id: ID!
    content: String!
    author: UserProfile!
    post: Post!
    createdAt: String!
  }

  # --- QUERIES ---
  type Query {
    getPosts: [Post!]!
    getPost(id: ID!): Post
    getComments(postId: ID!): [Comment!]!
    getUserProfile(userId: ID!): UserProfile
  }

  # --- MUTATIONS ---
  type Mutation {
    createPost(content: String, imageUrl: String, videoUrl: String, originalPostId: ID): Post!
    likePost(postId: ID!): Post!
    unlikePost(postId: ID!): Post!
    createComment(postId: ID!, content: String!): Comment!
  }
`;

export default socialTypeDefs;
