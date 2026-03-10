/**
 * Input sanitization utilities for XSS prevention
 */

// Basic HTML entity encoding
export const encodeHtml = (str) => {
  if (!str || typeof str !== 'string') return str;
  
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/\//g, '&#x2F;');
};

// Sanitize student name - remove potentially dangerous characters
export const sanitizeStudentName = (name) => {
  if (!name || typeof name !== 'string') return '';
  
  // Remove script tags and dangerous attributes
  let sanitized = name
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
  
  // Trim and limit length
  sanitized = sanitized.trim().substring(0, 100);
  
  // Encode HTML entities
  return encodeHtml(sanitized);
};

// Validate age input
export const validateAge = (age) => {
  const numAge = parseInt(age);
  return !isNaN(numAge) && numAge >= 6 && numAge <= 100 ? numAge : null;
};

// Validate classroom ID
export const validateClassroomId = (classroomId) => {
  const numId = parseInt(classroomId);
  return !isNaN(numId) && numId > 0 ? numId : null;
};

// Comprehensive input validation for student data
export const validateStudentData = (data) => {
  const errors = [];
  
  if (!data.name || typeof data.name !== 'string') {
    errors.push('Student name is required');
  } else {
    const sanitizedName = sanitizeStudentName(data.name);
    if (sanitizedName.length < 2) {
      errors.push('Student name must be at least 2 characters');
    }
    if (sanitizedName !== data.name.trim()) {
      errors.push('Student name contains invalid characters');
    }
  }
  
  const validatedAge = validateAge(data.age);
  if (validatedAge === null) {
    errors.push('Age must be between 6 and 100');
  }
  
  const validatedClassroomId = validateClassroomId(data.classroomId);
  if (validatedClassroomId === null) {
    errors.push('Classroom ID must be a positive number');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitized: {
      name: sanitizeStudentName(data.name || ''),
      age: validatedAge,
      classroomId: validatedClassroomId
    }
  };
};
