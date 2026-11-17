/**
 * Indian Vehicle Registration & Phone Number Validation Utilities
 * Validates State Series (KA, MH, DL, TN, etc.) and MoRTH Bharat Series (BH).
 * Validates Indian 10-digit mobile numbers with operator prefix checks (6, 7, 8, 9).
 */

export interface VehicleValidationResult {
  isValid: boolean;
  type: 'STATE_SERIES' | 'BH_SERIES' | 'INVALID';
  stateCode?: string;
  stateName?: string;
  formatted: string;
  error?: string;
}

export interface PhoneValidationResult {
  isValid: boolean;
  cleanDigits: string;
  formatted: string;
  error?: string;
}

// Indian State and Union Territory RTO codes
export const INDIAN_STATES: Record<string, string> = {
  KA: 'Karnataka',
  MH: 'Maharashtra',
  DL: 'Delhi',
  TN: 'Tamil Nadu',
  TS: 'Telangana',
  AP: 'Andhra Pradesh',
  KL: 'Kerala',
  GA: 'Goa',
  GJ: 'Gujarat',
  HR: 'Haryana',
  UP: 'Uttar Pradesh',
  WB: 'West Bengal',
  MP: 'Madhya Pradesh',
  RJ: 'Rajasthan',
  PB: 'Punjab',
  CH: 'Chandigarh',
  OD: 'Odisha',
  JH: 'Jharkhand',
  BR: 'Bihar',
  AS: 'Assam',
  UK: 'Uttarakhand',
  HP: 'Himachal Pradesh',
  JK: 'Jammu & Kashmir',
  LA: 'Ladakh',
  PY: 'Puducherry',
  TR: 'Tripura',
  ML: 'Meghalaya',
  MN: 'Manipur',
  NL: 'Nagaland',
  MZ: 'Mizoram',
  AR: 'Arunachal Pradesh',
  SK: 'Sikkim',
  CG: 'Chhattisgarh',
  DD: 'Daman & Diu',
  DN: 'Dadra & Nagar Haveli',
  LD: 'Lakshadweep',
  AN: 'Andaman & Nicobar'
};

/**
 * Validates and formats Indian vehicle registration numbers
 * Supports:
 * 1. Standard State/UT format (e.g., KA 05 MN 1234, KA-01-AB-1234, MH 12 CD 5678, MH-02-1234)
 * 2. Bharat Series format (e.g., 22 BH 1234 AA, 21-BH-9999-AB, 23 BH 5678 B)
 */
