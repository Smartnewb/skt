// Bank account number formatting rules based on 금융결제원 CMS (2025.12.22)
// Each bank can have multiple formats depending on account length

export interface BankFormat {
    length: number;
    format: number[]; // Sections to split with hyphens, e.g., [4, 2, 6] = XXXX-XX-XXXXXX
}

export const BANK_FORMATS: Record<string, BankFormat[]> = {
    // KB국민은행
    'KB': [
        { length: 12, format: [4, 2, 6] },  // 1234-56-789012
        { length: 14, format: [6, 2, 6] },  // 123456-78-901234
    ],
    '004': [
        { length: 12, format: [4, 2, 6] },
        { length: 14, format: [6, 2, 6] },
    ],

    // 신한은행 (조흥 통합)
    'SH': [
        { length: 11, format: [3, 2, 6] },  // 110-12-123456
        { length: 12, format: [3, 3, 6] },  // 110-123-456789
        { length: 14, format: [3, 3, 4, 4] }, // 562-123-1234-1234 (가상)
    ],
    '088': [
        { length: 11, format: [3, 2, 6] },
        { length: 12, format: [3, 3, 6] },
        { length: 14, format: [3, 3, 4, 4] },
    ],

    // 우리은행
    'WR': [
        { length: 13, format: [4, 3, 6] },  // 1002-123-456789
    ],
    '020': [
        { length: 13, format: [4, 3, 6] },
    ],

    // 하나은행
    'HN': [
        { length: 14, format: [3, 6, 5] },  // 123-123456-12345
    ],
    '081': [
        { length: 14, format: [3, 6, 5] },
    ],

    // NH농협은행
    'NH': [
        { length: 13, format: [3, 4, 4, 2] }, // 302-1234-5678-01
        { length: 11, format: [3, 2, 6] },    // 352-12-123456
    ],
    '011': [
        { length: 13, format: [3, 4, 4, 2] },
        { length: 11, format: [3, 2, 6] },
    ],

    // 카카오뱅크
    'KK': [
        { length: 13, format: [4, 2, 7] },  // 3333-01-1234567
    ],
    '090': [
        { length: 13, format: [4, 2, 7] },
    ],

    // 토스뱅크
    'TOS': [
        { length: 12, format: [3, 8, 1] },  // 100-12345678-1
    ],
    '092': [
        { length: 12, format: [3, 8, 1] },
    ],

    // IBK기업은행
    'IBK': [
        { length: 14, format: [3, 6, 5] },  // 123-123456-01234
        { length: 11, format: [3, 2, 6] },  // 011-01-123456
    ],
    '003': [
        { length: 14, format: [3, 6, 5] },
        { length: 11, format: [3, 2, 6] },
    ],

    // K뱅크
    '089': [
        { length: 12, format: [3, 3, 6] },  // 100-123-100123
    ],

    // SC제일은행
    'SC': [
        { length: 11, format: [3, 2, 6] },  // 301-12-123456
    ],
};

/**
 * Format account number with hyphens based on bank rules
 * @param bankCode - Bank code (e.g., 'KB', '004', 'KK')
 * @param accountNumber - Raw account number (digits only or with hyphens)
 * @returns Formatted account number with hyphens
 */
export function formatAccountNumber(bankCode: string, accountNumber: string): string {
    // 1. Remove all non-digits
    const cleanNumber = accountNumber.replace(/[^0-9]/g, '');

    // 2. Get formatting rules for this bank
    const rules = BANK_FORMATS[bankCode];
    if (!rules || rules.length === 0) {
        // No rules found - return as-is (just cleaned)
        return cleanNumber;
    }

    // 3. Find matching rule for current length
    // For input in progress, use longest rule as template
    const exactRule = rules.find(r => r.length === cleanNumber.length);
    const targetRule = exactRule || rules[rules.length - 1];

    if (!targetRule) return cleanNumber;

    // 4. Apply hyphen formatting
    let formatted = '';
    let index = 0;

    for (let i = 0; i < targetRule.format.length; i++) {
        const sectionLen = targetRule.format[i];

        if (index >= cleanNumber.length) break;

        // Extract this section
        const chunk = cleanNumber.substring(index, index + sectionLen);
        formatted += chunk;
        index += sectionLen;

        // Add hyphen if not last section and more digits remain
        if (i < targetRule.format.length - 1 && index < cleanNumber.length) {
            formatted += '-';
        }
    }

    return formatted;
}

/**
 * Validate account number format
 * @param bankCode - Bank code
 * @param accountNumber - Account number to validate
 * @returns Object with isValid flag and error message
 */
export function validateAccountFormat(
    bankCode: string,
    accountNumber: string
): { isValid: boolean; error?: string } {
    const cleanNumber = accountNumber.replace(/[^0-9]/g, '');
    const rules = BANK_FORMATS[bankCode];

    if (!rules || rules.length === 0) {
        // No specific rules - allow 7-14 digits
        if (cleanNumber.length < 7 || cleanNumber.length > 14) {
            return {
                isValid: false,
                error: '계좌번호는 7~14자리 숫자여야 합니다'
            };
        }
        return { isValid: true };
    }

    // Check if length matches any rule
    const validLengths = rules.map(r => r.length);
    if (!validLengths.includes(cleanNumber.length)) {
        return {
            isValid: false,
            error: `이 은행의 계좌번호는 ${validLengths.join(' 또는 ')}자리여야 합니다`
        };
    }

    return { isValid: true };
}

/**
 * Get expected length info for a bank
 * @param bankCode - Bank code
 * @returns Array of valid lengths
 */
export function getValidLengths(bankCode: string): number[] {
    const rules = BANK_FORMATS[bankCode];
    if (!rules || rules.length === 0) {
        return [7, 8, 9, 10, 11, 12, 13, 14]; // Default range
    }
    return rules.map(r => r.length);
}
