import { mergeResolvers } from "@graphql-tools/merge";
import connectionResolvers from "./connectionResolvers.js";
import socialResolvers from "./socialResolvers.js";
import userResolvers from "./resolvers.js";

const resolvers = mergeResolvers([connectionResolvers, userResolvers, socialResolvers]);

export default resolvers;
