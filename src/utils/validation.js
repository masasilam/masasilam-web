// ============================================
// src/utils/validation.js
// ============================================

/**
 * Validation rules and functions
 */

export const VALIDATION_RULES = {
  USERNAME: {
    minLength: 3,
    maxLength: 20,
    pattern: /^[a-zA-Z0-9_]+$/,
    message: 'Username harus 3-20 karakter dan hanya boleh huruf, angka, dan underscore'
  },
  PASSWORD: {
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    message: 'Password minimal 8 karakter dengan huruf besar, kecil, dan angka'
  },
  EMAIL: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Format email tidak valid'
  },
  PHONE: {
    pattern: /^(\+62|62|0)[0-9]{9,12}$/,
    message: 'Format nomor telepon tidak valid'
  }
}

/**
 * Validate username
 */
export const validateUsername = (username) => {
  const errors = []
  
  if (!username) {
    errors.push('Username wajib diisi')
    return errors
  }
  
  if (username.length < VALIDATION_RULES.USERNAME.minLength) {
    errors.push(`Username minimal ${VALIDATION_RULES.USERNAME.minLength} karakter`)
  }
  
  if (username.length > VALIDATION_RULES.USERNAME.maxLength) {
    errors.push(`Username maksimal ${VALIDATION_RULES.USERNAME.maxLength} karakter`)
  }
  
  if (!VALIDATION_RULES.USERNAME.pattern.test(username)) {
    errors.push(VALIDATION_RULES.USERNAME.message)
  }
  
  return errors
}

/**
 * Validate password
 */
export const validatePassword = (password) => {
  const errors = []
  
  if (!password) {
    errors.push('Password wajib diisi')
    return errors
  }
  
  if (password.length < VALIDATION_RULES.PASSWORD.minLength) {
    errors.push(`Password minimal ${VALIDATION_RULES.PASSWORD.minLength} karakter`)
  }
  
  if (!VALIDATION_RULES.PASSWORD.pattern.test(password)) {
    errors.push(VALIDATION_RULES.PASSWORD.message)
  }
  
  return errors
}

/**
 * Validate email
 */
export const validateEmail = (email) => {
  const errors = []
  
  if (!email) {
    errors.push('Email wajib diisi')
    return errors
  }
  
  if (!VALIDATION_RULES.EMAIL.pattern.test(email)) {
    errors.push(VALIDATION_RULES.EMAIL.message)
  }
  
  return errors
}

/**
 * Validate confirm password
 */
export const validateConfirmPassword = (password, confirmPassword) => {
  const errors = []
  
  if (!confirmPassword) {
    errors.push('Konfirmasi password wajib diisi')
    return errors
  }
  
  if (password !== confirmPassword) {
    errors.push('Password tidak cocok')
  }
  
  return errors
}

/**
 * Validate required field
 */
export const validateRequired = (value, fieldName = 'Field') => {
  if (!value || value.toString().trim() === '') {
    return [`${fieldName} wajib diisi`]
  }
  return []
}

/**
 * Validate min length
 */
export const validateMinLength = (value, minLength, fieldName = 'Field') => {
  if (value && value.length < minLength) {
    return [`${fieldName} minimal ${minLength} karakter`]
  }
  return []
}

/**
 * Validate max length
 */
export const validateMaxLength = (value, maxLength, fieldName = 'Field') => {
  if (value && value.length > maxLength) {
    return [`${fieldName} maksimal ${maxLength} karakter`]
  }
  return []
}

/**
 * Validate rating
 */
export const validateRating = (rating) => {
  const errors = []
  
  if (!rating) {
    errors.push('Rating wajib dipilih')
    return errors
  }
  
  const numRating = Number(rating)
  
  if (numRating < 0.5 || numRating > 5) {
    errors.push('Rating harus antara 0.5 sampai 5')
  }
  
  if (numRating % 0.5 !== 0) {
    errors.push('Rating harus kelipatan 0.5')
  }
  
  return errors
}

/**
 * Sanitize HTML to prevent XSS
 */
export const sanitizeHTML = (html) => {
  const div = document.createElement('div')
  div.textContent = html
  return div.innerHTML
}

/**
 * Validate form data
 */
export const validateForm = (data, rules) => {
  const errors = {}
  
  Object.keys(rules).forEach(field => {
    const fieldRules = rules[field]
    const value = data[field]
    let fieldErrors = []
    
    // Required validation
    if (fieldRules.required) {
      fieldErrors = [...fieldErrors, ...validateRequired(value, fieldRules.label || field)]
    }
    
    // Skip other validations if field is empty and not required
    if (!value && !fieldRules.required) {
      return
    }
    
    // Min length validation
    if (fieldRules.minLength) {
      fieldErrors = [...fieldErrors, ...validateMinLength(value, fieldRules.minLength, fieldRules.label || field)]
    }
    
    // Max length validation
    if (fieldRules.maxLength) {
      fieldErrors = [...fieldErrors, ...validateMaxLength(value, fieldRules.maxLength, fieldRules.label || field)]
    }
    
    // Email validation
    if (fieldRules.type === 'email') {
      fieldErrors = [...fieldErrors, ...validateEmail(value)]
    }
    
    // Custom validation
    if (fieldRules.validate) {
      const customErrors = fieldRules.validate(value, data)
      if (customErrors && customErrors.length > 0) {
        fieldErrors = [...fieldErrors, ...customErrors]
      }
    }
    
    if (fieldErrors.length > 0) {
      errors[field] = fieldErrors[0] // Only show first error
    }
  })
  
  return errors
}