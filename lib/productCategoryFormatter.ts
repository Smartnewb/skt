// Helper function to format product category in Korean
export function formatProductCategory(category?: string): string {
    switch (category) {
        case 'INTERNET_ONLY':
            return '인터넷 단독';
        case 'INTERNET_PHONE':
            return '인터넷 + 전화';
        case 'INTERNET_TV':
            return '인터넷 + TV';
        default:
            return '-';
    }
}
