/**
 * Validates Sri Lankan mobile number formats
 * Supports: +94762199100, 762199100, 0762199100
 */
export const validateSriLankanMobile = (mobile) => {
    if (!mobile) return false;

    // Remove spaces and hyphens
    const cleaned = mobile.replace(/[\s-]/g, '');

    // Patterns for Sri Lankan mobile numbers
    const patterns = [
        /^\+947\d{8}$/,     // +94762199100
        /^7\d{8}$/,         // 762199100
        /^07\d{8}$/,        // 0762199100
    ];

    return patterns.some(pattern => pattern.test(cleaned));
};

/**
 * Normalizes mobile number to 0762199100 format
 */
export const normalizeMobileNumber = (mobile) => {
    if (!mobile) return '';

    // Remove spaces and hyphens
    let cleaned = mobile.replace(/[\s-]/g, '');

    // Convert +94762199100 to 0762199100
    if (cleaned.startsWith('+94')) {
        cleaned = '0' + cleaned.substring(3);
    }
    // Convert 762199100 to 0762199100
    else if (cleaned.length === 9 && cleaned.startsWith('7')) {
        cleaned = '0' + cleaned;
    }

    return cleaned;
};

/**
 * Formats mobile number for display
 */
export const formatMobileNumber = (mobile) => {
    const normalized = normalizeMobileNumber(mobile);
    if (normalized.length === 10) {
        return `${normalized.substring(0, 3)} ${normalized.substring(3, 6)} ${normalized.substring(6)}`;
    }
    return mobile;
};
