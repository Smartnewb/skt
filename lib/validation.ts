// Phone number validation and formatting
export const formatPhoneNumber = (value: string): string => {
    const numbers = value.replace(/[^\d]/g, '');

    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
};

export const validatePhoneNumber = (phone: string): boolean => {
    const numbers = phone.replace(/[^\d]/g, '');
    return numbers.length === 10 || numbers.length === 11;
};

// Business registration number formatting
export const formatBusinessNumber = (value: string): string => {
    const numbers = value.replace(/[^\d]/g, '');

    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 5) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 5)}-${numbers.slice(5, 10)}`;
};

export const validateBusinessNumber = (bizNumber: string): boolean => {
    const numbers = bizNumber.replace(/[^\d]/g, '');
    return numbers.length === 10;
};

// Email validation
export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Birth date validation (YYYY-MM-DD)
export const validateBirthDate = (date: string): boolean => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) return false;

    const dateObj = new Date(date);
    return dateObj instanceof Date && !isNaN(dateObj.getTime());
};

// Account number validation (basic)
export const validateAccountNumber = (accountNumber: string): boolean => {
    const numbers = accountNumber.replace(/[^\d]/g, '');
    return numbers.length >= 10 && numbers.length <= 14;
};

// Card number validation (basic Luhn algorithm)
export const validateCardNumber = (cardNumber: string): boolean => {
    const numbers = cardNumber.replace(/[^\d]/g, '');

    if (numbers.length < 15 || numbers.length > 16) return false;

    let sum = 0;
    let isEven = false;

    for (let i = numbers.length - 1; i >= 0; i--) {
        let digit = parseInt(numbers[i]);

        if (isEven) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }

        sum += digit;
        isEven = !isEven;
    }

    return sum % 10 === 0;
};

// Card expiry validation (MM/YY)
export const validateCardExpiry = (expiry: string): boolean => {
    const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!expiryRegex.test(expiry)) return false;

    const [month, year] = expiry.split('/');
    const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
    const now = new Date();

    return expiryDate > now;
};

// Format currency (KRW)
export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('ko-KR').format(amount) + '원';
};
