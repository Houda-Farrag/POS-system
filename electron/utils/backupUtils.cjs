const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

// Backup and restore utilities
const backupUtils = {
  // Create a backup of the database
  createBackup(dbPath, backupDir, db, userId) {
    try {
      // Ensure backup directory exists
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }

      // Create timestamped backup filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFilename = `backup-${timestamp}.db`;
      const backupPath = path.join(backupDir, backupFilename);

      // Use SQLite backup API for consistent backup
      const backupDb = new Database(backupPath);
      db.backup(backupDb);
      backupDb.close();

      // Get file size
      const stats = fs.statSync(backupPath);
      const backupSize = stats.size;

      // Log backup in database
      try {
        const stmt = db.prepare(`
          INSERT INTO backups (backup_path, backup_size, created_by, description)
          VALUES (?, ?, ?, ?)
        `);
        stmt.run(backupPath, backupSize, userId, `Automatic backup created at ${new Date().toISOString()}`);
      } catch (err) {
        console.warn('Could not log backup to database:', err);
      }

      return {
        ok: true,
        backup_path: backupPath,
        backup_size: backupSize,
        message: `Backup created successfully at ${backupPath}`
      };
    } catch (error) {
      console.error('Backup creation error:', error);
      return {
        ok: false,
        error: error.message
      };
    }
  },

  // Restore from a backup
  restoreBackup(backupPath, targetDbPath, db, userId) {
    try {
      // Check if backup exists
      if (!fs.existsSync(backupPath)) {
        return { ok: false, error: 'Backup file not found' };
      }

      // Close current database connection
      db.close();

      // Backup current database before restoring
      const currentBackup = path.join(
        path.dirname(targetDbPath),
        'backups',
        `pre-restore-${Date.now()}.db`
      );
      if (!fs.existsSync(path.dirname(currentBackup))) {
        fs.mkdirSync(path.dirname(currentBackup), { recursive: true });
      }
      fs.copyFileSync(targetDbPath, currentBackup);

      // Restore backup
      fs.copyFileSync(backupPath, targetDbPath);

      // Reopen database
      const newDb = new Database(targetDbPath);
      newDb.pragma('foreign_keys = ON');

      // Log restore action
      try {
        const stmt = newDb.prepare(`
          INSERT INTO backups (backup_path, restored_at, created_by)
          VALUES (?, CURRENT_TIMESTAMP, ?)
        `);
        stmt.run(backupPath, userId);
      } catch (err) {
        console.warn('Could not log restore to database:', err);
      }

      return {
        ok: true,
        message: `Database restored from ${backupPath}`,
        previous_db_backup: currentBackup
      };
    } catch (error) {
      console.error('Restore error:', error);
      return {
        ok: false,
        error: error.message
      };
    }
  },

  // List available backups
  listBackups(backupDir) {
    try {
      if (!fs.existsSync(backupDir)) {
        return [];
      }

      const files = fs.readdirSync(backupDir);
      const backups = files
        .filter(f => f.startsWith('backup-') && f.endsWith('.db'))
        .map(f => {
          const fullPath = path.join(backupDir, f);
          const stats = fs.statSync(fullPath);
          return {
            filename: f,
            path: fullPath,
            size: stats.size,
            created: stats.mtime.toISOString()
          };
        })
        .sort((a, b) => new Date(b.created) - new Date(a.created));

      return backups;
    } catch (error) {
      console.error('Error listing backups:', error);
      return [];
    }
  },

  // Delete old backups (keep last N backups)
  cleanupOldBackups(backupDir, keepCount = 10) {
    try {
      const backups = this.listBackups(backupDir);
      if (backups.length <= keepCount) {
        return { deleted: 0 };
      }

      const toDelete = backups.slice(keepCount);
      let deletedCount = 0;

      for (const backup of toDelete) {
        try {
          fs.unlinkSync(backup.path);
          deletedCount++;
        } catch (err) {
          console.warn(`Failed to delete backup ${backup.path}:`, err);
        }
      }

      return { deleted: deletedCount };
    } catch (error) {
      console.error('Cleanup error:', error);
      return { deleted: 0, error };
    }
  },

  // Export data as JSON
  exportData(db, format = 'json') {
    try {
      const tables = [
        'users', 'products', 'invoices', 'invoice_items', 
        'payments', 'reservations', 'audit_logs'
      ];
      
      const data = {};
      for (const table of tables) {
        try {
          const stmt = db.prepare(`SELECT * FROM ${table}`);
          data[table] = stmt.all();
        } catch (err) {
          console.warn(`Could not export table ${table}:`, err);
          data[table] = [];
        }
      }

      const timestamp = new Date().toISOString();
      const metadata = {
        exported_at: timestamp,
        format: 'pos-system-export',
        version: '1.0'
      };

      return {
        ok: true,
        metadata,
        data
      };
    } catch (error) {
      console.error('Export error:', error);
      return { ok: false, error: error.message };
    }
  }
};

module.exports = { backupUtils };
