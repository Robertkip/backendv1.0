'use strict';

// Brings databases created before migrations were committed up to the
// current models. Every step checks the current state first, so it is safe
// on a fresh database (where the baseline already created the new shape).

// Columns the models gained after their tables were first created.
const NEW_COLUMNS = [
  // Ownership checks on properties use the user who listed them.
  ['properties', 'agent_id', (Sequelize) => ({ type: Sequelize.INTEGER, allowNull: true })],
  // PUT /cart/:id changes a cart item's quantity.
  ['cartitems', 'quantity', (Sequelize) => ({ type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 })],
];

// Comment authors are stored as users.id, but the foreign keys pointed at
// userprofiles.id.
const COMMENT_TABLES = ['apartment_comments', 'agent_comments'];

const userIdForeignKeys = (queryInterface, table) =>
  queryInterface.sequelize.query(
    `SELECT c.conname AS name, t.relname AS target
     FROM pg_constraint c
     JOIN pg_class s ON s.oid = c.conrelid
     JOIN pg_class t ON t.oid = c.confrelid
     JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY (c.conkey)
     WHERE c.contype = 'f' AND s.relname = :table AND a.attname = 'user_id'`,
    { replacements: { table }, type: queryInterface.sequelize.QueryTypes.SELECT }
  );

const tableExists = async (queryInterface, table) =>
  (await queryInterface.showAllTables()).includes(table);

module.exports = {
  async up(queryInterface, Sequelize) {
    for (const [table, column, definition] of NEW_COLUMNS) {
      if (!(await tableExists(queryInterface, table))) continue;
      const columns = await queryInterface.describeTable(table);
      if (!columns[column]) {
        await queryInterface.addColumn(table, column, definition(Sequelize));
      }
    }

    for (const table of COMMENT_TABLES) {
      if (!(await tableExists(queryInterface, table))) continue;
      const keys = await userIdForeignKeys(queryInterface, table);
      if (keys.some((key) => key.target === 'users')) continue;
      for (const key of keys) {
        await queryInterface.sequelize.query(`ALTER TABLE "${table}" DROP CONSTRAINT "${key.name}"`);
      }
      // NOT VALID: enforce the key for new rows without failing on old rows
      // whose user no longer exists.
      await queryInterface.sequelize.query(
        `ALTER TABLE "${table}" ADD CONSTRAINT "${table}_user_id_fkey"
         FOREIGN KEY (user_id) REFERENCES users (id) ON UPDATE CASCADE NOT VALID`
      );
    }
  },

  async down(queryInterface) {
    for (const table of COMMENT_TABLES) {
      if (!(await tableExists(queryInterface, table))) continue;
      await queryInterface.sequelize.query(`ALTER TABLE "${table}" DROP CONSTRAINT IF EXISTS "${table}_user_id_fkey"`);
      await queryInterface.sequelize.query(
        `ALTER TABLE "${table}" ADD CONSTRAINT "${table}_user_id_fkey"
         FOREIGN KEY (user_id) REFERENCES userprofiles (id) ON UPDATE CASCADE NOT VALID`
      );
    }
    if (await tableExists(queryInterface, 'cartitems')) {
      await queryInterface.removeColumn('cartitems', 'quantity');
    }
    // properties.agent_id stays: dropping it would lose who owns each property.
  },
};
