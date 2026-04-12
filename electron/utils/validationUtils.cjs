// Data validation utilities
const validationUtils = {
  // Validate email format
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validate username
  isValidUsername(username) {
    if (!username || username.length < 3 || username.length > 20) {
      return { valid: false, error: 'Username must be 3-20 characters' };
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return { valid: false, error: 'Username can only contain letters, numbers, and underscores' };
    }
    return { valid: true };
  },

  // Validate product name
  isValidProductName(name) {
    if (!name || name.trim().length === 0) {
      return { valid: false, error: 'Product name is required' };
    }
    if (name.length > 100) {
      return { valid: false, error: 'Product name must be less than 100 characters' };
    }
    return { valid: true };
  },

  // Validate price
  isValidPrice(price) {
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice < 0) {
      return { valid: false, error: 'Price must be a positive number' };
    }
    if (numPrice > 999999) {
      return { valid: false, error: 'Price exceeds maximum allowed' };
    }
    return { valid: true };
  },

  // Validate stock quantity
  isValidStock(stock) {
    const numStock = parseInt(stock);
    if (isNaN(numStock) || numStock < 0) {
      return { valid: false, error: 'Stock must be a non-negative number' };
    }
    if (numStock > 999999) {
      return { valid: false, error: 'Stock quantity exceeds maximum allowed' };
    }
    return { valid: true };
  },

  // Validate customer name
  isValidCustomerName(name) {
    if (!name || name.trim().length === 0) {
      return { valid: false, error: 'Customer name is required' };
    }
    if (name.length > 100) {
      return { valid: false, error: 'Customer name must be less than 100 characters' };
    }
    return { valid: true };
  },

  // Validate invoice items
  validateInvoiceItems(items) {
    if (!items || !Array.isArray(items) || items.length === 0) {
      return { valid: false, error: 'Invoice must contain at least one item' };
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.productId || !item.quantity) {
        return { valid: false, error: `Item ${i + 1}: Missing product ID or quantity` };
      }
      const qtyValidation = this.isValidStock(item.quantity);
      if (!qtyValidation.valid) {
        return { valid: false, error: `Item ${i + 1}: ${qtyValidation.error}` };
      }
    }

    return { valid: true };
  },

  // Validate tax rate
  isValidTaxRate(taxRate) {
    const numRate = parseFloat(taxRate);
    if (isNaN(numRate) || numRate < 0 || numRate > 100) {
      return { valid: false, error: 'Tax rate must be between 0 and 100' };
    }
    return { valid: true };
  },

  // Log validation error
  logValidationError(db, tableName, recordId, fieldName, errorMessage) {
    try {
      const stmt = db.prepare(`
        INSERT INTO data_validation_logs (table_name, record_id, field_name, error_message)
        VALUES (?, ?, ?, ?)
      `);
      stmt.run(tableName, recordId, fieldName, errorMessage);
    } catch (error) {
      console.error('Error logging validation error:', error);
    }
  },

  // Sanitize input string
  sanitizeString(input) {
    if (typeof input !== 'string') return '';
    return input.trim().replace(/[<>]/g, '').substring(0, 500);
  },

  // Validate phone number (basic)
  isValidPhone(phone) {
    const phoneRegex = /^[\d\s\-+()]+$/;
    return phone && phoneRegex.test(phone) && phone.length >= 7;
  },

  // Validate Arabic/English text
  isValidDisplayText(text) {
    if (!text || text.trim().length === 0) {
      return { valid: false, error: 'Text is required' };
    }
    if (text.length > 255) {
      return { valid: false, error: 'Text is too long (max 255 characters)' };
    }
    return { valid: true };
  }
};

module.exports = { validationUtils };
