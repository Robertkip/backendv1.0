import { mergeTypeDefs } from '@graphql-tools/merge';
import connectionTypeDefs from './connectionSchema.js';
import userProfileTypeDefs from './schema.js'

const typeDefs = mergeTypeDefs([connectionTypeDefs, userProfileTypeDefs]);

export default typeDefs;
