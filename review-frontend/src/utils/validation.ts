// Enhanced validation utilities with comprehensive security features

// Input sanitization function
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  // Remove HTML tags and encode special characters
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>"'&]/g, (match) => {
      const entityMap: { [key: string]: string } = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;'
      };
      return entityMap[match];
    })
    .trim();
};

// Enhanced email validation with genuine email checks
export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }

  // Sanitize input
  const sanitizedEmail = sanitizeInput(email);
  
  // Enhanced email regex that requires proper domain structure
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  
  if (!emailRegex.test(sanitizedEmail)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  // Additional checks for common invalid patterns
  const domain = sanitizedEmail.split('@')[1];
  
  // Check if domain has at least one dot and proper TLD
  if (!domain || !domain.includes('.') || domain.endsWith('.') || domain.startsWith('.')) {
    return { isValid: false, error: 'Please enter a valid email address with a proper domain' };
  }

  // Check for minimum TLD length (at least 2 characters)
  const tld = domain.split('.').pop();
  if (!tld || tld.length < 2) {
    return { isValid: false, error: 'Please enter a valid email address with a proper domain extension' };
  }

  return { isValid: true };
};

// Comprehensive password validation with strength requirements
export const validatePassword = (password: string): { isValid: boolean; error?: string; strength: string } => {
  if (!password) {
    return { isValid: false, error: 'Password is required', strength: 'none' };
  }

  const minLength = 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const errors = [];
  
  if (password.length < minLength) {
    errors.push(`at least ${minLength} characters`);
  }
  if (!hasUppercase) {
    errors.push('one uppercase letter');
  }
  if (!hasLowercase) {
    errors.push('one lowercase letter');
  }
  if (!hasNumbers) {
    errors.push('one number');
  }
  if (!hasSpecialChar) {
    errors.push('one special character (!@#$%^&*)');
  }

  if (errors.length > 0) {
    return {
      isValid: false,
      error: `Password must contain ${errors.join(', ')}`,
      strength: 'weak'
    };
  }

  // Calculate password strength
  let strength = 'medium';
  if (password.length >= 12 && hasUppercase && hasLowercase && hasNumbers && hasSpecialChar) {
    strength = 'strong';
  }

  return { isValid: true, strength };
};

// Validate name fields
export const validateName = (name: string): { isValid: boolean; error?: string } => {
  if (!name) {
    return { isValid: false, error: 'Name is required' };
  }

  const sanitizedName = sanitizeInput(name);
  
  if (sanitizedName.length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters long' };
  }

  if (sanitizedName.length > 50) {
    return { isValid: false, error: 'Name must be less than 50 characters' };
  }

  // Only allow letters, spaces, hyphens, and apostrophes
  const nameRegex = /^[a-zA-Z\s'-]+$/;
  if (!nameRegex.test(sanitizedName)) {
    return { isValid: false, error: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
  }

  return { isValid: true };
};

// Rate limiting utility
class RateLimiter {
  private attempts: Map<string, { count: number; lastAttempt: number }> = new Map();
  private maxAttempts: number;
  private windowMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) { // 5 attempts per 15 minutes
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  isAllowed(identifier: string): { allowed: boolean; remainingTime?: number } {
    const now = Date.now();
    const record = this.attempts.get(identifier);

    if (!record) {
      this.attempts.set(identifier, { count: 1, lastAttempt: now });
      return { allowed: true };
    }

    // Reset if window has passed
    if (now - record.lastAttempt > this.windowMs) {
      this.attempts.set(identifier, { count: 1, lastAttempt: now });
      return { allowed: true };
    }

    // Check if limit exceeded
    if (record.count >= this.maxAttempts) {
      const remainingTime = this.windowMs - (now - record.lastAttempt);
      return { allowed: false, remainingTime };
    }

    // Increment count
    record.count++;
    record.lastAttempt = now;
    return { allowed: true };
  }

  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }
}

// Export rate limiter instance
export const loginRateLimiter = new RateLimiter(5, 15 * 60 * 1000); // 5 attempts per 15 minutes

// Utility to format remaining time
export const formatRemainingTime = (ms: number): string => {
  const minutes = Math.ceil(ms / (60 * 1000));
  return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
};