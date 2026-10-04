'use strict';

// Creates every table the models describe that does not exist yet. Existing
// tables are left as they are; later migrations change them explicitly.
// Before migrations were committed the server did the same at startup with
// sequelize.sync(), so on an existing database this only adds missing tables.
const path = require('path');
const { pathToFileURL } = require('url');

// Loading the app's routers and GraphQL resolvers registers exactly the
// models the app uses, in an order that respects their imports.
const APP_MODULES = ['src/routers/index.js', 'src/resolvers/index.js'];

module.exports = {
  async up() {
    const { sequelize } = await import(pathToFileURL(path.join(__dirname, '../src/config/connectDb.js')).href);
    for (const file of APP_MODULES) {
      await import(pathToFileURL(path.join(__dirname, '..', file)).href);
    }
    await sequelize.sync();
  },

  async down() {
    throw new Error('The baseline migration cannot be undone; drop the database instead.');
  },
};
