// Validation utility functions

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone) => {
  // Vietnamese phone number format: 10 digits, may start with 0 or +84
  const phoneRegex = /^(\+84|0)[0-9]{9,10}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const validatePassword = (password) => {
  // At least 6 characters
  return password && password.length >= 6;
};

export const validatePasswordStrength = (password) => {
  if (!password) return { valid: false, message: 'Password is required' };
  if (password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters' };
  }
  if (password.length < 8) {
    return { valid: false, message: 'Password should be at least 8 characters for better security' };
  }
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar) {
    return { valid: true, message: 'Strong password' };
  }
  if (hasUpperCase && hasLowerCase && hasNumber) {
    return { valid: true, message: 'Good password' };
  }
  return { valid: true, message: 'Weak password - consider adding uppercase, numbers, or special characters' };
};

export const validateRequired = (value) => {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
};

export const validateMinLength = (value, minLength) => {
  if (!value) return false;
  return value.toString().length >= minLength;
};

export const validateMaxLength = (value, maxLength) => {
  if (!value) return true;
  return value.toString().length <= maxLength;
};

export const validateNumber = (value, min = null, max = null) => {
  const num = parseFloat(value);
  if (isNaN(num)) return false;
  if (min !== null && num < min) return false;
  if (max !== null && num > max) return false;
  return true;
};

export const validateDate = (date, minDate = null, maxDate = null) => {
  if (!date) return false;
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return false;
  if (minDate) {
    const min = new Date(minDate);
    if (dateObj < min) return false;
  }
  if (maxDate) {
    const max = new Date(maxDate);
    if (dateObj > max) return false;
  }
  return true;
};

export const validateDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return false;
  const start = new Date(startDate);
  const end = new Date(endDate);
  return end > start;
};

export const validateFile = (file, options = {}) => {
  if (!file) return { valid: true }; // Optional file

  const { maxSize = 5 * 1024 * 1024, allowedTypes = [] } = options; // 5MB default

  if (maxSize && file.size > maxSize) {
    return {
      valid: false,
      message: `File size must be less than ${(maxSize / 1024 / 1024).toFixed(1)}MB`,
    };
  }

  if (allowedTypes.length > 0) {
    const fileType = file.type || file.name.split('.').pop().toLowerCase();
    const isValidType = allowedTypes.some((type) => {
      if (type.startsWith('.')) {
        return file.name.toLowerCase().endsWith(type.toLowerCase());
      }
      return fileType.includes(type);
    });

    if (!isValidType) {
      return {
        valid: false,
        message: `File type must be one of: ${allowedTypes.join(', ')}`,
      };
    }
  }

  return { valid: true };
};

export const validateLatitude = (lat) => {
  const num = parseFloat(lat);
  return !isNaN(num) && num >= -90 && num <= 90;
};

export const validateLongitude = (lng) => {
  const num = parseFloat(lng);
  return !isNaN(num) && num >= -180 && num <= 180;
};

export const getValidationError = (field, value, rules) => {
  if (!rules) return null;

  // Required validation
  if (rules.required && !validateRequired(value)) {
    return rules.requiredMessage || `${field} is required`;
  }

  // Skip other validations if field is empty and not required
  if (!value && !rules.required) {
    return null;
  }

  // Email validation
  if (rules.email && !validateEmail(value)) {
    return rules.emailMessage || 'Invalid email format';
  }

  // Phone validation
  if (rules.phone && !validatePhone(value)) {
    return rules.phoneMessage || 'Invalid phone number format';
  }

  // Password validation
  if (rules.password && !validatePassword(value)) {
    return rules.passwordMessage || 'Password must be at least 6 characters';
  }

  // Min length validation
  if (rules.minLength && !validateMinLength(value, rules.minLength)) {
    return rules.minLengthMessage || `${field} must be at least ${rules.minLength} characters`;
  }

  // Max length validation
  if (rules.maxLength && !validateMaxLength(value, rules.maxLength)) {
    return rules.maxLengthMessage || `${field} must not exceed ${rules.maxLength} characters`;
  }

  // Number validation
  if (rules.number) {
    const numOptions = rules.number;
    if (!validateNumber(value, numOptions.min, numOptions.max)) {
      if (numOptions.min !== null && numOptions.max !== null) {
        return numOptions.message || `${field} must be between ${numOptions.min} and ${numOptions.max}`;
      }
      if (numOptions.min !== null) {
        return numOptions.message || `${field} must be at least ${numOptions.min}`;
      }
      if (numOptions.max !== null) {
        return numOptions.message || `${field} must be at most ${numOptions.max}`;
      }
      return numOptions.message || `${field} must be a valid number`;
    }
  }

  // Date validation
  if (rules.date) {
    const dateOptions = rules.date;
    if (!validateDate(value, dateOptions.min, dateOptions.max)) {
      return dateOptions.message || 'Invalid date';
    }
  }

  // Custom validation
  if (rules.custom && typeof rules.custom === 'function') {
    const customResult = rules.custom(value);
    if (customResult !== true) {
      return customResult || `${field} is invalid`;
    }
  }

  return null;
};

