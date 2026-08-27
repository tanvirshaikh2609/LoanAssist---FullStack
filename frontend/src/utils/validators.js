/**
 * Frontend Email Validation Utilities for LoanAssist.
 * Enforces RFC 5322 compliance, strict Top-Level Domain (TLD) validation,
 * internal whitespace rejection, and strict domain rules (such as @gmail.com).
 */

export const validateEmail = (rawEmail) => {
  if (!rawEmail || typeof rawEmail !== 'string') {
    return {
      isValid: false,
      error: 'Please enter a valid email address.'
    };
  }

  const trimmed = rawEmail.trim();

  if (!trimmed) {
    return {
      isValid: false,
      error: 'Please enter a valid email address.'
    };
  }

  // Reject internal whitespace (e.g., 'user @gmail.com')
  if (/\s/.test(trimmed)) {
    return {
      isValid: false,
      error: 'Please enter a valid email address.'
    };
  }

  // Must contain exactly one '@'
  const atCount = (trimmed.match(/@/g) || []).length;
  if (atCount !== 1) {
    return {
      isValid: false,
      error: 'Please enter a valid email address.'
    };
  }

  const [localPart, domain] = trimmed.split('@');

  // Both local-part and domain must be non-empty
  if (!localPart || !domain) {
    return {
      isValid: false,
      error: 'Please enter a valid email address.'
    };
  }

  // Local-part checks
  if (localPart.length > 64) {
    return {
      isValid: false,
      error: 'Please enter a valid email address.'
    };
  }

  if (
    localPart.startsWith('.') ||
    localPart.endsWith('.') ||
    localPart.includes('..')
  ) {
    return {
      isValid: false,
      error: 'Please enter a valid email address.'
    };
  }

  const localRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/;
  if (!localRegex.test(localPart)) {
    return {
      isValid: false,
      error: 'Please enter a valid email address.'
    };
  }

  // Domain checks
  if (domain.length > 255) {
    return {
      isValid: false,
      error: 'Please enter a valid email address.'
    };
  }

  if (
    domain.startsWith('.') ||
    domain.endsWith('.') ||
    domain.startsWith('-') ||
    domain.endsWith('-') ||
    domain.includes('..') ||
    !domain.includes('.')
  ) {
    return {
      isValid: false,
      error: 'Please enter a valid email address.'
    };
  }

  const domainLabels = domain.split('.');
  for (const label of domainLabels) {
    if (!label || label.startsWith('-') || label.endsWith('-')) {
      return {
        isValid: false,
        error: 'Please enter a valid email address.'
      };
    }
    if (!/^[a-zA-Z0-9-]+$/.test(label)) {
      return {
        isValid: false,
        error: 'Please enter a valid email address.'
      };
    }
  }

  const tld = domainLabels[domainLabels.length - 1];
  // TLD must consist only of letters and be between 2 and 24 characters
  if (!/^[a-zA-Z]{2,24}$/.test(tld)) {
    return {
      isValid: false,
      error: 'Please enter a valid email address.'
    };
  }

  const domainLower = domain.toLowerCase();

  // Strict check for Gmail domain
  if (domainLower.startsWith('gmail.') || domainLabels[0].toLowerCase() === 'gmail') {
    if (domainLower !== 'gmail.com') {
      return {
        isValid: false,
        error: 'Please enter a valid email address.'
      };
    }
  }

  const normalized = `${localPart}@${domainLower}`;

  return {
    isValid: true,
    normalized
  };
};

export const normalizeEmail = (email) => {
  if (!email || typeof email !== 'string') return '';
  return email.trim().toLowerCase();
};
