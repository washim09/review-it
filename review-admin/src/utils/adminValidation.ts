// src/utils/adminValidation.ts
import DOMPurify from 'dompurify';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface AdminLoginData {
  name: string;
  password: string;
}

export interface AdminRegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  inviteCode: string;
}

/**
 * Admin-specific validation utilities with enhanced security
 */
export class AdminValidation {
  
  // Rate limiting for admin login attempts
  private static loginAttempts: Map<string, { count: number; lastAttempt: number }> = new Map();
  private static readonly MAX_LOGIN_ATTEMPTS = 5;
  private static readonly LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

  /**
   * Sanitize input to prevent XSS attacks
   */
  static sanitizeInput(input: string): string {
    if (typeof input !== 'string') return '';
    return DOMPurify.sanitize(input.trim());
  }

  /**
   * Validate admin name with strict requirements
   */
  static validateAdminName(name: string): ValidationResult {
    const errors: string[] = [];
    const sanitizedName = this.sanitizeInput(name);

    if (!sanitizedName) {
      errors.push('Admin name is required');
    } else {
      if (sanitizedName.length < 3) {
        errors.push('Admin name must be at least 3 characters long');
      }
      if (sanitizedName.length > 50) {
        errors.push('Admin name must not exceed 50 characters');
      }
      if (!/^[a-zA-Z0-9_-]+$/.test(sanitizedName)) {
        errors.push('Admin name can only contain letters, numbers, hyphens, and underscores');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate email with comprehensive checks
   */
  static validateEmail(email: string): ValidationResult {
    const errors: string[] = [];
    const sanitizedEmail = this.sanitizeInput(email);

    if (!sanitizedEmail) {
      errors.push('Email is required');
    } else {
      // Enhanced email regex pattern
      const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
      
      if (!emailRegex.test(sanitizedEmail)) {
        errors.push('Please enter a valid email address');
      }
      
      if (sanitizedEmail.length > 254) {
        errors.push('Email address is too long');
      }

      // Check for common admin email patterns (optional security measure)
      const adminEmailPatterns = ['admin@', 'administrator@', 'root@'];
      const hasAdminPattern = adminEmailPatterns.some(pattern => 
        sanitizedEmail.toLowerCase().includes(pattern)
      );
      
      if (hasAdminPattern) {
        // This is just a warning, not an error

      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate password with strong security requirements
   */
  static validatePassword(password: string): ValidationResult {
    const errors: string[] = [];

    if (!password) {
      errors.push('Password is required');
    } else {
      if (password.length < 12) {
        errors.push('Password must be at least 12 characters long');
      }
      if (password.length > 128) {
        errors.push('Password must not exceed 128 characters');
      }
      if (!/(?=.*[a-z])/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
      }
      if (!/(?=.*[A-Z])/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
      }
      if (!/(?=.*\d)/.test(password)) {
        errors.push('Password must contain at least one number');
      }
      if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(password)) {
        errors.push('Password must contain at least one special character');
      }

      // Check for common weak passwords
      const commonPasswords = [
        'password', 'admin', 'administrator', '123456', 'qwerty',
        'password123', 'admin123', 'welcome', 'login', 'root'
      ];
      
      if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
        errors.push('Password contains common patterns and is not secure');
      }

      // Check for sequential characters
      if (/(.)\1{2,}/.test(password)) {
        errors.push('Password should not contain repeated characters');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate password confirmation
   */
  static validatePasswordConfirmation(password: string, confirmPassword: string): ValidationResult {
    const errors: string[] = [];

    if (!confirmPassword) {
      errors.push('Password confirmation is required');
    } else if (password !== confirmPassword) {
      errors.push('Passwords do not match');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate invite code with security checks
   */
  static validateInviteCode(inviteCode: string): ValidationResult {
    const errors: string[] = [];
    const sanitizedCode = this.sanitizeInput(inviteCode);

    if (!sanitizedCode) {
      errors.push('Invite code is required');
    } else {
      if (sanitizedCode.length < 8) {
        errors.push('Invite code must be at least 8 characters long');
      }
      if (sanitizedCode.length > 64) {
        errors.push('Invite code is too long');
      }
      if (!/^[a-zA-Z0-9-_]+$/.test(sanitizedCode)) {
        errors.push('Invite code contains invalid characters');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Check rate limiting for login attempts
   */
  static checkRateLimit(identifier: string): ValidationResult {
    const now = Date.now();
    const attempt = this.loginAttempts.get(identifier);

    if (attempt) {
      // Reset if lockout period has passed
      if (now - attempt.lastAttempt > this.LOCKOUT_DURATION) {
        this.loginAttempts.delete(identifier);
        return { isValid: true, errors: [] };
      }

      // Check if max attempts exceeded
      if (attempt.count >= this.MAX_LOGIN_ATTEMPTS) {
        const remainingTime = Math.ceil((this.LOCKOUT_DURATION - (now - attempt.lastAttempt)) / 60000);
        return {
          isValid: false,
          errors: [`Too many login attempts. Please try again in ${remainingTime} minutes.`]
        };
      }
    }

    return { isValid: true, errors: [] };
  }

  /**
   * Record login attempt
   */
  static recordLoginAttempt(identifier: string, success: boolean): void {
    const now = Date.now();
    const attempt = this.loginAttempts.get(identifier);

    if (success) {
      // Clear attempts on successful login
      this.loginAttempts.delete(identifier);
    } else {
      // Increment failed attempts
      if (attempt) {
        this.loginAttempts.set(identifier, {
          count: attempt.count + 1,
          lastAttempt: now
        });
      } else {
        this.loginAttempts.set(identifier, {
          count: 1,
          lastAttempt: now
        });
      }
    }
  }

  /**
   * Comprehensive admin login validation
   */
  static validateAdminLogin(data: AdminLoginData): ValidationResult {
    const errors: string[] = [];

    // Rate limiting check
    const rateLimitResult = this.checkRateLimit(data.name);
    if (!rateLimitResult.isValid) {
      return rateLimitResult;
    }

    // Validate admin name
    const nameResult = this.validateAdminName(data.name);
    if (!nameResult.isValid) {
      errors.push(...nameResult.errors);
    }

    // Basic password presence check (detailed validation happens on server)
    if (!data.password) {
      errors.push('Password is required');
    } else if (data.password.length < 8) {
      errors.push('Password is too short');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Comprehensive admin registration validation
   */
  static validateAdminRegistration(data: AdminRegisterData): ValidationResult {
    const errors: string[] = [];

    // Validate all fields
    const nameResult = this.validateAdminName(data.name);
    const emailResult = this.validateEmail(data.email);
    const passwordResult = this.validatePassword(data.password);
    const confirmPasswordResult = this.validatePasswordConfirmation(data.password, data.confirmPassword);
    const inviteCodeResult = this.validateInviteCode(data.inviteCode);

    // Collect all errors
    if (!nameResult.isValid) errors.push(...nameResult.errors);
    if (!emailResult.isValid) errors.push(...emailResult.errors);
    if (!passwordResult.isValid) errors.push(...passwordResult.errors);
    if (!confirmPasswordResult.isValid) errors.push(...confirmPasswordResult.errors);
    if (!inviteCodeResult.isValid) errors.push(...inviteCodeResult.errors);

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get password strength score (0-100)
   */
  static getPasswordStrength(password: string): number {
    let score = 0;

    if (password.length >= 12) score += 25;
    if (password.length >= 16) score += 10;
    if (/(?=.*[a-z])/.test(password)) score += 15;
    if (/(?=.*[A-Z])/.test(password)) score += 15;
    if (/(?=.*\d)/.test(password)) score += 15;
    if (/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(password)) score += 20;

    return Math.min(score, 100);
  }

  /**
   * Get password strength label
   */
  static getPasswordStrengthLabel(score: number): { label: string; color: string } {
    if (score < 30) return { label: 'Very Weak', color: 'text-red-600' };
    if (score < 50) return { label: 'Weak', color: 'text-orange-600' };
    if (score < 70) return { label: 'Fair', color: 'text-yellow-600' };
    if (score < 90) return { label: 'Good', color: 'text-blue-600' };
    return { label: 'Excellent', color: 'text-green-600' };
  }
}
