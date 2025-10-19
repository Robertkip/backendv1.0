import { mergeTypeDefs } from '@graphql-tools/merge';
import connectionTypeDefs from './connectionSchema.js';
import userProfileTypeDefs from './schema.js'
import socialTypeDefs from './socialSchema.js';

const typeDefs = mergeTypeDefs([connectionTypeDefs, userProfileTypeDefs, socialTypeDefs]);

export default typeDefs;
