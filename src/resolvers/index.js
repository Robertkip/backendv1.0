import { mergeResolvers } from "@graphql-tools/merge";
import connectionResolvers from "./connectionResolvers.js";
import userResolvers from "./resolvers.js";

const resolvers = mergeResolvers([connectionResolvers, userResolvers]);

export default resolvers;
