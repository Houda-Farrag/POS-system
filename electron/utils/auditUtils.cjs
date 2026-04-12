// Audit logging utilities for tracking user actions
const auditUtils = {
  // Log a user action to database
  logAction(db, userId, action, tableName, recordId, oldValue = null, newValue = null) {
    try {
      const stmt = db.prepare(`
        INSERT INTO audit_logs (user_id, action, table_name, record_id, old_value, new_value)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      stmt.run(userId, action, tableName, recordId, 
        oldValue ? JSON.stringify(oldValue) : null, 
        newValue ? JSON.stringify(newValue) : null
      );
    } catch (error) {
      console.error('Audit log error:', error);
    }
  },

  // Get audit logs with optional filtering
  getAuditLogs(db, filters = {}) {
    let query = `
      SELECT 
        al.id, al.user_id, al.action, al.table_name, al.record_id,
        al.old_value, al.new_value, al.timestamp, u.username, u.display_name
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.userId) {
      query += ' AND al.user_id = ?';
      params.push(filters.userId);
    }
    if (filters.tableName) {
      query += ' AND al.table_name = ?';
      params.push(filters.tableName);
    }
    if (filters.action) {
      query += ' AND al.action = ?';
      params.push(filters.action);
    }
    if (filters.fromDate) {
      query += ' AND al.timestamp >= ?';
      params.push(filters.fromDate);
    }
    if (filters.toDate) {
      query += ' AND al.timestamp <= ?';
      params.push(filters.toDate);
    }

    query += ' ORDER BY al.timestamp DESC LIMIT 1000';

    try {
      const stmt = db.prepare(query);
      return params.length > 0 ? stmt.all(...params) : stmt.all();
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      return [];
    }
  },

  // Clear audit logs older than specified days
  clearOldLogs(db, daysOld = 90) {
    try {
      const stmt = db.prepare(`
        DELETE FROM audit_logs 
        WHERE timestamp < datetime('now', '-' || ? || ' days')
      `);
      const result = stmt.run(daysOld);
      return { deleted: result.changes };
    } catch (error) {
      console.error('Error clearing old logs:', error);
      return { deleted: 0, error };
    }
  }
};

module.exports = { auditUtils };
