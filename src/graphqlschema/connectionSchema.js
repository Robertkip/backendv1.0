import { gql } from 'apollo-server-express';

const connectionTypeDefs = gql `

type Connection {
  id: ID!
  userId: Int!
  connectionId: Int!
  status: String!
  createdAt: String
  updatedAt: String
}


type Mutation {
    sendConnectionRequest(userId: Int!, connectionId: Int!): Connection
    acceptConnectionRequest(requestId: ID!): Connection
  }
  
  type Query {
    pendingConnectionRequests(userId: Int!): [Connection]
    acceptedConnections(userId: Int!): [Connection]
  }
`;

export default connectionTypeDefs;
