import { gql } from 'apollo-server-express';

const userProfileTypeDefs = gql`

  scalar Upload

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

  type PaginatedUserProfiles {
    data: [UserProfile]
    total: Int
    page: Int
    pageSize: Int
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
    uploadProfileImage(file: Upload!, userId: Int!): String
  }

  type Query {
    userProfile(id: Int!): UserProfile
    paginatedUserProfiles(page: Int, pageSize: Int): PaginatedUserProfiles
  }
`;

export default userProfileTypeDefs;
