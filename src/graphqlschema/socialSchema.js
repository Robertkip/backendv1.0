import { gql } from 'apollo-server-express';

const socialTypeDefs = gql`

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

  type Comment {
    id: ID!
    content: String!
    author: UserProfile!
    post: Post!
    createdAt: String!
  }

  type Query {
    getPosts: [Post!]!
    getPost(id: ID!): Post
    getComments(postId: ID!): [Comment!]!
    getUserProfile(userId: ID!): UserProfile
  }

  type Mutation {
    createPost(content: String, imageUrl: String, videoUrl: String, originalPostId: ID): Post!
    likePost(postId: ID!): Post!
    unlikePost(postId: ID!): Post!
    createComment(postId: ID!, content: String!): Comment!
  }
`;

export default socialTypeDefs;