export function validateVehicleNumber(input: string): VehicleValidationResult {
  if (!input || !input.trim()) {
    return {
      isValid: false,
      type: 'INVALID',
      formatted: '',
      error: 'Vehicle registration number is required.'
    };
  }

  // Remove all non-alphanumeric characters and convert to uppercase
  const clean = input.toUpperCase().replace(/[^A-Z0-9]/g, '');

  if (clean.length < 5) {
    return {
      isValid: false,
      type: 'INVALID',
      formatted: input.toUpperCase().trim(),
      error: 'Registration number is too short. (e.g. KA 05 MN 1234 or 22 BH 1234 AA)'
    };
  }

  // 1. Check Bharat Series (BH)
  // Format: YY BH #### XX (e.g., 22 BH 1234 AA, 21 BH 9999 A)
  // Clean string regex: ^(\d{2})BH(\d{4})([A-Z]{1,2})$
  const bhMatch = clean.match(/^(\d{2})BH(\d{4})([A-Z]{1,2})$/);
  if (bhMatch) {
    const [, year, num, series] = bhMatch;
    const formatted = `${year} BH ${num} ${series}`;
    return {
      isValid: true,
      type: 'BH_SERIES',
      stateCode: 'BH',
      stateName: 'Bharat Series (BH)',
      formatted
    };
  }

  // Also check if user typed BH but in a slightly different spacing or 1-4 digits
  const bhPartialMatch = clean.match(/^(\d{2})BH(\d{1,4})([A-Z]{1,2})?$/);
  if (bhPartialMatch) {
    const [, year, num, series = ''] = bhPartialMatch;
    if (num.length !== 4) {
      return {
        isValid: false,
        type: 'INVALID',
        formatted: input.toUpperCase().trim(),
        error: `BH Series requires a 4-digit number (e.g. ${year} BH ${num.padStart(4, '0')} ${series || 'AA'})`
      };
    }
  }

  // 2. Check Standard State Series
  // Clean string regex: ^([A-Z]{2})(\d{1,2})([A-Z]{0,3})(\d{1,4})$
  const stateMatch = clean.match(/^([A-Z]{2})(\d{1,2})([A-Z]{0,3})(\d{1,4})$/);
  if (stateMatch) {
    const [, stateCode, rto, series, num] = stateMatch;
    
    // Check if the 2-letter code is a known Indian state/UT code
    const stateName = INDIAN_STATES[stateCode];
    if (!stateName) {
      return {
        isValid: false,
        type: 'INVALID',
        formatted: input.toUpperCase().trim(),
        error: `Unknown state code '${stateCode}'. Valid codes include KA, MH, DL, TN, etc.`
      };
    }

    // Number should ideally be 1 to 4 digits, padded to 4 digits for standard display if 4 digits entered
    const paddedRto = rto.length === 1 ? `0${rto}` : rto;
    const paddedNum = num.padStart(4, '0');
    const seriesPart = series ? ` ${series}` : '';
    const formatted = `${stateCode} ${paddedRto}${seriesPart} ${paddedNum}`;

    return {
      isValid: true,
      type: 'STATE_SERIES',
      stateCode,
      stateName: `${stateName} (${stateCode})`,
      formatted
    };
  }

  // Fallback / Helpful guidance based on partial input
  if (clean.startsWith('KA')) {
    return {
      isValid: false,
      type: 'INVALID',
      formatted: input.toUpperCase().trim(),
      error: 'Invalid Karnataka format. Expected e.g. KA 05 MN 1234 or KA-01-AB-1234'
    };
  }

  if (clean.startsWith('MH')) {
    return {
      isValid: false,
      type: 'INVALID',
      formatted: input.toUpperCase().trim(),
      error: 'Invalid Maharashtra format. Expected e.g. MH 12 AB 1234 or MH-02-CD-5678'
    };
  }

  if (clean.includes('BH')) {
    return {
      isValid: false,
      type: 'INVALID',
      formatted: input.toUpperCase().trim(),
      error: 'Invalid Bharat Series format. Expected e.g. 22 BH 1234 AA'
    };
  }

  return {
    isValid: false,
    type: 'INVALID',
    formatted: input.toUpperCase().trim(),
    error: 'Invalid registration number. Format: KA 05 MN 1234, MH 12 CD 5678, or 22 BH 1234 AA'
  };
}

/**
 * Validates Indian Customer Phone Number
 * - Strips non-digits
 * - Handles +91 and leading 0 prefixes
 * - Requires exactly 10 digits
 * - Requires Indian mobile operator starting digit (6, 7, 8, 9)
 */
export function validatePhoneNumber(input: string, isRequired: boolean = false): PhoneValidationResult {
  if (!input || !input.trim()) {
    return {
      isValid: !isRequired,
      cleanDigits: '',
      formatted: '',
      error: isRequired ? 'Customer phone number is required.' : undefined
    };
  }

  // Extract digits only
  let digits = input.replace(/\D/g, '');

  // Strip international +91 if length is 12 and starts with 91
  if (digits.length === 12 && digits.startsWith('91')) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1);
  }

  // Check length
  if (digits.length < 10) {
    return {
      isValid: false,
      cleanDigits: digits,
      formatted: digits,
      error: `Phone number must be 10 digits (${digits.length}/10 entered)`
    };
  }

  if (digits.length > 10) {
    return {
      isValid: false,
      cleanDigits: digits.slice(0, 10),
      formatted: digits.slice(0, 10),
      error: 'Phone number cannot exceed 10 digits'
    };
  }

  // Check leading digit for Indian mobile numbers (6, 7, 8, 9)
  if (!/^[6-9]/.test(digits)) {
    return {
      isValid: false,
      cleanDigits: digits,
      formatted: digits,
      error: 'Indian mobile number must start with 6, 7, 8, or 9'
    };
  }

  // Formatted: 5 digits - space - 5 digits
  const formatted = `${digits.slice(0, 5)} ${digits.slice(5)}`;

  return {
    isValid: true,
    cleanDigits: digits,
    formatted
  };
}
