'use strict';

// The code relies on these role ids (signup, ownership checks, AdminRole).
const ROLES = ['USER', 'AGENT', 'LANDLORD', 'SALES', 'ADMIN', 'SUPERADMIN'];

module.exports = {
  async up(queryInterface) {
    const existing = await queryInterface.sequelize.query('SELECT id, "roleName" FROM roles', {
      type: queryInterface.sequelize.QueryTypes.SELECT,
    });
    const now = new Date();
    const missing = ROLES.map((roleName, i) => ({ id: i + 1, roleName, active: true, createdAt: now, updatedAt: now }))
      .filter((role) => !existing.some((row) => row.id === role.id || row.roleName === role.roleName));
    if (missing.length > 0) {
      await queryInterface.bulkInsert('roles', missing);
    }
    // Rows inserted with explicit ids (here, or by hand as the old README
    // said) do not advance the id sequence; move it past them.
    await queryInterface.sequelize.query(`SELECT setval(pg_get_serial_sequence('roles', 'id'), (SELECT MAX(id) FROM roles))`);
  },

  async down() {
    // Users reference these roles; leave them in place.
  },
};
