// Permission and role management utilities
const permissionUtils = {
  // Check if a user has permission to perform an action
  hasPermission(db, userRole, requiredPermission) {
    try {
      const result = db.prepare(`
        SELECT can_perform FROM permissions 
        WHERE role = ? AND permission = ?
      `).get(userRole, requiredPermission);

      return result && result.can_perform === 1;
    } catch (error) {
      console.error('Permission check error:', error);
      return false;
    }
  },

  // Get all permissions for a role
  getPermissionsForRole(db, role) {
    try {
      const permissions = db.prepare(`
        SELECT permission, can_perform FROM permissions 
        WHERE role = ? AND can_perform = 1
      `).all(role);
      return permissions.map(p => p.permission);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      return [];
    }
  },

  // Check if user can perform an action (requires user object)
  userCan(db, user, permission) {
    if (!user) return false;
    if (user.role === 'admin') return true; // Admin can do everything
    return this.hasPermission(db, user.role, permission);
  },

  // Permission check decorator for IPC handlers
  requirePermission(db, user, permission) {
    return this.userCan(db, user, permission);
  },

  // Get role display name
  getRoleDisplayName(role) {
    const roleNames = {
      'admin': 'Administrator',
      'manager': 'Manager',
      'accountant': 'Accountant',
      'cashier': 'Cashier',
      'warehouse': 'Warehouse Staff'
    };
    return roleNames[role] || role;
  },

  // Get all available roles
  getAllRoles() {
    return [
      { id: 'admin', label: 'Administrator', description: 'Full system access' },
      { id: 'manager', label: 'Manager', description: 'Manage products and invoices' },
      { id: 'accountant', label: 'Accountant', description: 'View invoices and audit logs' },
      { id: 'cashier', label: 'Cashier', description: 'Create sales and view products' },
      { id: 'warehouse', label: 'Warehouse Staff', description: 'Manage inventory and reservations' }
    ];
  },

  // Update permissions for a role
  updatePermissions(db, role, permissionsList) {
    try {
      // Remove old permissions
      db.prepare('DELETE FROM permissions WHERE role = ?').run(role);
      
      // Add new permissions
      const stmt = db.prepare(`
        INSERT INTO permissions (role, permission, can_perform)
        VALUES (?, ?, 1)
      `);

      for (const permission of permissionsList) {
        stmt.run(role, permission);
      }
      return { ok: true };
    } catch (error) {
      console.error('Error updating permissions:', error);
      return { ok: false, error };
    }
  }
};

module.exports = { permissionUtils };
