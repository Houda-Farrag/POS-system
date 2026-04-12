const bcrypt = require('bcryptjs');

const passwordUtils = {
  // Hash a password with bcrypt
  hashPassword(password) {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
  },

  // Verify a password against a hash
  verifyPassword(password, hash) {
    try {
      return bcrypt.compareSync(password, hash);
    } catch (error) {
      console.error('Password verification error:', error);
      return false;
    }
  },

  // Generate a temporary password
  generateTempPassword() {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  },

  // Check password strength
  validatePasswordStrength(password) {
    const errors = [];
    if (password.length < 8) errors.push('Password must be at least 8 characters');
    if (!/[A-Z]/.test(password)) errors.push('Password must contain uppercase letters');
    if (!/[a-z]/.test(password)) errors.push('Password must contain lowercase letters');
    if (!/[0-9]/.test(password)) errors.push('Password must contain numbers');
    return {
      isStrong: errors.length === 0,
      errors
    };
  }
};

module.exports = { passwordUtils };
