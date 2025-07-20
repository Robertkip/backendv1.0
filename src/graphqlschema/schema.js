import { gql } from 'apollo-server-express';

const typeDefs = gql`
  type UserProfile {
    id: Int!
    user_fname: String
    user_lname: String
    user_location: String
    user_phonenumber: Int
    followers: [Int]
    following: [Int]
    user_avatar: String
    type: String
  }

  input UpdateUserProfileInput {
    user_fname: String
    user_lname: String
    user_location: String
    user_phonenumber: Int
    followers: [Int]
    following: [Int]
    user_avatar: String
    type: String
  }

  type Mutation {
    updateUserProfile(id: Int!, input: UpdateUserProfileInput!): UserProfile
  }

  type Query {
    userProfile(id: Int!): UserProfile
  }
`;

export default typeDefs;
